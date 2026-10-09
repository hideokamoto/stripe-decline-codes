#!/usr/bin/env npx tsx
/**
 * Check whether the library's decline code database is in sync with
 * Stripe's official decline code documentation.
 *
 * Fetches https://docs.stripe.com/declines/codes.md (English, pinned via
 * ?locale=en-US + Accept-Language), parses the "Card decline codes" table,
 * and diffs it against DECLINE_CODES.
 *
 * Exit codes:
 *   0 - in sync (warnings about codes deprecated upstream or absent from the
 *       docs table may still be printed)
 *   1 - docs-active codes are missing from the library, or the upstream
 *       document could not be fetched/parsed
 */

const DOCS_URL = 'https://docs.stripe.com/declines/codes.md?locale=en-US';
const FETCH_TIMEOUT_MS = 30_000;
const FETCH_ATTEMPTS = 3;
const FETCH_RETRY_DELAY_MS = 2_000;

interface DocsCodes {
  active: Set<string>;
  deprecated: Set<string>;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function describeError(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

async function fetchDocsMarkdown(): Promise<string> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= FETCH_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(DOCS_URL, {
        headers: { 'Accept-Language': 'en-US' },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.text();
    } catch (err) {
      lastError = err;
      if (attempt < FETCH_ATTEMPTS) {
        console.warn(
          `Fetch attempt ${attempt}/${FETCH_ATTEMPTS} failed (${describeError(err)}); retrying in ${FETCH_RETRY_DELAY_MS / 1000}s...`,
        );
        await sleep(FETCH_RETRY_DELAY_MS);
      }
    }
  }
  throw new Error(
    `Failed to fetch ${DOCS_URL} after ${FETCH_ATTEMPTS} attempts: ${describeError(lastError)}`,
  );
}

async function fetchDocsCodes(): Promise<DocsCodes> {
  const markdown = await fetchDocsMarkdown();

  // Fail loudly if the document doesn't look like the English decline-codes
  // page — protects against a silent locale or format change upstream.
  const h1 = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim();
  if (h1 !== 'Stripe decline codes') {
    throw new Error(
      `Unexpected H1 in fetched document: expected "# Stripe decline codes", got ${h1 === undefined ? 'no H1' : `"# ${h1}"`}`,
    );
  }

  // Isolate the "Card decline codes" section (ends at the next h2 heading).
  const sectionMatch = markdown.match(/##\s+Card decline codes([\s\S]*?)(?=\n##\s|$)/);
  if (!sectionMatch) {
    throw new Error('Could not locate the "Card decline codes" section in the fetched document');
  }
  const section = sectionMatch[1];

  const active = new Set<string>();
  const deprecated = new Set<string>();
  for (const line of section.split('\n')) {
    // Rows look like: `| `code` | ...` or `| (Deprecated)`code` | ...`
    // (code names may contain digits; the deprecated marker casing varies)
    const row = line.match(/^\|\s*(\(Deprecated\)\s*)?`([a-z0-9_]+)`\s*\|/i);
    if (row) {
      (row[1] ? deprecated : active).add(row[2]);
    }
  }
  if (active.size === 0) {
    throw new Error('Parsed zero decline codes — upstream table format may have changed');
  }
  return { active, deprecated };
}

function diff(a: Set<string>, b: Set<string>): string[] {
  return [...a].filter((x) => !b.has(x)).sort();
}

async function main() {
  const { DECLINE_CODES, DOC_VERSION } = await import('../src/index.js');
  const libCodes = new Set(Object.keys(DECLINE_CODES));

  const docs = await fetchDocsCodes();
  const docsAll = new Set([...docs.active, ...docs.deprecated]);

  console.log(`Docs: ${docs.active.size} active + ${docs.deprecated.size} deprecated codes`);
  console.log(`Library (DOC_VERSION ${DOC_VERSION}): ${libCodes.size} codes\n`);

  const missing = diff(docs.active, libCodes);
  const removed = diff(libCodes, docsAll);
  const deprecatedUpstream = diff(libCodes, docs.active).filter((c) => docs.deprecated.has(c));

  if (deprecatedUpstream.length > 0) {
    console.log('WARN: in library but marked deprecated upstream:');
    for (const c of deprecatedUpstream) console.log(`  - ${c}`);
    console.log('');
  }

  if (removed.length > 0) {
    console.log('WARN: codes in the library but absent from the docs table:');
    for (const c of removed) console.log(`  - ${c}`);
    console.log(
      '  Note: the library deliberately keeps deprecated-but-still-valid codes\n' +
        '  that Stripe may drop from the docs entirely (e.g. do_not_try_again).',
    );
    console.log('');
  }

  if (missing.length > 0) {
    console.log('FAIL: codes documented by Stripe but missing from the library:');
    for (const c of missing) console.log(`  - ${c}`);
    console.log('');
    process.exit(1);
  }

  console.log('In sync with Stripe documentation.');
}

main().catch((err) => {
  console.error('FAIL:', err instanceof Error ? err.message : err);
  process.exit(1);
});

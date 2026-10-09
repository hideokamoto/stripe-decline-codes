# AGENTS.md

## Project overview

Zero-dependency TypeScript library: a complete database of Stripe decline codes
with descriptions and localized (en/ja) user-facing messages.
Published to npm as `stripe-decline-codes`.

- `src/` — library source (`index.ts`, `types.ts`, `data/decline-codes.ts`)
- `tests` live next to sources (`src/index.test.ts`)
- `docs/` — **separate npm project** (Starlight site for GitHub Pages). It has its own
  `package.json` / `package-lock.json` and intentionally stays on npm.
- `docs-data/` — generated API data shipped in the package (`files` includes it)

## Commands

The root package uses **pnpm** (`packageManager: pnpm@10.34.5`). Use pnpm, not npm.

```bash
pnpm install
pnpm test            # vitest (Node)
pnpm run test:workers  # vitest in real workerd via @cloudflare/vitest-plugin
pnpm run lint        # biome check
pnpm run lint:fix    # biome check --write
pnpm run format      # biome format --write
pnpm run typecheck   # tsc --noEmit + tests/workers
pnpm run build       # vite build && tsc -> dist/
```

`pnpm-workspace.yaml` sets `onlyBuiltDependencies`/`allowBuilds` for `esbuild`
(vite/vitest need its install script) and `workerd` (the Workers runtime binary).
Do not remove them — `pnpm install` fails with `ERR_PNPM_IGNORED_BUILDS` without it.

Workerd tests live in `tests/workers/` and run through `vitest.workers.config.ts`
(the `cloudflareTest()` plugin from `@cloudflare/vitest-plugin`, which requires
vitest ^4.1). The main `vite.config.ts` suite only includes `src/**/*.test.ts`,
so Workers tests never run in the Node suite.

For the docs site, use npm inside `docs/` (`cd docs && npm ci && npm run build`).

## Releases (automated — do not release manually)

Every push to `main` triggers the CircleCI pipeline **"npm publish"**:

- Config source: `hideokamoto/circleci-configurations`,
  `workflows/publish/npm-polyrepo-semantic-release.yaml` (no release YAML lives here)
- Flow: `test` job -> `release` job runs semantic-release: decides the next version from
  Conventional Commits since the latest `v*` tag, verifies npm OIDC + git push access,
  pushes the `v*` tag, publishes via npm Trusted Publishing (OIDC), and creates the
  GitHub Release. No Release PR; nothing is committed back to `main`.
- Config: `.releaserc.json` (preset `conventionalcommits`, so `feat!:` is a major bump)
- Trigger preset: `default-branch-pushes`

### Commit convention (required)

semantic-release reads **every commit** reachable since the last tag, including the
individual commits inside a merged PR branch (not just the merge subject).
`feat:` -> minor, `fix:` / `perf:` -> patch, `feat!:` or a `BREAKING CHANGE:` footer -> major.
`chore:` / `docs:` / `ci:` / `test:` / merge commits do not release.
Do not write `BREAKING CHANGE:` in a commit body unless you mean a major release.

Agents MUST write Conventional Commit messages and must never bypass the hook
(`--no-verify`):

- Local: husky `commit-msg` hook runs commitlint with
  `@commitlint/config-conventional` (`commitlint.config.js`). Active after
  `pnpm install` (husky `prepare` script sets `core.hooksPath`).
- `.github/pull_request_template.md` reminds human contributors that the PR
  title must be conventional.

### Do NOT

- Edit `package.json` `version` — it stays at its last hand-set value; the published
  version comes from the git tag and is written only inside the CI job
- Run `git tag`, `npm version`, `npm publish`, or `np`
- Delete or move `v*` tags — they are the source of truth for the last released version

Release notes live in GitHub Releases; `CHANGELOG.md` is frozen at 0.1.0.

## CI layout

- PR/push validation: GitHub Actions `.github/workflows/ci.yml`
  (lint / typecheck / test / build on Node 20/22)
- Docs site deploy: `.github/workflows/docs.yml` (npm project under `docs/`)
- Publish: CircleCI pipeline described above (no provenance badge — known CircleCI
  limitation of npm Trusted Publishing)

## Troubleshooting

| Symptom | Check |
| --- | --- |
| No publish after merge | Did the merged commits include `feat:`/`fix:`/`perf:`? Check the CircleCI `release` job log (`There are no relevant changes` = nothing to release) |
| semantic-release `EGITNOPERMISSION` / GitHub 403 | `github` context `GITHUB_TOKEN` (fine-grained PAT) needs `contents:write` and this repo in scope |
| Tag pushed but npm publish failed | Delete that `v*` tag (and its GitHub Release if created), then rerun the pipeline |
| `ENEEDAUTH` on publish | npm Trusted Publisher (CircleCI) registration: Org/Project/Pipeline-definition IDs and Context IDs (`npm-publish-guard`). CircleCI needs npm >= 11.11.0 (cimg/node:24.21 is fine) |

## Setup reference (for re-provisioning)

- CircleCI project: `gh/hideokamoto/stripe-decline-codes`
- Contexts: `github` (`GITHUB_TOKEN`), `npm-publish-guard` (restricted context, no secrets)
- Verify trusted publisher: `npm trust list stripe-decline-codes`

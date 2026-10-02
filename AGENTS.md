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

The root package uses **pnpm** (`packageManager: pnpm@11.27.1`). Use pnpm, not npm.

```bash
pnpm install
pnpm test            # vitest
pnpm run lint        # biome check
pnpm run lint:fix    # biome check --write
pnpm run format      # biome format --write
pnpm run typecheck   # tsc --noEmit
pnpm run build       # tsc && vite build -> dist/
```

`pnpm-workspace.yaml` sets `onlyBuiltDependencies`/`allowBuilds` for `esbuild`
(vite/vitest need its install script). Do not remove it — `pnpm install` fails with
`ERR_PNPM_IGNORED_BUILDS` without it.

For the docs site, use npm inside `docs/` (`cd docs && npm ci && npm run build`).

## Releases (automated — do not release manually)

Every push to `main` triggers the CircleCI pipeline **"npm publish"**:

- Config source: `hideokamoto/circleci-configurations`,
  `workflows/publish/npm-polyrepo-release-please.yaml` (no release YAML lives here)
- Flow: `test` job -> `release` job runs release-please (version bump commit, `v*` tag,
  GitHub Release from Conventional Commits), then publishes via npm Trusted
  Publishing (OIDC) in the same job.
- Trigger preset: `default-branch-pushes`

### Commit convention (required)

release-please only sees Conventional Commits. **PR titles must be `feat:`, `fix:`,
`feat!:`, etc., and PRs should be squash-merged** so the merge subject is conventional.
`chore:` / `docs:` / `ci:` / `test:` merges do not release.

Agents MUST write Conventional Commit messages and must never bypass the hook
(`--no-verify`):

- Local: husky `commit-msg` hook runs commitlint with
  `@commitlint/config-conventional` (`commitlint.config.js`). Active after
  `pnpm install` (husky `prepare` script sets `core.hooksPath`).
- `.github/pull_request_template.md` reminds human contributors that the PR
  title must be conventional.

### Do NOT

- Edit `package.json` `version` by hand (release-please owns it)
- Edit `CHANGELOG.md` by hand (release-please generates it)
- Run `git tag`, `npm version`, `npm publish`, or `np` — np was removed when this
  automation was introduced; the old `.npmrc` np config and `release` script are gone
- Touch `.release-please-manifest.json` — it is the source of truth for the last
  released version

## CI layout

- PR/push validation: GitHub Actions `.github/workflows/ci.yml`
  (lint / typecheck / test / build on Node 18/20/22)
- Docs site deploy: `.github/workflows/docs.yml` (npm project under `docs/`)
- Publish: CircleCI pipeline described above (no provenance badge — known CircleCI
  limitation of npm Trusted Publishing)

## Troubleshooting

| Symptom | Check |
| --- | --- |
| No publish after merge | Was the merged commit `feat:`/`fix:`? Does `.release-please-manifest.json` match the latest tag? |
| release-please GitHub 403 | `github` context `GITHUB_TOKEN` (fine-grained PAT) needs `contents:write` + `pull_requests:read` and this repo in scope |
| `ENEEDAUTH` on publish | npm Trusted Publisher (CircleCI) registration: Org/Project/Pipeline-definition IDs and Context IDs (`npm-publish-guard`). CircleCI needs npm >= 11.11.0 (cimg/node:24.21 is fine) |

## Setup reference (for re-provisioning)

- CircleCI project: `gh/hideokamoto/stripe-decline-codes`
- Contexts: `github` (`GITHUB_TOKEN`), `npm-publish-guard` (restricted context, no secrets)
- Verify trusted publisher: `npm trust list stripe-decline-codes`

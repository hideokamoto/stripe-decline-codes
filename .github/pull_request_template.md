## Summary

<!-- What does this PR change and why? -->

## Release impact

<!--
release-please derives the version bump from the squash-merge commit subject,
which defaults to the PR title. The title MUST be a Conventional Commit:

  feat: ...      -> minor release
  fix: ...       -> patch release
  feat!: / fix!: -> major release (breaking)
  perf:, refactor:, chore:, docs:, ci:, test:, style:, build:, revert:
                 -> no release

Local commits are validated by commitlint via the husky commit-msg hook.
-->

- [ ] PR title is a Conventional Commit (`feat:`, `fix:`, `chore:`, ...)
- [ ] `pnpm run lint`, `pnpm run typecheck`, and `pnpm test` pass locally

# Release CLI

`@koobiq/cli` (the `koobiq-cli` binary) is the release-management CLI for this repository. It
stages a release, commits it, pushes its tag and publishes the packages. It is meant for maintainers
only — releasing should only be done by the maintainers, and the full workflow is described in
[releasing-packages.md](./05-releasing-packages.md).

In this repository the release workflow runs the CLI from source, see
[releasing-packages.md](./05-releasing-packages.md); the published binary is what other Koobiq
repositories use.

The canonical reference — installation, the command list, the options and the `@koobiq/cli/release`
entry point — lives in [packages/cli/README.md](../../packages/cli/README.md), which is published to
npm together with the package.

## See also

- [releasing-packages.md](./05-releasing-packages.md) — the full release workflow.
- [packages/cli/README.md](../../packages/cli/README.md) — the canonical package reference: commands,
  options, reading release notes from your own scripts via `@koobiq/cli/release` and the local
  `npm pack` workflow.

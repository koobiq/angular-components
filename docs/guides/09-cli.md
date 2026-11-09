# Release CLI

`@koobiq/cli` (the `koobiq-cli` binary) is the release-management CLI for this repository. It
stages a release, commits it, pushes its tag and publishes the packages. It is meant for maintainers
only — releasing should only be done by the maintainers, and the full workflow is described in
[releasing-packages.md](./05-releasing-packages.md).

## Installation

The CLI is published to npm and installed as a dev dependency:

```bash
npm i --save-dev @koobiq/cli
```

Run a command through `npx`, for example:

```bash
npx koobiq-cli stage
```

In this repository the release workflow runs the CLI from source, see
[releasing-packages.md](./05-releasing-packages.md); the published binary is what other Koobiq
repositories use.

## Commands

| Command             | Description                                       | Example                                                         |
| ------------------- | ------------------------------------------------- | --------------------------------------------------------------- |
| `stage`             | Stage a new release (version bump and changelog)  | `npx koobiq-cli stage`                                          |
| `stage-commit`      | Commit a staged release and push its tag          | `npx koobiq-cli stage-commit`                                   |
| `publish-ci`        | Publish the release from CI                       | `npx koobiq-cli publish-ci`                                     |
| `publish-dist`      | Publish the release from the built dist directory | `npx koobiq-cli publish-dist`                                   |
| `publish-ci-gitlab` | Publish the release from GitLab CI                | `npx koobiq-cli publish-ci-gitlab`                              |
| `publish-ci-github` | Publish the release from GitHub CI                | `npx koobiq-cli publish-ci-github`                              |
| `resolve-npm-tag`   | Resolve the npm dist-tag for a package            | `npx koobiq-cli resolve-npm-tag --package-name "@koobiq/icons"` |

## Options

Every command accepts the same options, except `--package-name`, which only `resolve-npm-tag` uses
and requires. Options are given on the command line or as environment variables:

| Option                           | Description                                                     | Environment variable |
| -------------------------------- | --------------------------------------------------------------- | -------------------- |
| `-p, --project-dir <string>`     | project root directory (default: the current working directory) | `RELEASE_PROJECT`    |
| `-d, --dist-dir <string>`        | packages dist directory (default: `<root>/dist`)                | `RELEASE_DIST`       |
| `-c, --changelog-scope <string>` | default changelog scope (default: `koobiq`)                     | `CHANGELOG_SCOPE`    |
| `-t, --tag-name <string>`        | npm dist tag, auto-resolved from the registry when omitted      | —                    |
| `-n, --without-references`       | exclude changelog links                                         | —                    |
| `-w, --without-notification`     | cancel Mattermost notifications                                 | —                    |
| `-o, --repo-owner <string>`      | github owner name (default: `koobiq`)                           | `REPO_OWNER`         |
| `-r, --repo-name <string>`       | github repo name (default: `koobiq`)                            | `REPO_NAME`          |
| `--package-name <string>`        | npm package name to resolve the dist-tag for                    | —                    |

## Using `@koobiq/cli/release` in your own scripts

If you only need the release notes for a version — for example, to post a release announcement —
you do not need the full CLI. The `@koobiq/cli/release` entry point reads them straight out of your
project's `CHANGELOG.md`. It throws if the file does not exist, and returns `null` if the version
is not in it, so guard both:

```ts
import { extractReleaseNotes } from '@koobiq/cli/release';

const notes = extractReleaseNotes('./CHANGELOG.md', '1.2.3');

if (!notes) {
    throw new Error('Version 1.2.3 was not found in the changelog');
}

console.log(notes.releaseTitle, notes.releaseNotes);
```

`parseTag` and `resolveChangelogPath` turn a release tag into the right changelog path. They support
both a plain `{version}` tag and Nx's independent-release `{projectName}@{version}` tag, so the same
code works for single-project and per-package releases:

```ts
import { extractReleaseNotes, parseTag, resolveChangelogPath } from '@koobiq/cli/release';

const tag = process.env.GIT_TAG!; // e.g. '1.2.3' or '@scope/my-package@1.2.3'
const changelogPath = resolveChangelogPath(process.cwd(), parseTag(tag));
const notes = extractReleaseNotes(changelogPath, parseTag(tag).version);
```

`resolveChangelogPath` throws if the tag names a project but no `packages/{project}/CHANGELOG.md`
exists for it.

## See also

- [releasing-packages.md](./05-releasing-packages.md) — the full release workflow.
- [packages/cli/README.md](../../packages/cli/README.md) — the canonical package reference, including
  the local `npm pack` workflow.

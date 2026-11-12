# Koobiq Terminal Interface

# Usage

```bash
npm i --save-dev @koobiq/cli
```

Run a command through `npx`, for example:

```bash
npx koobiq-cli stage
```

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

## Reading release notes in your own scripts

If you just want the release notes for a version — for example, to post a release announcement
somewhere — you don't need the full CLI.

`@koobiq/cli/release` reads them straight out of your project's `CHANGELOG.md` file. It throws if
the file doesn't exist, and returns `null` if the version isn't in it, so guard both:

```ts
import { extractReleaseNotes } from '@koobiq/cli/release';

const notes = extractReleaseNotes('./CHANGELOG.md', '1.2.3');

if (!notes) {
    throw new Error('Version 1.2.3 was not found in the changelog');
}

console.log(notes.releaseTitle, notes.releaseNotes);
```

### Resolving a changelog from a git tag

`parseTag` and `resolveChangelogPath` turn a release tag into the right changelog path. They
support both a plain `{version}` tag and Nx's independent-release `{projectName}@{version}` tag,
so the same code works for single-project and per-package releases:

```ts
import { extractReleaseNotes, parseTag, resolveChangelogPath } from '@koobiq/cli/release';

const tag = process.env.GIT_TAG!; // e.g. '1.2.3' or '@scope/my-package@1.2.3'
const changelogPath = resolveChangelogPath(process.cwd(), parseTag(tag));
const notes = extractReleaseNotes(changelogPath, parseTag(tag).version);
```

`resolveChangelogPath` throws if the tag names a project but no `packages/{project}/CHANGELOG.md`
exists for it.

## Use npm pack to test packages locally

Build Package

```bash
npm run build:cli
```

Pack your artifacts

```bash
cd dist/cli
npm pack --pack-destination ~
```

Point package.json to file

```bash
"dependencies": {
  "@koobiq/cli": "file:~/koobiq-cli-16.0.0.tgz"
}

npm install
```

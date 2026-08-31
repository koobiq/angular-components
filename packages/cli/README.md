# Koobiq Terminal Interface

🚧 WIP. This feature is not stable yet. 🚧

# Usage

```bash
npm i --save-dev @koobiq/cli
```

## `Release` command

### stage-commit

```bash
npx koobiq-cli stage-commit
```

### Publish Gitlab CI

```bash
npx koobiq-cli publish-ci-gitlab
```

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

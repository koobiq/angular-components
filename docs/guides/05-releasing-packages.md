# Releasing packages

**Note: Releasing should only be done by the maintainers.**

The current major is released from `main`. Older supported lines are released from their own branches
— `19.x` and `18.x` — see [security.md](../../.github/security.md) for which lines are still supported.

## Releasing

1. Check out the branch you are releasing from: `main` for the current major, `19.x` or `18.x` for a
   patch to an older line.

2. Run:

    ```bash
    yarn run release:stage:commit
    ```

    The CLI walks through the release and asks for confirmation at each step that needs it:

    - (**needs confirmation**) choose the bump: major, minor or patch
    - (**needs confirmation**) enter a `release name`
        - you can use [angular-release-name-generator](https://www.npmjs.com/package/angular-release-name-generator)
    - (**needs confirmation**) generate the changelog section
    - commit the bumped `package.json` and `CHANGELOG.md` as `chore: bump version to X.Y.Z w/ changelog`
    - create a signed annotated git tag `X.Y.Z` whose message is the changelog section
    - push the branch and the tag

3. Wait for the **Publish** workflow ([publish.yml](../../.github/workflows/publish.yml)), which the
   tag push starts. It builds every package, publishes the five packages listed under `release.packages`
   in the root `package.json` to npm, notifies Mattermost, and then — in a separate job — creates the
   GitHub release from the tag with auto-generated notes.

    For a `20.*.*` tag, [docs-stable.yml](../../.github/workflows/docs-stable.yml) also deploys the docs
    and re-runs the Algolia crawler.

Nothing has to be done on github.com afterwards. The release body is GitHub's auto-generated pull
request list, grouped by the categories in [release.yml](../../.github/release.yml); those categories
match on labels, which [pr-label.yml](../../.github/workflows/pr-label.yml) derives from the
conventional-commit type in each pull request title.

The `Latest` badge is decided by the workflow, not by GitHub's default, so a patch to an older line
published after a newer major does not take the badge from it.

> A tag pushed to `18.x` runs that branch's own copy of `publish.yml`, which has no release job. Create
> its GitHub release with the manual run below.

## Creating a release for an existing tag

Use this to retry after a failed run, or for a tag whose release is missing.

**Actions → Publish → Run workflow**, then enter the tag. Only the GitHub release is created; the
manual run never republishes to npm. If the release already exists the run is a no-op.

The same thing locally, for several tags at once, as drafts to review first:

```bash
for t in 19.8.4 19.8.5; do gh release view "$t" > /dev/null 2>&1 && continue; gh release create "$t" --verify-tag --generate-notes --title "$t" --latest=false --draft; done
```

Then publish them:

```bash
for t in 19.8.4 19.8.5; do gh release edit "$t" --draft=false; done
```

Pass `--latest=false` unless the tag really is the newest version across every line — omitting the flag
makes GitHub mark it `Latest`.

Tags on the abandoned 17.x line are deliberately left without releases.

## Recovering from a bad release

```bash
# published to GitHub but npm failed — remove the release and keep the tag
gh release delete "$TAG" --yes

# the Latest badge landed on the wrong release
gh release edit "$TAG" --latest=false
gh release edit 20.2.0 --latest

# regenerate the notes of a release that is already live
gh api repos/koobiq/angular-components/releases/generate-notes -f tag_name="$TAG" --jq .body > notes.md
gh release edit "$TAG" --notes-file notes.md

# stop the automation without opening a pull request
gh workflow disable Publish
```

Never pass `--cleanup-tag` to `gh release delete`: the tag is what the published npm packages were
built from.

## Verifying a change to the release pipeline

Do **not** push a throwaway `*.*.*` tag to `origin` to test it. That runs the real `npm publish` with the
real token, and a `20.*` tag also triggers a docs deploy and an Algolia crawl.

Preview what a release body would look like without writing anything:

```bash
gh api repos/koobiq/angular-components/releases/generate-notes -f tag_name=19.8.4 --jq .body
```

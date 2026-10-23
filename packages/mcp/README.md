# @koobiq/mcp

MCP server for the Koobiq design system. A coding agent asks it for component APIs, icons, design
tokens, examples and guides instead of guessing names.

The server is spawned inside the consumer's project, so `cwd` leads to its `node_modules` and every
answer is pinned to the versions that project actually resolved. Component API, icons and tokens are
read from the installed packages; examples, guides and the API history ship with this package, built
from a checkout of `koobiq/angular-components`.

## Where the data comes from

| Answer                                        | Read from                                                      |
| --------------------------------------------- | -------------------------------------------------------------- |
| Component API                                 | the project's own `@koobiq/components/**/index.d.ts`           |
| Icons                                         | the project's own `@koobiq/icons/info/kbq-icons-info.json`     |
| Design tokens                                 | the project's own `@koobiq/design-tokens/web/css-tokens-*.css` |
| Examples, docs summaries, guides, API history | `data/`, built from a checkout of this repository              |

A source that cannot be read reports why and points at the documentation — it never guesses, because
an agent cannot tell a wrong name from a right one.

### The four files in `data/`

| File            | Committed? | Built by                       | What is in it                                                                                                                                     |
| --------------- | ---------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index.json`    | no         | `build:mcp:index`, every build | Entry points, symbols and members per component, the section headings and opening sentence of every documentation page, and the icon rename table |
| `examples.json` | no         | `build:mcp:index`, every build | Source of every live example, keyed by example id then by file name                                                                               |
| `guides.json`   | yes        | `build:mcp:data`, release only | Guide prose, cut into sections — installation, theming, migration and the rest of `PUBLIC_GUIDES` in `build-guides.ts`                            |
| `history.json`  | yes        | `build:mcp:data`, release only | Per-release API diff, one entry per entry point that changed, read from `tools/public_api_guard` at each tag                                      |

`index.json` and `examples.json` are always a snapshot of the working tree — regenerating them
cannot change their meaning, so there is nothing to commit. `guides.json` and `history.json` are
different: both are read from git, at release tags, not from whatever happens to be on disk, which
is why they are committed and only change in a release commit (see "Release staging" below).

A guide in `PUBLIC_GUIDES` is normally a page of the docs site, authored as `.mdx` under
`docs/guides`. `which-component-when` is the exception: it is `.md`, on purpose, because
`tools/docs-pages/sources.ts` globs only `*.mdx` and never builds it into a page — the file exists
solely as the data `which_component_when` parses. `GUIDE_FILE` in `build-guides.ts` matches either
extension, so a guide can take the same path when it should stay off the site.

### Guide text, releases and `since`

A guide's text is read from the **newest release tag**, not the working tree, even though the
working tree usually has the same file. A checkout names the version it is _developing_ — reading
the working tree on a `20.3.0` checkout would hand a consumer on `20.2.0` the rewrite meant for the
release after next, under the pretense that `20.2.0` already has it. Every guide in `guides.json`
carries the release its text came from in a `since` field. `get_guide` never swaps in a different
text per major — there is only the one, newest — but it compares `since`'s major against the
project's installed major and adds a caveat line when they differ, so the reader is told the prose
may not apply rather than left to assume it does.

A guide that exists only in the working tree — written, not yet released — is still served rather
than answered as if it did not exist, flagged `unreleased: true` instead of carrying a `since`
release that does not exist yet.

### Release staging

Running `build:mcp:data` on an ordinary branch reads the newest tag, same as any other checkout —
only the release pipeline's `post-version-bump` hook sets `KOOBIQ_RELEASE` to the version just
bumped, which is what tells `build-guides`/`build-history` that the working tree itself is that
release, not a comparison against the tag. Without it, a branch whose version is already bumped past
the last release (every feature branch on a fresh major, this one included) would have stamped
`since: <next major>.0.0` on every guide instead of the real last release.

`check-mcp-data` only checks `guides.json`: outside a staged release `history.json` is built solely
from tags, never from `tools/public_api_guard` on disk, so nothing a branch does can make it stale —
the only thing that changes it is the release pipeline, which regenerates it unconditionally every
time. `guides.json` is different: it does read disk, for guides the newest release does not have yet,
so a guide added or renamed without rerunning `build:mcp:data` really can go missing.

### Supported koobiq versions

One `@koobiq/mcp` package reads every supported major of `@koobiq/components` — 18, 19, 20 and 21 —
rather than shipping a version per major. `exports.types` in the installed package's `package.json`
is read first on every major; a directory scan is the fallback for a layout `exports` does not cover.
There is no backport line: a project on 18.x gets the same `@koobiq/mcp` as one on 21.x.

## Tools

| Tool                   | Answers                                                                                                                            |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `search`               | one ranked index over entry points, symbols, members, examples, icons, tokens and guides, in English and Russian                   |
| `get_component`        | inputs under the names a template writes, outputs, selectors, `exportAs`                                                           |
| `get_example`          | source of one live example from the documentation site                                                                             |
| `get_icon`             | usable attribute value and markup for an icon                                                                                      |
| `get_token`            | CSS custom property, value per theme, deprecation status                                                                           |
| `get_guide`            | installation, theming, localization, validation, schematics, smart search, migration — narrowed in three steps, in either language |
| `migrate`              | what changed between two versions, which entry points lost API, where the written instructions are                                 |
| `which_component_when` | which component answers a task, and which neighbour would be the wrong choice — with the reason                                    |
| `list_components`      | the complete list of documented areas, as ids the other tools accept                                                               |

## Using it on a project

Build it, then install the tarball into the project that should use it:

```bash
yarn build:mcp          # from the repository root
cd dist/mcp && npm pack # produces koobiq-mcp-*.tgz
npm install -D /path/to/koobiq-mcp-*.tgz
```

Then commit a `.mcp.json` so the whole team gets the same server:

```json
{
    "mcpServers": {
        "koobiq": { "command": "npx", "args": ["-y", "koobiq-mcp"] }
    }
}
```

The server must start inside the project, because that is how it finds the `node_modules` it reads.
Where a package cannot be found by walking `node_modules` — this repository, which builds
`@koobiq/components` and never installs it, or Yarn PnP, which has none — point at it directly:

```bash
KOOBIQ_COMPONENTS_ROOT=/path/to/package # also KOOBIQ_ICONS_ROOT, KOOBIQ_TOKENS_ROOT
```

## Development

```bash
yarn build:mcp:data  # regenerate the committed guides.json and history.json (runs in the release pipeline)
yarn build:mcp:index # regenerate index.json/examples.json alone — what unit:mcp needs, no dist/components
yarn build:mcp       # build:mcp:index, then compile src → dist and assemble dist/mcp
yarn check-mcp-data  # gate: guides.json not behind docs/guides — no git needed (history.json needs none: see above)
yarn unit:mcp        # Vitest, everything that does not need a built @koobiq/components (regenerates its own index first)
yarn unit:mcp:dts    # the specs that need a build: the .d.ts reader (build:components) and the stdio smoke test (build:mcp)
yarn mcp:probe       # drive the real server over stdio and price every answer
```

See "The four files in `data/`" above for what each command actually regenerates. The live API tests
(`unit:mcp:dts`) read `dist/components`, so `yarn build:components` has to have run at least once.

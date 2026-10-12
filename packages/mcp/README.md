# @koobiq/mcp

MCP server for the Koobiq design system. Resolves component APIs, icons and design tokens for a
coding agent so it stops guessing names.

Status: working prototype. Nine read-only tools, measured against 167 tests, not yet published.

## Why stdio and not a hosted endpoint

The client spawns this process inside the consumer's project, so `cwd` leads to their
`node_modules` and every answer can be pinned to the versions that project actually resolved. A
hosted server cannot see them, and since the protocol deprecated Roots there is no longer a
protocol-level way for one to ask.

The three Koobiq packages are on independent release lines — `@koobiq/components` 20.x,
`@koobiq/icons` 12.x, `@koobiq/design-tokens` 3.x, and the `peerDependencies` of the components
package permit icons `^11 || ^12`. There is therefore no single "Koobiq version" to resolve, and
each package is read on its own.

## Why a stdio server installs express

It does not use it. The server imports two modules of `@modelcontextprotocol/sdk` —
`server/mcp.js` and `server/stdio.js` — and those reach 16 files of the SDK and load four packages:
`ajv`, `ajv-formats`, `zod` and `zod-to-json-schema`.

The SDK declares 17 runtime dependencies. The other 13 belong to the transports and the OAuth
helpers this server never constructs: `express`, `express-rate-limit`, `cors`, `hono`,
`@hono/node-server`, `jose`, `pkce-challenge`, `eventsource`, `eventsource-parser`, `raw-body`,
`content-type`, `cross-spawn`, `json-schema-typed`. They are declared on the package as a whole
rather than scoped to the entry points that need them, so a consumer downloads all of them and
loads none.

That gap is not free. It is where the audit finding came from: `express` 5.2.1 resolved
`proxy-addr` 2.0.7, which carries a critical advisory — this repository's lockfile now resolves
2.0.8, so the check passes, but the tail is still shipped.

Two things worth keeping straight about whose problem this is. The SDK is not new to this
repository: `@angular/cli` 20.3.38 already depends on it for its own `ng mcp`, so the tree carried
express before this package existed. What _is_ new is the SDK as a **runtime** dependency of a
package this repository publishes, which departs from the rule that published packages depend only
on `tslib`.

The way out, if that rule is to hold: stdio MCP is newline-delimited JSON-RPC over two pipes, so
the transport and the handful of methods this server answers — `initialize`, `tools/list`,
`tools/call` — can be written directly, in on the order of 150 lines, dropping all 17. The reason
not to do it yet is that the SDK is also what keeps `tools/list` and the error shapes matching what
clients expect across protocol revisions, and the revision is still moving. The cost of that choice
should be paid deliberately before publishing, not discovered by a consumer reading
`package.json`.

## Where the data comes from

| Source                                     | Read from                                                                                          | Why                                                                                                                                                                        |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Component API — inputs, outputs, selectors | the project's own `@koobiq/components/**/index.d.ts`                                               | Angular writes its metadata into the typings, so this is the API that project actually has. 230 inputs in 20.x are bound under a different name than the property they set |
| Examples, documented topics, guides        | `data/index.json` and `data/guides.json`, generated from a checkout of `koobiq/angular-components` | The published package ships only typings and styles: no MDX, no examples                                                                                                   |
| API history between releases               | `data/history.json`, diffed from `tools/public_api_guard/**` at each tag                           | Those reports are approved in CI, so the report at a tag _is_ the public surface of that release                                                                           |
| When to use which component                | `docs/guides/which-component-when.{en,ru}.md`, read as an ordinary guide                           | One copy of the mapping, in the repository that owns the components it describes                                                                                           |
| Icons                                      | the project's own `@koobiq/icons/info/kbq-icons-info.json`                                         | Already a machine-readable index, with English and Russian tags. Majors 9–12 verified against the published tarballs                                                       |
| Icon renames                               | `packages/schematics/src/migrations/icons-replacement/data.ts`, via the index                      | The team already authored the 10 → 11 map for its `icons-replacement` schematic; deriving a second copy would be a second thing to keep in step                            |
| Design tokens                              | the project's own `@koobiq/design-tokens/web/css-tokens-*.css`                                     | The compiled CSS carries the final names, the resolved values and the `DEPRECATED` marker, so nothing has to reproduce the token build's naming transform                  |

A source that cannot be read reports why and points at the documentation. It never answers
emptily: an agent cannot tell a wrong name from a right one, so a confident guess costs the caller
more than a refusal.

This is where reading the project rather than the documentation earns its keep. Asked for
`circle-info_16`, a project on `@koobiq/icons` 10 is told that its own name for that icon is
`info-circle_16` and pointed at `ng g @koobiq/components:icons-replacement`; a project on 11 is
simply given it. The direction comes from which name is installed, not from a version number. The
published documentation can only ever describe the newest names.

## Tools

| Tool                   | Answers                                                                                                                                      |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `search`               | one ranked index over entry points, symbols, members, examples, icons, tokens and guides, in English and Russian                             |
| `get_component`        | inputs under the names a template writes, with the type each accepts; outputs, selectors, `exportAs`. A borrowed API is folded to its names  |
| `get_example`          | source of one live example from the documentation site                                                                                       |
| `get_icon`             | usable attribute value and markup for an icon                                                                                                |
| `get_token`            | CSS custom property, value per theme, deprecation status                                                                                     |
| `get_guide`            | installation, theming, localization, validation, schematics, smart search, migration — narrowed in three steps, addressed in either language |
| `migrate`              | what changed between two versions, which entry points lost API, and where the written instructions are                                       |
| `which_component_when` | which component answers a task, and which neighbour would be the wrong choice — with the reason                                              |
| `list_components`      | every documented area of the library as one closed list, so the set can be known rather than guessed at from `node_modules`                  |

Registered in a fixed order on purpose. `tools/list` renders into the prefix of every model
request, ahead of the system prompt, so a list whose order varies invalidates the prompt cache each
turn and the schemas get billed at full rate instead of the cache-read rate.

## Measured cost

From `npm run probe`, which drives the real server over stdio:

```
tool schemas         ≈ 1789–2504 tokens   this server's share, paid per request, nine tools
average answer       ≈ 353 tokens         over 13 representative calls
search               ≈ 182–359
get_component        ≈ 329–460 whole entry point, ≈ 86–120 narrowed to one symbol
                     ≈ 1399 for navbar against 1754 unfolded, every name still named
list_components      ≈ 529–740            all 74 ids, the import rule and the exceptions to it
get_guide            ≈ 348 listing → 139 sections → 125 one section
migrate              ≈ 358 summary of 4694 raw changes
which_component_when ≈ 94–371
get_icon             ≈ 93–130
get_token            ≈ 49–76
get_example          ≈ 1802–2523          every file of the example; needs a default filter
```

Two things these numbers are not.

They are not tokenizer output — they are character counts divided by 2.5 to 3.5, which is why the
schema figure is a range. JSON tokenizes worse than prose.

And the schema figure is **this server's share of the per-request tax, not the whole tax**. A
client reports one number for every server it has connected plus its own built-in tools; a session
showing 14.4k of loaded tool schemas across 113 tools is not measuring these nine. Judge the cost
of adding this server by its own payload, and the cost of a crowded client by the client's own
breakdown.

## Using it on a project

Build it, then install the tarball into the project that should use it:

```bash
yarn build:mcp # from the repository root
cd packages/mcp && npm pack
```

```bash
npm install -D /path/to/angular-components/packages/mcp/koobiq-mcp-*.tgz
```

Then check a `.mcp.json` into that repository, so the whole team gets the same server:

```json
{
    "mcpServers": {
        "koobiq": { "command": "npx", "args": ["-y", "koobiq-mcp"] }
    }
}
```

The server must start **inside the project**, because that is how it finds the `node_modules` it
reads. Nothing else is configured: there is no endpoint, no token and no network access.

Where a package cannot be found by walking `node_modules` — this repository, which builds
`@koobiq/components` and never installs it, or Yarn PnP, which has no `node_modules` at all —
point at it directly:

```bash
KOOBIQ_COMPONENTS_ROOT=/path/to/package # also KOOBIQ_ICONS_ROOT, KOOBIQ_TOKENS_ROOT
```

## Working on it here

```bash
yarn build:mcp:data # index, guides and history, read out of this repository
yarn build:mcp      # the above, then tsc
yarn test:mcp       # 151 tests
yarn mcp:probe      # drives the real server over stdio and prices every answer
```

`data/` is generated and not committed: it is this repository re-derived, and committing it would
double every release diff. The live API tests read `dist/components`, so `yarn build:components`
has to have run at least once; they say so plainly when it has not.

## Protocol

Built on `@modelcontextprotocol/sdk` 1.30.1, which speaks `2025-11-25` and older. The
`2026-07-28` revision — stateless requests, mandatory `server/discover`, required `ttlMs` and
`cacheScope` on list results — is not yet available in the SDK. The one thing that revision asks
for which costs nothing today, deterministic `tools/list` ordering, is already honoured.

See [TODO.md](TODO.md) and [docs/plan.html](docs/plan.html).

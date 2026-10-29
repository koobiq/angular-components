### New Icons Pack schematics

This schematic provides migration for update icons pack. It includes:

- Change prefixes from `mc` to `kbq` for TS, HTML, and styles
- Update icon names for updated/removed icons according to [mapping](data.ts), in the values of `kbq-icon`,
  `kbq-icon-item`, `kbq-icon-button` and of their `mc-*` counterparts (`mc-icon="mc-search_16"` →
  `mc-icon="kbq-magnifying-glass_16"`; the attribute names themselves are left alone)
- Fix icons package prefix in styles
- Optionally use custom migration and replacement data

Matching is AST-based (parsed HTML/TypeScript, not whole-file text search), so it only touches genuine icon
usages — a component selector like `<mc-button>`, a `[class]` binding expression, an unrelated class such as
`.mc-panel-header`, or an unrelated string like `'mc-legacy-mode'` are all left untouched. It also covers a
component's inline `host` class bindings and inline `styles` array, and icons inside ICU expansions
(`{count, plural, ...}`). A bound attribute value that isn't a single quoted literal (a dynamic expression, a
concatenation, or `{{ }}` interpolation) can't be resolved statically — it's reported as a warning rather than
migrated or silently corrupted. An icon whose prefix was already swapped to `kbq-` by an earlier run (e.g.
`kbq-icon="kbq-add-to-list_16"`) still gets its name corrected.

One documented exception: in style files (and `.md` docs) there's no CSS/SCSS parser, so token matching is a
word/selector-boundary-safe regex rather than real selector parsing — this correctly ignores `.my-mc-widget`,
`$mc`, and `@import 'mc'` (the bare scope word only matches when directly preceded by `.`, like a real class
selector), but a genuine selector spelled out inside a comment is still indistinguishable from one that isn't
and can still be rewritten.

`fix: false` (the default) never mutates any file — it only reports what it found. Icon-_name_ renames (e.g.
`mc-add-to-list_16`/`kbq-add-to-list_16` → the current `kbq-file-plus-o_16`) always apply in styles/`.md`
regardless of `updatePrefix`; the option only gates the _bare_ scope-word rename (`mc` → `kbq`) there. In
templates/TS, icon-attribute values are always matched regardless of `updatePrefix`.

#### Data

Everything the migration needs is built in: the icon-name mapping ([`data.ts`](data.ts)) and the `mc` → `kbq`
scope. Run it without the custom-data options — the log says which data it runs on. The options are for a
mapping or a scope of your own, not for passing the shipped files back in.

`--custom-data-path` takes the icon-name mapping, an array of `replace`/`replaceWith` pairs written with the
`kbq-` prefix (the `mc-` form of each name is matched as well):

```json
[{ "replace": "kbq-add-to-list_16", "replaceWith": "kbq-file-plus-o_16" }]
```

`--custom-icon-replacement-path` takes the scope pair, bare words with no hyphen:

```json
[{ "replace": "mc", "replaceWith": "kbq" }]
```

[`migration.json`](migration.json) and [`replacement.json`](replacement.json) hold the built-in data in these
shapes, so they can be copied as a starting point. A path is resolved from the workspace root first, then as an
absolute path or one relative to the current directory; a missing file stops the run. A scope file still
written in the old fragment shape (`kbq-icon="mc-`) is ignored with a warning, and the built-in scope applies.

---

### Parameters

The schematic supports the following options:

- **`--fix`** (`boolean`)
  Applies fixes automatically without prompting.

- **`--project`** (`string`)
  Target Angular/Nx project name, or a folder such as `./libs`. Without it the whole workspace is migrated;
  `node_modules` and `dist` are always skipped.

- **`--update-prefix`** (`boolean`)
  Whether to change icon prefixes during migration.

- **`--custom-data-path`** (`string`)
  JSON file with an icon-name mapping that replaces the built-in one (see [Data](#data)).

- **`--custom-icon-replacement-path`** (`string`)
  JSON file with a scope pair that replaces the built-in `mc` → `kbq` (see [Data](#data)).

The schema definition can be found in [`schema.ts`](schema.ts).

### Usage

#### Angular CLI

```shell
ng g @koobiq/components:new-icons-pack --fix=true --project "<your project>"
ng g @koobiq/components:new-icons-pack --fix=true --project ./libs
```

#### Angular CLI with custom data

```shell
ng g @koobiq/components:new-icons-pack \
    --custom-data-path my-icons.json \
    --custom-icon-replacement-path my-scope.json \
    --fix=true \
    --project "<your-project>"
```

#### Nx

```shell
nx g @koobiq/components:new-icons-pack --fix=true --project "<your project>"
```

#### Nx with custom data

```shell
nx g @koobiq/components:new-icons-pack \
    --custom-data-path my-icons.json \
    --custom-icon-replacement-path my-scope.json \
    --fix=true \
    --project "<your-project>"
```

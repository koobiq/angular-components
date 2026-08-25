### New Icons Pack schematics

This schematic provides migration for update icons pack. It includes:

- Change prefixes from `mc` to `kbq` for TS, HTML, and styles
- Update icon names for updated/removed icons according to [mapping](data.ts)
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

#### `--custom-icon-replacement-path`

The expected file shape changed. It's still a JSON array of `{ "replace": ..., "replaceWith": ... }` objects,
but each entry is now interpreted as a bare scope-word pair (e.g. `{ "replace": "mc", "replaceWith": "kbq" }`,
with no leading/trailing hyphen) rather than a whole-file regex fragment like `kbq-icon="mc-` — the AST-based
matcher no longer needs per-context fragments. A file still written in the old fragment style, or a malformed
one, is detected and ignored with a warning (falling back to the default `mc` → `kbq` scope) rather than being
silently misapplied or crashing. [`replacement.json`](replacement.json) is kept in its old fragment shape for
backward compatibility with anyone already pointing at it — **don't** pass it via `--custom-icon-replacement-path`
as-is (see the fallback warning above); copy it into your own file and rewrite it in the new shape instead.

---

### Parameters

The schematic supports the following options:

- **`--fix`** (`boolean`)
  Applies fixes automatically without prompting.

- **`--project`** (`string`)
  Target Angular/Nx project name.

- **`--update-prefix`** (`boolean`)
  Whether to change icon prefixes during migration.

- **`--custom-data-path`** (`string`)
  Path to a custom migration data file.
  When provided, use `migration.json` file as a default.
  Use this option if you want to override the default icon mapping data.

- **`--custom-icon-replacement-path`** (`string`)
  Path to a custom icon attributes replacement file.
  When provided, use `replacement.json` file as a default.
  Use this option to customize how icon attributes are replaced during migration.

The schema definition can be found in [`schema.ts`](schema.ts).

### Usage

#### Angular CLI

```shell
ng g @koobiq/components:new-icons-pack --fix=true --project <your project>
```

#### Angular CLI with custom data

```shell
ng g @koobiq/components:new-icons-pack \
  --custom-data-path migration.json \
  --custom-icon-replacement-path my-replacement.json \
  --fix=true \
  --project <your-project>
```

`migration.json` is the shipped icon-name mapping and can be used as-is. `my-replacement.json` is a file you
write yourself, in the new bare scope-word-pair shape described above — **not** the shipped
[`replacement.json`](replacement.json), which is still in the legacy shape.

#### Nx

```shell
nx g @koobiq/components:new-icons-pack --fix=true --project <your project>
```

#### Nx with custom data

```shell
nx g @koobiq/components:new-icons-pack \
--custom-data-path migration.json \
--custom-icon-replacement-path my-replacement.json \
--fix=true \
--project <your-project>
```

### New Icons Pack schematics

This schematic provides migration for update icons pack. It includes:

- Change prefixes from `mc` to `kbq` for TS, HTML, and styles
- Update icon names for updated/removed icons according to [mapping](data.ts)
- Fix icons package prefix in styles
- Optionally use custom migration and replacement data

Matching is AST-based (parsed HTML/TypeScript, not whole-file text search), so it only touches genuine icon
usages — a component selector like `<mc-button>`, an unrelated class such as `.mc-panel-header`, or an
unrelated string like `'mc-legacy-mode'` are all left untouched. One documented exception: in style files (and
`.md` docs) there's no CSS/SCSS parser, so a bare `mc`/`kbq` scope word is matched by a word-boundary-safe
regex rather than real selector parsing — this correctly ignores `.my-mc-widget`, but can't distinguish a
selector from the same word appearing inside a comment.

`fix: false` (the default) never mutates any file — it only reports what it found. `updatePrefix` now only
gates the styles pass (as it always effectively did); template/TS icon-attribute values are always matched
regardless of `updatePrefix`.

#### `--custom-icon-replacement-path`

The expected file shape changed. It's still a JSON array of `{ "replace": ..., "replaceWith": ... }` objects,
but each entry is now interpreted as a bare scope-word pair (e.g. `{ "replace": "mc", "replaceWith": "kbq" }`)
rather than a whole-file regex fragment like `kbq-icon="mc-` — the AST-based matcher no longer needs
per-context fragments. A file still written in the old fragment style is detected and ignored with a warning
(falling back to the default `mc` → `kbq` scope) rather than being silently misapplied. [`replacement.json`](replacement.json)
is kept in its old fragment shape for backward compatibility with anyone already pointing at it — copy it into
your own file and update it to the new shape rather than relying on it as-is.

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
  --custom-icon-replacement-path replacement.json \
  --fix=true \
  --project <your-project>
```

#### Nx

```shell
nx g @koobiq/components:new-icons-pack --fix=true --project <your project>
```

#### Nx with custom data

```shell
nx g @koobiq/components:new-icons-pack \
--custom-data-path migration.json \
--custom-icon-replacement-path replacement.json \
--fix=true \
--project <your-project>
```

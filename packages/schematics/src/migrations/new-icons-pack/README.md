### New Icons Pack schematics

This schematic provides migration for update icons pack. It includes:

- Change prefixes from `mc` to `kbq` for TS, HTML, and styles
- Update icon names for updated/removed icons according to [mapping](data.ts)
- Fix icons package prefix in styles
- Optionally use custom migration and replacement data

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

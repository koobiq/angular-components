# file-upload-deprecated-outputs

Migration schematic invoked automatically by `ng update @koobiq/components@20`
(registered for `20.3.0-0`). Renames the deprecated file-upload outputs to
their replacements.

## Background

`KbqMultipleFileUploadComponent.fileQueueChanged` and
`KbqSingleFileUploadComponent.fileQueueChange` (#DS-5229) were deprecated in
favor of `filesChange` / `fileChange`. Removal was originally planned for the
next major release, but was moved up to 20.3.0. Both outputs fired at exactly
the same call sites, with the same payload, as their replacement — this is a
pure rename, not a behaviour change.

## What it does

The schematic walks every `.ts` and `.html` file in the project (skipping
`node_modules`, `dist`, `coverage`, `.angular` and `out-tsc`) and renames the
identifier wherever it appears:

| Before             | After         |
| ------------------ | ------------- |
| `fileQueueChanged` | `filesChange` |
| `fileQueueChange`  | `fileChange`  |

Both names are unambiguous — they don't collide with any other Angular or
TypeScript identifier — so the rename applies everywhere the text occurs:

- A template binding, in an external `.html` file or an inline
  `@Component({ template })` string: `(fileQueueChanged)="…"` →
  `(filesChange)="…"`.
- Programmatic TypeScript access: `comp.fileQueueChanged.subscribe(...)` →
  `comp.filesChange.subscribe(...)`.

The rewrite is idempotent — running it twice does not change an
already-migrated file.

## Running it

```shell
ng g @koobiq/components:file-upload-deprecated-outputs --project <your project>
```

Pass `--fix=false` to see what would change without writing files. `fix`
defaults to `true`.

[Params](schema.ts)

### Run locally

Build package

```shell
yarn run build:schematics
```

Run command (for example, for `koobiq-docs` project)

```shell
ng g ./dist/components/schematics/collection.json:file-upload-deprecated-outputs --project koobiq-docs
```

### Result

#### Before

```ts
@Component({
    selector: 'my-uploads',
    template: `
        <kbq-file-upload (fileQueueChange)="onFileChange($event)"></kbq-file-upload>
        <kbq-file-upload multiple (fileQueueChanged)="onFilesChange($event)"></kbq-file-upload>
    `
})
export class MyUploads {}
```

#### After

```ts
@Component({
    selector: 'my-uploads',
    template: `
        <kbq-file-upload (fileChange)="onFileChange($event)"></kbq-file-upload>
        <kbq-file-upload multiple (filesChange)="onFilesChange($event)"></kbq-file-upload>
    `
})
export class MyUploads {}
```

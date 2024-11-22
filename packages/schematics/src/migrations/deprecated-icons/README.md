### New Icons Pack schematics

This schematic provides migration for update icons pack. It includes:

-   Change prefixes from `mc` to `kbq` for ts, html, styles
-   Update icon names for updated/removed icons according to [mapping](data.ts)
-   Fix icons package prefix in styles

[Params](schema.ts)

Usage for Angular Cli:

```shell
ng g @koobiq/components:deprecated-icons --fix=true --project <your project>
```

Usage for Nx:

```shell
nx g @koobiq/components:deprecated-icons --fix=true --project <your project>
```

As part of the **Koobiq** design system, a set of **schematics** is provided — CLI tools designed to automate library installation, perform migrations, and update components in Angular projects.

---

### Available Schematics

#### ng-add

Installs the [`@koobiq/components`](https://github.com/koobiq/angular-components) library and adds all necessary dependencies.

**When to use:** When adding the library to a project for the first time.

```bash
ng add @koobiq/components
```

#### new-icons-pack

Updates icon prefixes and names required to migrate from version `7.2.x` and below to version `8.0.2` and above.

**When to use:** After upgrading the [`@koobiq/icons`](https://github.com/koobiq/icons) library to version `8.0.2` or later.

```bash
ng generate @koobiq/components:new-icons-pack
```

#### css-selectors

Updates deprecated CSS selectors (typography and color naming) according to the new design system conventions.

**When to use:** After upgrading the [`@koobiq/components`](https://github.com/koobiq/angular-components) library to version `18.6.0` or later.

```bash
ng generate @koobiq/components:css-selectors
```

#### deprecated-icons

Removes or replaces icons marked as deprecated.

```bash
ng generate @koobiq/components:deprecated-icons
```

#### empty-state-size-attr

Updates size attribute names and values for the [`Empty state`](https://koobiq.io/en/components/empty-state/overview) component in both HTML and TypeScript templates.

**When to use:** After upgrading the [`@koobiq/components`](https://github.com/koobiq/angular-components) library to version `18.22.0` or later.

```bash
ng generate @koobiq/components:empty-state-size-attr
```

#### loader-overlay-size-attr

Updates size attribute names and values for the [`Overlay`](https://koobiq.io/en/components/loader-overlay/overview) component in both HTML and TypeScript templates.

**When to use:** After upgrading the [`@koobiq/components`](https://github.com/koobiq/angular-components) library to version `18.22.0` or later.

```bash
ng generate @koobiq/components:loader-overlay-size-attr
```

---

### How to run a schematic

-   Make sure Angular CLI is installed:

```bash
ng version
```

-   Run the desired schematic using the `ng generate` command:

```bash
ng generate @koobiq/components:<schematic-name>
```

-   Some schematics support additional options. See the `schema.json` file inside the corresponding schematic folder.

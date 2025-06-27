## How to Upgrade from Koobiq v17

New versions bring improvements, but include **breaking changes** — these should be applied gradually.

---

### Quick Plan

1. **Up to 18.5.3** – safe base update with new theming and icon package
2. **18.6** – token updates
3. **18.22** – attribute name changes in components
4. **After** – final upgrade to the latest version (with modern theming support)

---

### 1. Upgrade to 18.5.3

```bash
npm install koobiq/cdk@18.5.3
npm install @koobiq/components@18.5.3
npm install @koobiq/angular-luxon-adapter@18.5.3
npm install @koobiq/design-tokens@^3.7.3
```

#### New Theming System

Theming is now simpler and built on CSS variables.

See examples in the repo:

- [`apps/docs/src/main.scss`](https://github.com/koobiq/angular-components/blob/main/apps/docs/src/main.scss)
- [`apps/docs/src/styles/_theme-kbq.scss`](https://github.com/koobiq/angular-components/blob/main/apps/docs/src/styles/_theme-kbq.scss)

#### Icon Package Update

- Install the updated icon package:

```bash
npm install @koobiq/icons@9.1.0
```

- Apply the schematic:

```bash
ng g @koobiq/angular-components:new-icons-pack --project <your project>
```

---

### 2. Token Update (18.6.x)

- Deprecated color tokens were removed and typography token names were changed.

The schematic will replace typography names and highlight where color tokens need manual cleanup:

```bash
ng g @koobiq/angular-components:css-selectors --fix=true --project <your project>
```

- For manual control, use `--fix=false`. The schematic will only highlight where changes are needed:

```bash
ng g @koobiq/angular-components:css-selectors --fix=false --project <your project>
```

---

### 3. Attribute Updates (18.22.0)

- Attribute names were changed in the following components:
    - `KbqLoaderOverlay`: `compact` → `size`
    - `KbqEmptyState`: `big` → `size`

```bash
ng g @koobiq/angular-components:loader-overlay-size-attr --project <your project>
ng g @koobiq/angular-components:empty-state-size-attr --project <your project>
```

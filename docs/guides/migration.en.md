## How to upgrade from Koobiq 17

New versions include improvements but also **breaking changes**; they need to be applied step by step.

---

### Summary plan

**Up to 18.5.3** — safe baseline with theming and icon updates
**18.6** — token update
**18.22** — component attribute changes
**After** — final upgrade to the latest version (with updated theming)

---

### 1. Upgrade to 18.5.3

```bash
npm install @koobiq/cdk@18.5.3
npm install @koobiq/components@18.5.3
npm install @koobiq/icons@^9.0.0
npm install @koobiq/design-tokens@~3.7.3
npm install @koobiq/angular-luxon-adapter@18.5.3
npm install @koobiq/date-adapter^3.1.3
npm install @koobiq/date-formatter^3.1.3
npm install luxon
npm install @messageformat/core
npm install @radix-ng/primitives@0.14.0
```

#### New theming

The theming is now simpler and based on CSS variables. More details [at this link](https://koobiq.io/ru/main/theming/overview#как-использовать?).

See examples in the repository:

- [`apps/docs/src/main.scss`](https://github.com/koobiq/angular-components/blob/main/apps/docs/src/main.scss)
- [`apps/docs/src/styles/_theme-kbq.scss`](https://github.com/koobiq/angular-components/blob/main/apps/docs/src/styles/_theme-kbq.scss)

#### Icon Package Update

- Install the new icon version:

```bash
npm install @koobiq/icons@9.1.0
```

- To update icon names in templates, use the update tool (schematic):

```bash
ng g @koobiq/angular-components:new-icons-pack --project <your project>
```

---

### 2. Token update (18.6.x)

- Deprecated color tokens have been removed, and typography token names have been renamed.

The script will rename class and CSS variable names to the new ones and highlight places where outdated colors need to be removed or replaced:

```bash
ng g @koobiq/angular-components:css-selectors --fix=true --project <your project>
```

- For manual control, add `--fix=false`. The script will highlight where to remove or replace colors and typography names:

```bash
ng g @koobiq/angular-components:css-selectors --fix=false --project <your project>
```

---

### 3. Attribute update (18.22.0)

- Component attribute names have changed:
    - `KbqLoaderOverlay`: `compact` → `size`
    - `KbqEmptyState`: `big` → `size`

```bash
ng g @koobiq/angular-components:loader-overlay-size-attr --project <your project>
ng g @koobiq/angular-components:empty-state-size-attr --project <your project>
```

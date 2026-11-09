# Navbar Item ↔ Custom Component Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make a plain titleless `kbq-navbar-item` (bell icon + count badge) render pixel-identically to the custom-component example (`ExampleNavbarNotifications`), so the docs examples prove the custom component reproduces the plain item.

**Architecture:** One CSS rule adds corner-overlay badge placement for titleless vertical items in expanded mode; a parity e2e pins the badge geometry against the custom component; the docs example and text show the equivalence.

**Tech Stack:** Angular (standalone components), SCSS, Playwright (e2e), Vitest (unit), MDX docs.

**Spec:** `docs/superpowers/specs/2026-11-09-navbar-item-custom-component-parity-design.md`

## Global Constraints

- Vertical navbar only; expanded and collapsed.
- Tokens: `--kbq-size-m` 12px, `--kbq-size-l` 16px, `--kbq-size-xl` 20px, `--kbq-size-4xl` 40px, `--kbq-size-6xl` 56px.
- Badge parity target = corner overlay (top-right of the leading icon / 40×40 box), expanded and collapsed.
- Titled items keep the trailing badge; only titleless items get the corner overlay (assumption — confirm at review).
- Do not change horizontal auto-collapse (stays icon-only).
- e2e alignment tolerance stays 3.5px; badge parity uses 1px.
- No "PT Naira" anywhere; docs example copy uses the fictional "Orbit".
- e2e baselines regenerate only in Docker; never commit native screenshots.
- Public symbols: `Kbq` / `kbq` / `KBQ_` prefixes; no new public API.

## Review Focus

1. **Titled vs titleless badge** — a titled item's badge must stay trailing while a titleless item's badge goes corner; verify both in the same navbar.
2. **Badge width variance** — `compact` badge width differs; parity must compare the right edge, not the left.
3. **Collapsed titleless item** — badge is already corner; the new rule must not double-offset or regress it.
4. **Custom content vs custom trigger** — `kbqNavbarItemContent` also reserves 40×40; the new rule must not leak into custom-content items.
5. **Cascade specificity** — the `:not(.kbq-navbar-item_with-title)` override must beat the existing `.kbq-expanded .kbq-badge { position: static }`.

---

### Task 1: Failing parity e2e for the titleless badge

**Files:**

- Modify: `packages/components/navbar/e2e.ts` (add a plain titleless item to `E2eNavbarItemCustomComponent`)
- Modify: `packages/components/navbar/e2e.playwright-spec.ts` (add the parity test)

**Interfaces:**

- Consumes: existing `E2eNavbarItemCustomComponent` scenario (`data-testid="e2eNavbarItemCustomComponent"`, `custom-item` hosting `e2e-notifications-trigger`).
- Produces: `data-testid="plain-notifications"` and `data-testid="custom-item"` badge locators used by Task 2.

- [ ] **Step 1: Add a plain titleless bell+badge item to the scenario**

In `e2e.ts`, inside `E2eNavbarItemCustomComponent`'s `kbq-navbar-container`, after the `custom-item`:

```html
<kbq-navbar-item data-testid="plain-notifications">
    <i kbq-icon="kbq-bell_16" [color]="'empty'"></i>
    <kbq-badge [badgeColor]="'error'" [compact]="true">2</kbq-badge>
</kbq-navbar-item>
```

Keep the existing `plain-item` (Tasks) and `custom-item` untouched.

- [ ] **Step 2: Add the parity test**

In `e2e.playwright-spec.ts`, inside the `E2eNavbarItemCustomComponent` describe, add:

```ts
test('should place the badge of a plain titleless item at the custom component badge position', async ({ page }) => {
    await page.goto('/E2eNavbarItemCustomComponent');

    const plainBadge = page.getByTestId('plain-notifications').locator('.kbq-badge');
    const customBadge = page.getByTestId('custom-item').locator('.kbq-badge');

    const plain = (await plainBadge.boundingBox())!;
    const custom = (await customBadge.boundingBox())!;

    // Right edge and top must match; left edges differ with badge width.
    expect(Math.abs(plain.x + plain.width - (custom.x + custom.width))).toBeLessThanOrEqual(1);
    expect(Math.abs(plain.y - custom.y)).toBeLessThanOrEqual(1);
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `node tools/e2e/run.js yarn playwright test packages/components/navbar/e2e.playwright-spec.ts -g "should place the badge of a plain titleless item"`

Expected: FAIL — right edges differ by roughly 24px (plain badge is `static` after the icon).

- [ ] **Step 4: Commit**

```bash
git add packages/components/navbar/e2e.ts packages/components/navbar/e2e.playwright-spec.ts
git commit -m "test(navbar): parity check for a plain titleless item badge"
```

---

### Task 2: Corner-overlay badge CSS for titleless expanded items

**Files:**

- Modify: `packages/components/navbar/_navbar-item_vertical.scss`

**Interfaces:**

- Consumes: Task 1's `plain-notifications` / `custom-item` badge locators and parity test.
- Produces: no public API; only the `.kbq-navbar-item.kbq-vertical.kbq-expanded:not(.kbq-navbar-item_with-title) .kbq-badge` rule.

- [ ] **Step 1: Add the corner-overlay rule**

In `_navbar-item_vertical.scss`, inside `.kbq-navbar-item.kbq-vertical`, keep `.kbq-expanded .kbq-badge { position: static; }` for titled items, and add a titleless override so the badge overlays the top-right of the leading icon area at the same position the custom component's badge takes (`top: 0; right: 0` of its 40×40 box). Reference `--kbq-navbar-item-size-custom-content-width` so the right edge lands where the 40×40 box ends.

- [ ] **Step 2: Run the parity test to verify it passes**

Run: `node tools/e2e/run.js yarn playwright test packages/components/navbar/e2e.playwright-spec.ts -g "should place the badge of a plain titleless item"`

Expected: PASS.

- [ ] **Step 3: Run the full navbar e2e**

Run: `node tools/e2e/run.js yarn playwright test packages/components/navbar/e2e.playwright-spec.ts`

Expected: PASS. This also guards Review Focus #1 (titled "Уведомления" stays trailing via the states baselines), #3 (collapsed badge unchanged) and #4 (custom-content scenario unaffected).

- [ ] **Step 4: Commit**

```bash
git add packages/components/navbar/_navbar-item_vertical.scss
git commit -m "fix(navbar): corner-overlay badge for titleless vertical items"
```

---

### Task 3: Plain parity item in the docs example

**Files:**

- Modify: `packages/docs-examples/components/navbar/navbar-item-custom-component/navbar-item-custom-component-example.html`
- Modify: `packages/docs-examples/components/navbar/navbar-item-custom-component/navbar-item-custom-component-example.ts` (if imports change)

**Interfaces:**

- Consumes: Task 2's corner-overlay CSS.
- Produces: a `navbar-item-custom-component` docs example whose plain bell+badge item is visually identical to the custom component beside it.

- [ ] **Step 1: Add the plain bell+badge item**

In `navbar-item-custom-component-example.html`, next to `<example-navbar-notifications />`, add a titleless plain item using the same icon and badge so the two render identically:

```html
<kbq-navbar-item>
    <i kbq-icon="kbq-bell_16" color="empty"></i>
    <kbq-badge [badgeColor]="'error'" [compact]="true">2</kbq-badge>
</kbq-navbar-item>
```

- [ ] **Step 2: Build docs examples and render the page**

Run: `yarn run build:components && yarn run build:docs-examples` then open the `navbar-item-custom-component` docs preview; confirm the plain item and the custom component are visually identical (badge in the same corner, bell aligned).

- [ ] **Step 3: Commit**

```bash
git add packages/docs-examples/components/navbar/navbar-item-custom-component/
git commit -m "docs(navbar): plain parity item next to the custom component"
```

---

### Task 4: Document the parity and corner badge

**Files:**

- Modify: `packages/components/navbar/examples.navbar.en.mdx`
- Modify: `packages/components/navbar/examples.navbar.ru.mdx`

**Interfaces:**

- Consumes: Task 3's example.
- Produces: en/ru text explaining the plain ↔ custom equivalence and the corner-badge placement.

- [ ] **Step 1: Update the en/ru docs**

Under the "Custom component as the item" section, add a sentence: a plain item with an icon and badge reproduces the custom component exactly, and a titleless item's badge sits in the top-right corner of the leading area (matching collapsed and the custom component). Keep both languages in sync.

- [ ] **Step 2: Commit**

```bash
git add packages/components/navbar/examples.navbar.en.mdx packages/components/navbar/examples.navbar.ru.mdx
git commit -m "docs(navbar): document plain vs custom component parity"
```

---

### Task 5: Baselines and full verification

**Files:**

- Modify: `packages/components/navbar/__screenshots__/10-light.png`, `10-dark.png` (regenerated)

**Interfaces:**

- Consumes: all prior tasks.

- [ ] **Step 1: Regenerate the custom-component baselines in Docker**

Run: `node tools/e2e/run.js yarn playwright test packages/components/navbar/e2e.playwright-spec.ts -g "E2eNavbarItemCustomComponent" --update-snapshots`

Expected: only `10-light.png` / `10-dark.png` change (the scenario gained a plain item).

- [ ] **Step 2: Run unit, type, lint and build gates**

Run: `yarn run unit:components`, `npx tsc --noEmit -p packages/e2e/tsconfig.app.json`, `yarn run check-e2e-types`, `yarn run eslint`, `yarn run stylelint`, `yarn run prettier`, `yarn run build:components`.

Expected: all pass.

- [ ] **Step 3: Commit**

```bash
git add packages/components/navbar/__screenshots__/10-light.png packages/components/navbar/__screenshots__/10-dark.png
git commit -m "test(navbar): update custom component baselines"
```

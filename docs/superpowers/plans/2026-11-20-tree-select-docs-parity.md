# Tree-select documentation parity with select — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mirror select's page structure onto tree-select: 9 new overview sections, 3 new examples-tab sections, 8 new live examples, both locales, under DS-1582.

**Architecture:** Documentation-only change. New examples live in `packages/docs-examples/components/tree-select/` mirroring their select counterparts; the overview and examples-tab MDX pages are rewritten to select's section order; `structure.ts` gets the `isUpdated` badge. No component code changes.

**Tech Stack:** Angular docs pipeline (`build:docs-content` compiles MDX via `tools/docs-pages`), `@koobiq/docs-examples/i18n` for localized example text, Vitest-free — the gates are `build:docs-examples`, `check-examples-l10n`, `check-docs-pages`, `cspell`, `prettier`.

**Spec:** [docs/superpowers/specs/2026-11-20-tree-select-docs-parity-design.md](../specs/2026-11-20-tree-select-docs-parity-design.md) — the section map there (23 overview rows, tab additions, the 8-example table) is this plan's source of truth for what goes where.

## Global Constraints

- Branch `fix/DS-1582`, cut in a worktree at execution time. Every commit subject carries `(#DS-1582)`. No AI attribution anywhere.
- Both locales of every page keep the same blocks in the same order (`yarn run check-docs-pages` is the gate).
- The examples tab must not repeat any `<Example>` id the overview shows (site would render it twice).
- The examples-tab heading "Smart search" (en) and its Russian counterpart must NOT be renamed: `docs/guides/search-smart.{en,ru}.mdx` link to their anchors.
- Every new example folder has a `l10n.ts` even if empty (`Translations<ExampleTranslation>` pattern, `injectTranslation(TRANSLATIONS)` read as `t()` — see `.claude/rules/docs-examples.md`).
- After registering examples: `yarn run build:docs-examples-module` regenerates the committed `example-module.ts` / `loader/index.ts`; never hand-edit those.
- `isUpdated: expiresAt('<today + 14 days>')` goes on the `TreeSelect` item in `apps/docs/src/app/structure.ts` as its last property, own line, no trailing comma.
- Prettier: 120 columns, 4-space indent, single quotes, no trailing commas; `yarn run prettier:fix` the touched Markdown before committing. New cspell terms go to `tools/cspell-locales/{en,ru}.json`.

## Review Focus

The failure modes the gates below pin, most likely first:

1. **An examples-tab `<Example>` id duplicated in the overview** — the site renders the example twice. Pinned in Task 4 and Task 5 by an id-overlap grep across the two pages.
2. **A renamed heading breaking inbound anchors** — the search-smart guides link `#smart-search`; check-docs-pages catches any other renamed target. Pinned in Task 5 by keeping the heading and in Task 4/5 by running the gate.
3. **en/ru structural divergence** (a section or code block present in one locale only) — pinned by `check-docs-pages` in Tasks 4 and 5.
4. **An MDX `<Example>` id that is not in example-module** (typo) — `build:docs-content` fails with the file position. Pinned in Task 6.
5. **A new example without l10n or with hardcoded translatable text** — `check-examples-l10n` fails. Pinned in Tasks 1–3.

---

### Task 1: Overview-facing examples — validation, disabled, icon

**Files:**

- Create: `packages/docs-examples/components/tree-select/tree-select-validation/{tree-select-validation-example.ts,l10n.ts}`
- Create: `packages/docs-examples/components/tree-select/tree-select-disabled/{tree-select-disabled-example.ts,l10n.ts}`
- Create: `packages/docs-examples/components/tree-select/tree-select-icon/{tree-select-icon-example.ts,l10n.ts}`
- Modify: `packages/docs-examples/components/tree-select/index.ts`

**Interfaces:**

- Consumes: the tree data pattern of `tree-select-overview-example.ts` (FlatTreeControl + KbqTreeFlattener); `injectTranslation` from `@koobiq/docs-examples/i18n`.
- Produces: example ids `tree-select-validation`, `tree-select-disabled`, `tree-select-icon`, registered in `example-module.ts` — Tasks 4 embeds exactly these ids.

- [ ] **Step 1: Create `tree-select-validation`**

Mirror `packages/docs-examples/components/select/select-validation/select-validation-example.ts`: one valid field (plain `kbq-tree-select` with options), one invalid field (`[formControl]` + `Validators.required`, touched in `ngOnInit` so the error shows). Replace the option loop with the tree setup from `tree-select-overview-example.ts` (`kbq-tree-selection` + `dataSource`/`treeControl` + two `*kbqTreeNodeDef` templates, leaf and parent). l10n keys: `placeholder`, `valid`, `invalid`, `none` — Russian plural-safe text in `l10n.ts`.

- [ ] **Step 2: Create `tree-select-disabled`**

Mirror `select-disabled-example.ts` adapted to the tree: a `disabled` field and a normal one; some nodes carry `disabled` in the flattener. l10n keys: `placeholder`, plus whatever labels the select example carries — read it first and translate both.

- [ ] **Step 3: Create `tree-select-icon`**

Mirror `select-icon-example.ts`: `<i kbqPrefix color="contrast-fade" kbq-icon="kbq-globe_16"></i>` inside the form-field, tree data from the overview example. Icon names are not translatable text.

- [ ] **Step 4: Register the three examples**

Add the three imports and classes to `packages/docs-examples/components/tree-select/index.ts` (alphabetical, following the existing lines), then run `yarn run build:docs-examples-module`.

- [ ] **Step 5: Verify**

Run: `yarn run build:docs-examples && yarn run check-examples-l10n && yarn run eslint`
Expected: all three compile; l10n gate passes; no lint errors on the new files.

- [ ] **Step 6: Commit**

```bash
git add packages/docs-examples/components/tree-select packages/docs-examples/example-module.ts packages/docs-examples/loader
git commit -m "docs(examples): add tree-select validation, disabled and icon examples (#DS-1582)"
```

### Task 2: Overview-facing examples — locale-configuration, scrolling-and-layering

**Files:**

- Create: `packages/docs-examples/components/tree-select/tree-select-locale-configuration/{tree-select-locale-configuration-example.ts,l10n.ts}`
- Create: `packages/docs-examples/components/tree-select/tree-select-scrolling-and-layering/{tree-select-scrolling-and-layering-example.ts,l10n.ts}`
- Modify: `packages/docs-examples/components/tree-select/index.ts`

**Interfaces:**

- Consumes: Task 1's tree data pattern.
- Produces: example ids `tree-select-locale-configuration`, `tree-select-scrolling-and-layering`, registered — Task 4 embeds exactly these ids.

- [ ] **Step 1: Create `tree-select-locale-configuration`**

Mirror `select-locale-configuration-example.ts`: a default-strings field, and a second field binding `[localeOverrides]="{ select: { selectAll: ... }, a11y: { clear: ... } }"` with a projected `<kbq-cleaner />` and `multiple selectAll`. Tree data instead of the option loop. The override literals stay English demo text (they demonstrate the API, not translation).

- [ ] **Step 2: Create `tree-select-scrolling-and-layering`**

Mirror `select-scrolling-and-layering-example.ts` (read it first): sticky navbar/topbar, the select inside a content area marked `kbqOverlayLayer`, scrollable body. Tree data instead of the option loop. l10n carries the field labels.

- [ ] **Step 3: Register, regenerate, verify**

Register both in `index.ts`, run `yarn run build:docs-examples-module`, then
`yarn run build:docs-examples && yarn run check-examples-l10n && yarn run eslint`.
Expected: compile, l10n and lint pass.

- [ ] **Step 4: Commit**

```bash
git add packages/docs-examples/components/tree-select packages/docs-examples/example-module.ts packages/docs-examples/loader
git commit -m "docs(examples): add tree-select locale-configuration and layering examples (#DS-1582)"
```

### Task 3: Examples-tab examples — custom-tag-content, no-variants, scroll-strategy

**Files:**

- Create: `packages/docs-examples/components/tree-select/tree-select-custom-tag-content/{tree-select-custom-tag-content-example.ts,l10n.ts}`
- Create: `packages/docs-examples/components/tree-select/tree-select-no-variants/{tree-select-no-variants-example.ts,l10n.ts}`
- Create: `packages/docs-examples/components/tree-select/tree-select-scroll-strategy/{tree-select-scroll-strategy-example.ts,l10n.ts}`
- Modify: `packages/docs-examples/components/tree-select/index.ts`

**Interfaces:**

- Consumes: tree data pattern; `KbqSelectNoOptions` (rendered by tree-select via its `contentChild`, `tree-select.component.ts:465`); `kbqAutoHideScrollStrategyFactory` from `@koobiq/components/core`.
- Produces: example ids `tree-select-custom-tag-content`, `tree-select-no-variants`, `tree-select-scroll-strategy` — Task 5 embeds exactly these ids.

- [ ] **Step 1: Create `tree-select-custom-tag-content`**

Mirror `select-custom-tag-content-example.ts`, but the tree-select template context differs: `let-option` is a `KbqTreeSelectTriggerValue`, and removal calls `select.onRemoveSelectedOption(option, $event)` (NOT select's `onRemoveMatcherItem`). Keep `<kbq-tag>` as the root element — the "+N" counter measures rendered `kbq-tag` elements. Reproduce disabled state from `option.disabled || select.disabled` as select's example does. Read `select-custom-tag-content-example.ts` first for the exact shape.

- [ ] **Step 2: Create `tree-select-no-variants`**

Mirror `select-no-variants-example.ts`: an empty tree-select (no data) with `<kbq-select-no-options>` projected inside — that is the same directive tree-select's `contentChild` reads. l10n carries the label and the message.

- [ ] **Step 3: Create `tree-select-scroll-strategy`**

Mirror `select-auto-hide-scroll-strategy-example.ts` (read it first): a tall scrollable body, the tree-select with `[scrollStrategy]` overridden via a provider of `KBQ_SELECT_SCROLL_STRATEGY` returning `kbqAutoHideScrollStrategyFactory(...)`, an `AfterViewInit` subscription on the strategy's `hide`. Tree data instead of the option loop.

- [ ] **Step 4: Register, regenerate, verify**

Register all three in `index.ts`, run `yarn run build:docs-examples-module`, then
`yarn run build:docs-examples && yarn run check-examples-l10n && yarn run eslint`.
Expected: compile, l10n and lint pass.

- [ ] **Step 5: Commit**

```bash
git add packages/docs-examples/components/tree-select packages/docs-examples/example-module.ts packages/docs-examples/loader
git commit -m "docs(examples): add tree-select tag-content, no-variants and scroll-strategy examples (#DS-1582)"
```

### Task 4: Overview rewrite — both locales

**Files:**

- Modify: `packages/components/tree-select/tree-select.en.mdx`
- Modify: `packages/components/tree-select/tree-select.ru.mdx`
- Modify: `apps/docs/src/app/structure.ts`

**Interfaces:**

- Consumes: example ids from Tasks 1–2: `tree-select-validation`, `tree-select-disabled`, `tree-select-icon`, `tree-select-locale-configuration`, `tree-select-scrolling-and-layering`; the existing dangling `tree-select-two-line-option`.
- Produces: the overview in select's section order; heading texts in both locales that Task 5's tab must not collide with.

- [ ] **Step 1: Restructure `tree-select.en.mdx` to the spec's section map**

Follow the spec's table exactly. The order: Validation → Inactive states → Reset → Multiple (+ `sortComparator` paragraph: panel order, `KbqTreeSelectSortComparator`) → Multiline → Child selection → Hidden-items counter → Customizing tags → `### Filling a list of values` with `####` subsections (List with search, Search for short lists = `searchMinOptionsThreshold`, Select all, Keyboard select-all, Lazy loading, Footer) → Dropdown height → Dropdown width → Optional icon → Layering → Caption in options (wire `tree-select-two-line-option`; text describes the tree-option template approach — there is no `multilineOptions` input on tree-select) → Localization (`[localeOverrides]`, keys `select`/`a11y`, link `/en/main/localization`) → Accessibility (align with select's newer text: naming via label/aria-label/aria-labelledby, tag remove buttons, reduced motion) → Recommendations.

The Customizing tags section carries a code snippet (not a live example, as select does) with the tree-select API: `let-option let-select="select"`, removal via `select.onRemoveSelectedOption(option, $event)`, `<kbq-tag>` root kept. Trim the current a11y text that select's version supersedes rather than concatenating both.

- [ ] **Step 2: Mirror the same structure in `tree-select.ru.mdx`**

Same headings (Russian), same blocks in the same order, same example ids, same code languages. Free wording, identical facts.

- [ ] **Step 3: Add the `isUpdated` badge**

In `apps/docs/src/app/structure.ts`, on the `TreeSelect` item add as the last property, own line, no trailing comma:
`isUpdated: expiresAt('<execution date + 14 days, ISO>')`.

- [ ] **Step 4: Verify**

Run: `yarn run prettier:fix packages/components/tree-select apps/docs/src/app/structure.ts && yarn run prettier && yarn run cspell && yarn run check-docs-pages`
Expected: formatting clean, no spell failures, locale parity holds.
Also check no example id repeats between overview and examples tab:
`comm -12 <(grep -o 'Example id="[^"]*"' packages/components/tree-select/tree-select.en.mdx | sort -u) <(grep -o 'Example id="[^"]*"' packages/components/tree-select/examples.tree-select.en.mdx | sort -u)`
Expected: empty output.

- [ ] **Step 5: Commit**

```bash
git add packages/components/tree-select/tree-select.en.mdx packages/components/tree-select/tree-select.ru.mdx apps/docs/src/app/structure.ts
git commit -m "docs(tree-select): mirror the select page structure on the overview (#DS-1582)"
```

### Task 5: Examples tab — both locales

**Files:**

- Modify: `packages/components/tree-select/examples.tree-select.en.mdx`
- Modify: `packages/components/tree-select/examples.tree-select.ru.mdx`

**Interfaces:**

- Consumes: example ids from Task 3: `tree-select-custom-tag-content`, `tree-select-no-variants`, `tree-select-scroll-strategy`.

- [ ] **Step 1: Add the three sections to `examples.tree-select.en.mdx`**

Three new `####` sections: "Custom tag content" (points back at the overview's Customizing tags section rather than repeating its text; live example), "No available options" (tree-select with empty data + `kbq-select-no-options`; the empty state is exceptional — mirror select's guidance sentence), "Custom scroll strategy" (`KBQ_SELECT_SCROLL_STRATEGY` + `KbqAutoHideScrollStrategy` emitting on `hide`, link to the core overview if select's text does). Do NOT touch the "Smart search" heading (inbound links from the search-smart guides).

- [ ] **Step 2: Mirror in `examples.tree-select.ru.mdx`**

Same blocks, same order, same example ids; the Russian "Smart search" heading stays byte-identical (its anchor is linked from `docs/guides/search-smart.ru.mdx`).

- [ ] **Step 3: Verify**

Run: `yarn run prettier:fix packages/components/tree-select && yarn run prettier && yarn run cspell && yarn run check-docs-pages`
Plus the id-overlap `comm -12` check from Task 4 — expected empty.

- [ ] **Step 4: Commit**

```bash
git add packages/components/tree-select
git commit -m "docs(tree-select): mirror select's examples-tab sections (#DS-1582)"
```

### Task 6: Full pipeline verification

**Files:** none modified (read-only pass; fixes land as amendments to the owning task's commit).

**Interfaces:**

- Consumes: everything above.

- [ ] **Step 1: Compile the pages**

Run: `yarn run build:docs-examples && yarn run build:docs-content`
Expected: `tools/docs-pages` compiles every MDX into page components without "unknown example" or template errors at the new files' positions.

- [ ] **Step 2: Confirm no committed metadata drift**

Run: `git status --short`
Expected: only the task files' commits; `apps/docs/src/llms.txt`, sitemap and SEO descriptions untouched (the first paragraph and routes did not change — no regeneration needed; if `git status` shows them modified by any build step, restore them rather than committing).

- [ ] **Step 3: Manual AXE spot-check note**

No automated gate covers docs examples (the docs smoke e2e runs no a11y scan). Open `yarn run docs` (or the dev app), visit the tree-select page, run the browser's AXE inspector on each new example. Report the result in the PR description; a failure blocks the PR, not a commit.

- [ ] **Step 4: Whole-branch review**

Request a fresh review of the branch diff before opening the PR `fix/DS-1582 → main` with the repo's PR template (summary, notable changes, reviewer focus).

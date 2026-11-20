# Tree-select documentation parity with select

Date: 2026-11-20
Status: draft for approval
Ticket: DS-1582 (branch `fix/DS-1582`)

## Intent

The tree-select page must cover everything its public API offers, with the structure
of the select page as the reference order. The documentation already exists
(`tree-select.{en,ru}.mdx`, 174 lines each, plus an examples tab and 17 live examples);
the work is mirroring select's section set onto it and closing every verified gap.

## Goals

- The overview of tree-select contains a section for every select section that the
  component supports, in select's order, in both locales.
- Every feature the component supports is documented somewhere on the page
  (today `sortComparator`, `searchMinOptionsThreshold`, `#kbqSelectTagContent`,
  `[localeOverrides]`, validation, disabled state and the layering mechanism are not).
- The dangling `tree-select-two-line-option` example is wired into the page.
- New live examples compile, pass AXE and are localized (l10n.ts en/ru) like their
  select counterparts.

## Non-goals

- No component code changes. Documentation only — the component already supports
  everything being documented (verified against `tree-select.component.ts`).
- No regeneration of the committed docs metadata (`llms.txt`, SEO descriptions,
  sitemap): the first paragraph of the overview and the routes do not change.
- No new screenshots/e2e baselines: docs examples are not part of the Playwright
  component suites.

## Anti-goals

- Do not copy select text that describes machinery the tree-select does not have.
  Every mirrored section is checked against the component's actual inputs first.
- Do not duplicate a shared mechanism's documentation: where select already owns the
  explanation (smart search algorithm, `kbqOverlayLayer`), tree-select links to it.

## Constraints

- Both locales must keep the same blocks in the same order (`check-docs-pages`).
- The examples tab must not repeat an `<Example>` id the overview shows.
- `cspell` runs over the Markdown; new terms go into `tools/cspell-locales/{en,ru}.json`.
- After a substantive page change, `structure.ts` gets
  `isUpdated: expiresAt('2026-12-04')` on the `TreeSelect` item (14 days ahead, last
  property, own line).
- `example-module.ts` is generated (`build:docs-examples-module`); new example folders
  are registered in `packages/docs-examples/components/tree-select/index.ts`.
- No inbound anchor links to the **overview** headings exist today (verified), so aligning
  overview heading names with select's is safe. The **examples tab** has inbound links:
  `docs/guides/search-smart.{en,ru}.mdx` link to `/en/components/tree-select/examples#smart-search`
  and the ru anchor — its "Smart search" heading (and the ru heading's id) must not be renamed,
  or both guide locales have to change in lockstep or `check-docs-pages` fails.

## Approaches considered

1. **Close the gaps selectively** — add only the missing sections, keep the current
   order. Cheapest, but the page keeps its own structure and the reader coming from
   select finds sections in unexpected places. Rejected by the user.
2. **Full structural mirror (chosen)** — the overview reuses select's section set and
   order; every select section that the component supports is present, every section
   that depends on unsupported machinery is explicitly dropped. Costs ~6 new live
   examples and a full rewrite pass over both locales, but the two pages read as one
   family.
3. **Minimal** — wire the dangling example and document tag customization only.
   Leaves localization, validation and `sortComparator` undocumented. Rejected.

## Design

### Overview section map

The final order (select's order, with tree-specific sections slotted in):

| #   | Section                                        | Source                                                                                                                                                                                                                                                                                                                             |
| --- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Intro + `tree-select-overview`                 | current, unchanged                                                                                                                                                                                                                                                                                                                 |
| 2   | Validation                                     | **new**, mirrors `select-validation`; new example `tree-select-validation`                                                                                                                                                                                                                                                         |
| 3   | Inactive states                                | **new**; new example `tree-select-disabled`                                                                                                                                                                                                                                                                                        |
| 4   | Reset selected value                           | current                                                                                                                                                                                                                                                                                                                            |
| 5   | Multiple tree-select                           | current + **new** paragraph on panel order and `sortComparator`                                                                                                                                                                                                                                                                    |
| 6   | Multiline matcher                              | current                                                                                                                                                                                                                                                                                                                            |
| 7   | Multiple with child selection                  | current, tree-specific (kept after multiple sections)                                                                                                                                                                                                                                                                              |
| 8   | Counter of the hidden items                    | current, tree-specific (kept; select has no such section)                                                                                                                                                                                                                                                                          |
| 9   | Customizing tags                               | **new**; code snippet in the overview (as select), live example on the examples tab. The snippet cannot copy select's verbatim: the tree-select template context is `{ $implicit: KbqTreeSelectTriggerValue, select }` and the removal API is `select.onRemoveSelectedOption`, not select's `onRemoveMatcherItem` over `KbqOption` |
| —   | Grouping values                                | **dropped**: the tree _is_ the grouping                                                                                                                                                                                                                                                                                            |
| 10  | With search                                    | current, aligned with select's "List with search" (links the Smart search guide)                                                                                                                                                                                                                                                   |
| 11  | Search for short lists                         | **new**: `searchMinOptionsThreshold` is supported                                                                                                                                                                                                                                                                                  |
| 12  | Select all                                     | current                                                                                                                                                                                                                                                                                                                            |
| 13  | Selecting everything from the keyboard         | current                                                                                                                                                                                                                                                                                                                            |
| 14  | Lazy loading                                   | current, tree-specific (kept as the tree's async-data section)                                                                                                                                                                                                                                                                     |
| 15  | With custom footer                             | current                                                                                                                                                                                                                                                                                                                            |
| 16  | Dropdown height                                | current                                                                                                                                                                                                                                                                                                                            |
| 17  | Dropdown width                                 | current                                                                                                                                                                                                                                                                                                                            |
| —   | Customized selection (preselected/prioritized) | **dropped**: inputs not supported                                                                                                                                                                                                                                                                                                  |
| 18  | Optional icon                                  | **new** (`kbqPrefix` icon); new example `tree-select-icon`                                                                                                                                                                                                                                                                         |
| —   | Virtual scroll                                 | **dropped**: not supported                                                                                                                                                                                                                                                                                                         |
| 19  | Layering                                       | **new**; new example `tree-select-scrolling-and-layering`; links the core overview                                                                                                                                                                                                                                                 |
| 20  | Caption in options                             | **new**: wires the existing dangling `tree-select-two-line-option` example; text describes the tree-option template approach (there is no `multilineOptions` input on tree-select)                                                                                                                                                 |
| 21  | Localization                                   | **new**: `[localeOverrides]` resolves `KBQ_SELECT_LOCALE_CONFIGURATION`; new example `tree-select-locale-configuration`                                                                                                                                                                                                            |
| 22  | Accessibility                                  | current, aligned with select's newer a11y text (naming, tag remove buttons)                                                                                                                                                                                                                                                        |
| 23  | Recommendations                                | **new**                                                                                                                                                                                                                                                                                                                            |

### Examples tab

- Keep: custom trigger, custom matcher, matcher with input, deleted nodes, smart search
  (its heading — and the ru heading's id — must not be renamed: the search-smart guides
  link to their anchors).
- Add: `tree-select-custom-tag-content` (the live counterpart of overview section 9).
- Add: a "No available options" section with `tree-select-no-variants` — the
  `KbqSelectNoOptions` content child is supported and rendered in the panel, currently
  documented nowhere (approved by the user).
- Add: a "Custom scroll strategy" section with `tree-select-scroll-strategy`,
  mirroring select's `KBQ_SELECT_SCROLL_STRATEGY` + `KbqAutoHideScrollStrategy`
  example — the `scrollStrategy` input is public and JSDoc'd (approved by the user).
- Loading / pagination examples from select's tab are **not** mirrored: tree-select has
  no loading or pagination machinery to drive them; the tree's async-data story is lazy
  loading (overview) plus deleted nodes (tab).

### New live examples

| Example                              | Mirrors                            | Notes                                     |
| ------------------------------------ | ---------------------------------- | ----------------------------------------- |
| `tree-select-validation`             | `select-validation`                | form + invalid state                      |
| `tree-select-disabled`               | `select-disabled`                  |                                           |
| `tree-select-icon`                   | `select-icon`                      | `kbqPrefix` icon                          |
| `tree-select-locale-configuration`   | `select-locale-configuration`      | l10n overrides                            |
| `tree-select-scrolling-and-layering` | `select-scrolling-and-layering`    | `kbqOverlayLayer`                         |
| `tree-select-custom-tag-content`     | `select-custom-tag-content`        | examples tab only                         |
| `tree-select-no-variants`            | `select-no-variants`               | examples tab only; `KbqSelectNoOptions`   |
| `tree-select-scroll-strategy`        | `select-auto-hide-scroll-strategy` | examples tab only; `scrollStrategy` input |

Each gets a `l10n.ts` (en/ru) and a line in the docs-examples `index.ts`;
`example-module.ts` is regenerated, not hand-edited.

### Verification

- `yarn run build:docs-examples` — the new examples compile and their templates pass.
- `yarn run check-docs-pages` — the two locales stay structurally identical.
- `yarn run cspell`, `yarn run prettier` on the touched Markdown.
- AXE: no automated gate covers the docs examples (the docs smoke e2e runs no
  accessibility scan), so the requirement is a manual spot-check of the new examples
  in the running docs app, not a CI step.

## What is left to the builder

- The exact wording of each new section in both locales (the design fixes the facts,
  not the sentences).
- Where the two "counter of hidden items" paragraphs sit once section order changes.
- Any cspell dictionary additions the new wording needs.

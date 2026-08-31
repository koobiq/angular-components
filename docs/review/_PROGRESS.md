# Component review coverage — COMPLETE

Goal: a `REVIEW.<component>.md` + `REVIEW.<component>.RU.md` pair for **every** package under
`packages/components/`, matching the format of the existing docs.

**Status: done.** All **64** packages have a pair — 133 files in this directory. Every pair was
verified mechanically to carry identical finding-ID sets *and* identical per-ID occurrence counts;
all files are LF. 17 P0 findings were raised in this pass (35 across the whole corpus including the
20 pre-existing reviews).

Baseline commit `b665e503` · started and finished 2026-08-28.
Shared authoring spec (format, severity scale, verification rules) lives in the session scratchpad
as `REVIEW_SPEC.md` and is handed to every reviewer agent.

## Already reviewed before this pass (20)

accordion · alert · app-switcher · button · button-toggle · docs-app · filter-bar · form-field ·
list · navbar · notification-center · popover · search-expandable · select · split-button · title ·
toast · tooltip · tree · tree-select

## Done in this pass

| Component | EN | RU | Headline finding |
|---|---|---|---|
| divider | OK | OK | vertical variant collapses in flex rows; guide documents a non-existent `inset` input |
| ellipsis-center | OK | OK | package ships no CSS — both consumers paste the same 14 declarations |
| skeleton | OK | OK | default token is ~92% transparent; both in-repo apps override it with the deprecated token file |
| flag | OK | OK | `object-fit: cover` is inert on inline `<svg>` — square/circle letterbox instead of cropping |
| progress-bar | OK | OK | **P0** reduced-motion drops the indeterminate fill to `width: auto` → reads as 100% complete |
| dynamic-translation | OK | OK | slot names interpolated into a `RegExp` unescaped; positional capture-group reads |
| sidebar | OK | OK | `opened` is a mutated plain `@Input`; a single `]` keypress can strand a pane closed forever |
| table | OK | OK | `selector: 'kbq-table td'` has no descendant combinator — it matches every `<td>` in the app |
| progress-spinner | OK | OK | dash-array is the `big` circumference while the default size draws a smaller circle: 50% renders 55% |
| top-bar | OK | OK | host pinned to the CDK overlay z-index layer; docs site already works around it |
| empty-state | OK | OK | stylesheet consumes 24 tokens it never `@use`s — degrades silently across the package boundary |
| loader-overlay | OK | OK | no a11y implementation at all, while both guides promise focus blocking |
| badge | OK | OK | `outline` unstyled for 5 of 11 colours; every fixture in the repo avoids the combination |
| resizer | OK | OK | **P0** the resize handle has no `tabindex`, no keydown and no ARIA — unusable by keyboard |
| clamped-text | OK | OK | the disclosure trigger has no `role`/`aria-expanded`/`aria-controls`; state lives on a role-less wrapper |
| username | OK | OK | `hasFullName` ANDs first+last name, so a one-name profile renders an empty element |
| markdown | OK | OK | **P0** `marked` output goes through `bypassSecurityTrustHtml` unsanitized — an undocumented XSS sink |
| content-panel | OK | OK | closing the panel destroys the focused close button and drops focus to `<body>` |
| splitter | OK | OK | **P0** the gutter is mouse-only: no `tabindex`, no keydown, no separator ARIA |
| link | OK | OK | the `@media print` block is nested one level too deep — the whole print feature emits nothing |
| actions-panel | OK | OK | **P0** the focus trap's side effect makes CDK `aria-hidden` the rest of the still-interactive app |
| textarea | OK | OK | auto-grow never re-measures on resize; `overflow-y: hidden` then clips the text silently |
| toggle | OK | OK | the component's own provider shadows the published `KBQ_CHECKABLE_CLICK_ACTION` token everywhere |
| icon | OK | OK | the SVG stream terminates on the first unresolved name, so later `[kbq-icon]` changes are dropped |
| overflow-items | OK | OK | `debounceTime` is read in the constructor, before Angular writes inputs — the escape hatch is inert |
| checkbox | OK | OK | **P0** a label-less checkbox has no accessible name; the JSDoc promises an `aria-label` input that does not exist |
| sidepanel | OK | OK | no `role="dialog"`, no `aria-modal`, no name, and nothing behind the overlay is hidden from AT |
| breadcrumbs | OK | OK | hardcoded English `aria-label` as a host *binding* clobbers the consumer's; all 21 call sites write `<nav>` by hand |
| timepicker | OK | OK | unparseable input never invalidates: the field shows the text while the form keeps the old time and reports VALID |
| modal | OK | OK | **P0** one ARIA attribute in the whole package: no `role="dialog"`, no name, nothing behind it inert |
| timezone | OK | OK | the sort comparator returns the first offset instead of a difference, so a world-wide list sorts wrong |
| inline-edit | OK | OK | **P0** two sentinels carry `aria-hidden="true"` *and* `tabindex="0"` — a hard axe `aria-hidden-focus` failure |
| tabs | OK | OK | **P0** `KbqTabGroup` ships no ARIA tabs pattern at all, while `KbqTabNavBar` next to it implements it fully |
| autocomplete | OK | OK | **P0×2** no combobox semantics on the trigger; `role="listbox"` over children with no `role="option"` |
| code-block | OK | OK | **P0** the soft-wrap toggle is an icon-only button with no accessible name; its three siblings have one |
| scrollbar | OK | OK | every viewport registers a `CdkScrollable` app-wide with no opt-out; three consumers wrote three guards |
| input | OK | OK | **P0** the number input patches `HTMLInputElement.prototype.valueAsNumber` for the whole application |
| dropdown | OK | OK | **P0** unconditional `aria-expanded` on a `role=generic` host — a critical axe `aria-allowed-attr` failure |
| file-upload | OK | OK | the remove control is a nameless, roleless tab stop that neither Enter nor Space activates |
| tags | OK | OK | **P0** a roving multi-select widget with zero ARIA, where `Delete` destroys every selected tag |
| datepicker | OK | OK | **P0** the calendar is mouse-only: no keydown anywhere, and the toggle itself is `tabindex="-1"` |
| core | OK | OK | `KbqThemeService` calls `matchMedia` in a field initializer — every SSR app using the theme switcher crashes |
| radio | OK | OK | group-less radios share `name === undefined` and un-check each other application-wide |
| dl | OK | OK | the "measured term width" measures the stretched grid track, not the term |
| time-range | OK | OK | **P0** `toDate` is fed from the time control — a picked end date is silently discarded |

`core` is not a component but a published entry point every component composes, so it was reviewed
last and by subsystem rather than as one pass. Its review states its own scope explicitly: covered in
depth are `locales/`, `formatters/`, `pop-up/`, `services/theme.service.ts`, `a11y/key-manager/`,
`selection/`, `datetime/`, `error/`, `tokens/window.ts`, `utils/`, `forms/` and the SCSS entry points;
deliberately deferred to a later pass are `option/`, `overlay/`, `select/common.ts`, `highlight/`,
`search/`, `overflow-shadow/`, `form-field/`, `keycodes/`, `validation/` and `styles/{typography,visual}`.
That is the one place in this corpus where coverage is partial by design — everything else is whole-package.

## Cross-cutting facts established during this pass (reusable, verified)

- `playwright.config.ts:101` forces `reducedMotion: 'reduce'` on **every** browser context, so every
  committed baseline captures the reduced-motion rendering. Two packages' baselines currently certify
  a reduced-motion defect rather than catching it (`progress-bar`, `flag`).
- `grep -rn "progressbar" packages/ apps/` returns **zero** hits repo-wide — neither `progress-bar`
  nor `progress-spinner` nor `loader-overlay` exposes `role="progressbar"`. Whoever fixes one should
  fix all three together.
- `apps/docs/src/main.scss:3-4` and `packages/components-dev/skeleton/styles.scss:1-2` are the only
  two imports of `@koobiq/design-tokens/web/deprecated` in the repository, and both exist to make
  `skeleton` visible — so no surface in this repo renders the defaults an external consumer gets.
- Several packages ship a fixture that avoids the very combination that is broken (`badge` outline
  colours, `divider` in a flex row, `loader-overlay` height, `progress-spinner` sizes). When a
  fixture keeps a hand-curated subset where the API allows a full matrix, that is a finding.

## Conventions (carried over from the existing docs)

- Untracked by design — `docs/review/` is not gitignored, just never committed.
- Not prettier-formatted; match the siblings' on-disk style.
- EN and RU must carry identical finding IDs; verify by diffing the sorted ID sets.
- No central index of reviews — each pair cross-references only its own mirror.
- Severity: P0 release blocker · P1 high · P2 should fix · P3 hygiene.

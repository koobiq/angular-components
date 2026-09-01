# Koobiq monorepo — full repository review

| | |
|---|---|
| Repository | `koobiq/angular-components` |
| Reviewed tree | branch `fix/DS-3055` @ `4200e84eb` (2 ahead / 10 behind `origin/main` @ `c33811a5e`) |
| Date | 2026-08-30 |
| Scope | everything: `packages/**`, `apps/**`, `tools/**`, `.github/**`, `docs/**`, root configuration |
| Method | 16 parallel domain reviewers, then per-finding verification against the source by the lead |
| Outcome | report only — no source file was modified |

---

## Executive summary

The library is in better shape than its size suggests. All four automated gates pass on this tree —
`eslint`, `stylelint`, `prettier`, `cspell` are green — the SSR discipline holds almost everywhere,
`takeUntilDestroyed` is the norm, and the recently reworked components (`accordion`, `list`, `dl`,
`resizer`, `scrollbar`, `navbar`, `app-switcher`, `breadcrumbs`, `form-field`) are genuinely careful
code. **Every finding below is something no tool in the repository can catch.**

Four themes carry almost all the risk.

**1. Accessibility is split into two libraries.** Components touched in the last year publish correct
roles and localized names. The older core widgets publish *none*: `kbq-select`, `kbq-tab-group`,
`kbq-tree-selection`, the datepicker calendar and `kbq-modal` have no `role`, no state attributes and,
in two cases, no keyboard path at all. `AGENTS.md` states the library "MUST pass all AXE checks" and
"MUST follow all WCAG AA minimums"; five widgets currently cannot. Only 5 of 124 component specs make
a single `jest-axe` assertion, and the covered set is exactly the set that turned out clean.

**2. Several safety nets are inert.** They exist, they are referenced in comments and docs, and they
do nothing: `jest-fail-on-console` has an inverted predicate, so no Angular error can fail a unit test;
the changelog's header regex rejects every `!` breaking-change commit, and 11 such commits are queued
for the next release with no changelog entry; the release bundle validator globs a directory layout
`ng-packagr` stopped emitting two majors ago; the pre-release npm dist-tag guard returns the same array
in both branches; `check-api` never sees `scrollbar/deprecated`. Each looks like coverage on the
dashboard and provides none.

**3. Half-finished migrations left drift.** 340 `// TODO: Skipped for migration because:` markers mark
where the signal migration stopped; the consequences are concrete — `KbqButtonToggleGroup` freezes its
`SelectionModel` multiplicity while everything derived from `multiple()` stays reactive, `kbq-select`
and `kbq-tree-select` refuse a runtime `multiple` change but let `multiline` do it silently, and
`writeValue` emits change notifications in three components. The same drift shows up between
near-duplicate code paths: the moment and luxon date adapters disagree on `startOf`; the timepicker's
copy of the datepicker's mask engine lost the `readOnly` guard.

**4. The English documentation trails the Russian.** Six links in EN docs land on the 404 page while their
RU counterparts carry the locale prefix at the same line numbers; two documented examples do not exist; the
`button` page documents two color values that fail type-check and references one example where RU
references eight; both `progress-*` pages document a default that is wrong and colors that match no CSS
rule. The pattern is consistent — RU is maintained, EN is not — and the fix for almost every case is
already sitting in the paired file.

The one security-shaped finding is **CI-01**: `/approve-snapshots` checks out a mutable branch name
without `repository:` in a job holding `contents: write`, so the code that runs is not necessarily the
code the reviewer read.

`fix/DS-3055` itself is close to mergeable — `git merge-tree` is clean against `origin/main` and nothing
on main touches the datepicker — but see **BR-01**: the commit is titled as a fix for a defect the
library still contains.

---

## Scorecard

| # | Domain | Findings | P0 | P1 | P2 | P3 | Verdict |
|---|---|---|---|---|---|---|---|
| 1 | Build / test / lint configuration | 17 | 0 | 1 | 3 | 13 | one inert safety net, otherwise sound |
| 2 | CI/CD, release, supply chain | 14 | 1 | 2 | 7 | 4 | strong hygiene, one exploitable checkout |
| 3 | Documentation & content pipeline | 19 | 2 | 4 | 7 | 6 | RU is ahead of EN almost everywhere |
| 4 | Public API guard & release tooling | 20 | 0 | 7 | 8 | 5 | the guard is honest; the release path is not |
| 5 | `core` — locales, formatters, dates, forms | 19 | 0 | 5 | 8 | 6 | adapter drift is the dominant risk |
| 6 | `core` — overlay, pop-up, a11y, selection | 16 | 0 | 2 | 6 | 8 | shared mechanisms multiply their defects |
| 7 | `filter-bar` | 16 | 0 | 1 | 8 | 7 | large, well tested, latching subjects |
| 8 | Date & time components | 21 | 0 | 5 | 11 | 5 | the weakest input parsing in the library |
| 9 | Selection cluster | 17 | 0 | 2 | 12 | 3 | drift between six near-identical widgets |
| 10 | Overlay cluster | 20 | 0 | 3 | 15 | 2 | lifecycle and focus restoration |
| 11 | Form-control cluster | 22 | 0 | 6 | 12 | 4 | CVA contract violations |
| 12 | Remaining ~35 components | 20 | 0 | 1 | 9 | 10 | mostly clean; one XSS sink |
| 13 | SCSS, tokens, theming | 12 | 0 | 0 | 2 | 10 | the healthiest domain |
| 14 | Accessibility | 23 | 5 | 15 | 2 | 1 | **the worst domain by a wide margin** |
| 15 | Test suite quality | 19 | 3 | 10 | 4 | 2 | green tests that cannot fail |
| 16 | Branch & review branches | 12 | 0 | 3 | 6 | 3 | rebase, then relabel the commit |
| 17 | Lead's own sweep | 8 | 0 | 1 | 3 | 4 | configuration drift |
| | **Total** | **295** | **11** | **68** | **123** | **93** | |

Severity: **P0** release blocker — user-visible breakage, security, or a test that certifies a defect ·
**P1** real bug or serious risk · **P2** should-fix correctness/maintainability · **P3** hygiene.

Every P0 and P1 below was re-read in the source by the lead before inclusion; unconfirmed claims were
dropped rather than downgraded. Findings marked *needs-verification* have a proven mechanism but a
user-visible trigger that requires a run to observe.

---

## P0 — release blockers

### P0-1 · CI-01 · `/approve-snapshots` runs code the reviewer did not read, and can push to `main`
`.github/workflows/e2e-approve-snapshots.yml:26-30`

```yaml
- uses: xt0rted/pull-request-comment-branch@…
  id: comment-branch
- uses: actions/checkout@…
  with:
    ref: ${{ steps.comment-branch.outputs.head_ref }}
```

Two defects in a job that holds `contents: write` (line 23) and then executes PR-controlled code
(`npm run e2e:docker:update-snapshots` → `tools/e2e/run.js`, all from the checked-out ref).

1. `head_ref` is a **branch name**, not a commit. The author can push between the reviewer's comment and
   the checkout; the action exposes `head_sha` and it is unused. The file's own banner admits the gate
   "only verifies the commenter, not the safety of the code being run".
2. There is no `repository:`, so `ref` resolves against the **base** repo. A fork PR whose head branch is
   named `main` checks out base `main`, regenerates baselines against it, and
   `stefanzweifel/git-auto-commit-action` (line 51, `file_pattern: '**/*.png'`, no `branch:`) pushes the
   result straight to the default branch — triggered by a PR comment.

`persist-credentials` also defaults to `true`, so a repo-write token sits in `.git/config` while that
PR-controlled script runs on the runner (CI-09). The same missing `repository:` exists in
`.github/workflows/redeploy-preview.yml:26,31-33`, where the payload is the Firebase service-account key.

**Fix:** resolve the head explicitly (`gh pr view --json headRefOid,headRepository`), check out
`repository: <owner>/<name>` at `ref: <headRefOid>`, set `persist-credentials: false`, and refuse fork
PRs outright — `GITHUB_TOKEN` cannot push to a fork, so that path has no working outcome anyway.

### P0-2 · A11Y-SELECT-001 · `kbq-select` publishes no combobox, listbox or option semantics
`packages/components/select/select.component.ts:236-238`, `packages/components/core/option/option.ts:149-161`

The select host is focusable and binds only `aria-invalid`/`aria-required` — no `role`, no
`aria-expanded`, no `aria-haspopup`, no `aria-controls`, no `aria-activedescendant`. `select.html` has no
`role="listbox"`. `KbqOption`'s host has no `role="option"`, no `aria-selected`, no `aria-disabled`;
selection is conveyed by the `kbq-selected` class alone. `getTabIndex()` (`option.ts:391`) returns `'0'`
for **every** enabled option, so Tab walks the entire list instead of leaving it — neither a roving
tabindex nor an activedescendant pattern.

Verified: the only `role="listbox"` in the library is `autocomplete.html:3` and
`list-selection.component.ts:189`; the only `role` in `core/option` is `optgroup.ts:17` (`role="group"`),
which is invalid ARIA without an owning listbox. `autocomplete`'s panel therefore declares `listbox` over
children with no `option` role — axe `aria-required-children`.

**Consequence:** a screen-reader user hears an unlabelled clickable, is never told collapsed/expanded, is
never told which option is active while arrowing, and is never told what is selected. Applies equally to
`tree-select` and `autocomplete`. `list-selection.component.ts:187-199` and `:1332-1345` are the correct
in-repo pattern to copy.

### P0-3 · A11Y-TABS-001 · `kbq-tab-group` renders no tab semantics
`packages/components/tabs/tab-group.html:10-24,46-56`

No `role="tablist"` on the header, no `role="tab"`/`aria-selected`/`aria-controls` on the labels, no
`role="tabpanel"`/`aria-labelledby` on the body. `getTabLabelId`/`getTabContentId`
(`tab-group.component.ts:336-343`) generate stable ids that **nothing references**. Keyboard navigation
works (`paginated-tab-header.ts:296-323`); only the semantics are absent. The sibling `tab-nav-bar.ts`
(`:172-176,338-340`) does it correctly, so the two tab APIs disagree with each other.

### P0-4 · A11Y-TREE-001 · `kbq-tree-selection` has no tree semantics and a mouse-only expander
`packages/components/tree/tree-selection.component.ts:165-173`, `tree/toggle.ts:83-88`

No `role="tree"`, no `role="treeitem"`, no `aria-expanded`/`aria-level`/`aria-selected`/`aria-setsize`.
The expand/collapse toggle has no role, no `tabindex`, no keydown handler and no accessible name — branch
nodes can only be opened with a mouse (**WCAG 2.1.1, Level A**). Its `[attr.disabled]` is inert on a
non-form element, so assistive technology is not told it is disabled either.

### P0-5 · A11Y-DATEPICKER-001 / DT-05 · the calendar popup is entirely keyboard-inaccessible
`packages/components/datepicker/calendar-body.html:12-30`, `calendar-header.html:12,32,64,76,89`

Every day cell is a `<td [tabindex]="-1" (click)>` with no role, no `aria-selected`, no `aria-disabled`,
no `aria-current` and no name beyond the bare number. Both header selects and all three navigation
buttons are also `tabindex="-1"`. There is no keydown handler anywhere in `calendar*.ts` or
`month-view.component.ts`, nothing focuses the panel on open, and `datepicker-input.directive.ts:730`
closes the panel on Tab. `datepicker-content.html` has no `role="dialog"` and no focus trap.

A keyboard user can open the panel with `Alt+ArrowDown` and then cannot reach or activate any date.
The two "a11y" specs (`calendar.spec.ts:307-328`) dispatch `ENTER` at `.kbq-calendar__body` and assert
`selected` is `undefined` — they pass **because no handler exists**, so the gap is masked rather than
covered.

### P0-6 · A11Y-MODAL-001 · `kbq-modal` has no dialog role, no `aria-modal` and no accessible name
`packages/components/modal/modal.component.html:30`

`cdkTrapFocus` is applied, but `grep -rn "role" packages/components/modal` (excluding specs) returns
**nothing** — verified. Opening a modal announces nothing, the virtual cursor is not confined, and the
dialog has no name. `sidepanel` and `popover` have the same gap.

### P0-7 · TST-01 · a try/catch swallows the only assertion
`packages/components/modal/modal.spec.ts:543`

```ts
try { fixture.componentInstance.modalService.open({ kbqComponent: CustomModalComponent }); }
catch (error) { expect(error.message.includes('NullInjectorError')).toBeTruthy(); }
```

If `open()` stops throwing — exactly the regression this test guards — the `catch` never runs, zero
assertions execute, and the test is green. It certifies the broken state as correct.
**Fix:** `expect(() => …).toThrow(/NullInjectorError/)`.

### P0-8 · TST-02 · `progress-bar`'s entire DOM contract is unfalsifiable
`packages/components/progress-bar/progress-bar.component.spec.ts:47,58,65`

```ts
expect(progressBarDebugElement.query(By.css('.kbq-progress-bar__line_determinate'))).toBeDefined();
```

`DebugElement.query` returns `null` when nothing matches, and `expect(null).toBeDefined()` passes. All
three tests — determinate, indeterminate, and the default — would pass if the `@switch` rendered the
opposite branch or nothing at all. They are the only unit coverage of that switch. Same shape at
`progress-bar:83`, `progress-spinner:115`, `loader-overlay:44,59`, `tree-select:3198,3305` (TST-08/09/10).

### P0-9 · TST-03 · every assertion inside an unguarded `subscribe`
`packages/components/select/select.component.spec.ts:6289-6326`

All three `expect`s live inside `options.changes.pipe(take(1)).subscribe(…)`, and nothing asserts the
callback ran. If `options.changes` stops emitting, the test passes having asserted nothing. The title
also promises tag **sorting**; the body only checks the selected-value set, never an ordering.

### P0-10 · DOC-01 · six links in the English docs navigate to the 404 page
`docs/guides/theming.en.md:17,55,92,186`, `packages/components/sidepanel/sidepanel.en.md:5`,
`packages/components/tooltip/tooltip.en.md:89`

All six are locale-less absolute links — `](/main/installation)`, `](/components/core)`,
`](/main/design-tokens/colors)` ×2, `](/components/modal)`, `](/components/popover)`. `routes.ts:14-21`
gates `:lang` with `canMatchLocaleRoutes`, and `main`/`components` are not locales, so each falls through
to the `**` → 404 redirect at `:185`. `docs-marked-renderer.ts:115` passes non-`guides/` hrefs through
untouched, so nothing re-adds the prefix.

**Verified:** the RU counterparts carry `/ru/…` at the *identical line numbers* in all six files — this is
an EN-only omission, not a convention. **Fix:** prefix all six with `/en`.

### P0-11 · DOC-02 · two documented examples render as blank gaps
`packages/components/tags/tag.en.md:23` (`tag-with-remove-button`),
`packages/components/loader-overlay/loader-overlay.en.md:70` (`loader-overlay-on-background`)

Verified: neither key exists in `packages/docs-examples/example-module.ts` (zero matches) and neither has
a directory. `docs-live-example-viewer.ts:137` logs a console error and returns, so each section renders
as a heading and prose with nothing beneath it. These are the only 2 dangling references out of 576.

**Fix:** `loader-overlay.en.md:70` → `loader-overlay-card` (the RU file already uses it at the same line);
for `tag.en.md:23` either point at the existing `tag-removable` or drop the section — RU has no such
section at all (DOC-11).

---

## P1 — real bugs and serious risks

### Release, API and tooling

**CFG-001** · `tools/jest/setup.ts:13-18` · `jest-fail-on-console` is a repo-wide no-op. The predicate is
`!(message === 'Error: Could not parse CSS stylesheet')`, and the library silences on a **truthy** return
(`node_modules/jest-fail-on-console/index.js:63-67`, verified). So every message except that one exact
string is silenced, and the only message that can fail a test is the one the comment says to ignore.
`NG0…` errors, `ExpressionChangedAfterItHasBeenChecked`, RxJS unhandled errors and zone warnings cannot
fail any suite in `units.yml`. **Fix:** `silenceMessage: (m) => m.includes('Could not parse CSS stylesheet')`.

**API-008** · `packages/cli/src/release/changelog.ts:49` · the changelog drops every breaking change. The
custom `headerPattern` has no place for the conventional-commits `!`; verified by running it —
`feat(components)!: …`, `feat!: …` and `fix(a,b)!: …` all fail to parse. The one `!` commit in the
`20.1.0..20.2.0` range (`06dfe64aa`, DS-3244) does not appear anywhere in `CHANGELOG.md` (verified: zero
matches). **11 more `!` commits are queued since tag `20.2.0`**, including `feat(file-upload)!`,
`feat(list,tree,core)!` and `fix(form-field)!`. **Fix:** `…(.*)\))?!?: (.*)$`.

**API-009** · `changelog-writer-options.ts:84-96` vs `:168-174` · `breakingChanges` and `deprecations` are
collected and exposed on `context.packageGroups`, and the `template` function renders only
`group.commits`. In conventional-changelog-writer 9 the template *is* the whole renderer, so the old
`footer.hbs` is never invoked. The last `#### BREAKING CHANGES` heading in `CHANGELOG.md` is at line 726
(18.22.0).

**API-010 / CI-02** · `publish.yml:5-6,51`; `publish-release-ci.ts:61`; `publish-release-from-dist.ts:52`
· a pre-release tag publishes to npm `latest`. The tag filter `'*.*.*'` matches `20.3.0-rc.0`, `-t latest`
is hardcoded and flows through `publish-release-github-ci.ts:57` → `npm publish --tag latest`. The single
guard built to prevent this, `getDistTagChoicesForVersion` (`npm-dist-tag-prompt.ts:35-44`), returns the
identical `[LATEST, NEXT, LTS]` array in both branches under a `// TODO: for refactoring` — verified.
`docs-stable.yml:5-6` (`tags: 20.*.*`) matches the same tag, so an RC would also deploy to `koobiq.io`
and fire the Algolia crawl. Latent today; the first pre-release tag breaks every `npm i @koobiq/components`.

**API-011** · `packages/cli/src/release/base-release-task.ts:89-93,98-102` · both release guards are
commented out, leaving two empty `if` blocks. `stage-release.ts:123` then runs `git add -A`, so any
unrelated dirty file is swept into the version-bump commit and, in `stage-release-commit`, into the
signed tag that is pushed and published.

**API-001** · `tools/api-extractor/config.json` · `scrollbar/deprecated` is a real secondary entry point
with a committed golden file and a baseline entry, but is absent from the `components` list, so
`approve-api`/`check-api` never touch it. Any future change to that entry point ships unguarded.

**API-002** · `packages/components/scrollbar/index.ts:1` · the entry is `export * from './scrollbar'`
instead of `'./public-api'`, so `public-api.ts` is dead and **`KbqScrollbarModule` is not exported** from
`@koobiq/components/scrollbar`. The golden file faithfully records the hole. NgModule consumers cannot
import the module.

**API-003** · `tools/api-extractor/api-extractor.ts:16-21`, `docs/PUBLIC_API.md:15` · the documented
command `yarn run approve-api <component>` splits on `/`, gets `component === undefined`, iterates two
empty arrays and **exits 0 having done nothing**. Anyone following the docs believes they approved the
API and commits a stale golden file. The working form is `approve-api components/button`.

**CI-03** · `package.json:21,60` · the Angular train is internally unsatisfiable.
`@angular/animations@20.3.27` declares `peerDependencies: {"@angular/core": "20.3.27"}` (verified in the
installed manifest) while core resolves to `20.3.29`; `@angular/platform-browser-dynamic@20.3.27` has four
such unsatisfied exact peers. Yarn's node-modules linker downgrades this to a warning; npm would
`ERESOLVE`. `@angular/cdk@20.2.14` is **benign** (caret range). Neither `check-peer-deps` (published
manifests only) nor `check-npm-resolution` (packed `dist/` against fixtures) looks at the root tree.

### Component code

**CORE-B-01 / SEL-01** · `packages/components/core/option/option.ts:405` +
`core/a11y/key-manager/list-key-manager.ts:215` · **mouse range-selection in `kbq-select` is unreachable.**
`onMouseenter` calls `keyManager.setActiveItem(this)`, and `setActiveItem` unconditionally sets
`previousActiveItemIndex = _activeItemIndex` — which is the shift-click range anchor. A real click always
crosses the target with the pointer first, so by the time `setSelectedOptionsByClick` reads the anchor it
already equals the clicked index, `fromIndex === toIndex`, and the code takes the single-toggle branch
(`select.component.ts:1671-1684`). Verified end to end. `KbqTreeSelection` guards this
(`tree-selection.component.ts:794`: `if (!shiftKey && !ctrlKey)`) and `KbqListSelection` never calls
`setActiveItem` at all — yet the select's comment claims it "Mirrors `KbqTreeSelection`". The specs pass
because jsdom's `.click()` fires no `mouseenter`.

**SEL-02** · `packages/components/select/select.component.ts:1682,1702` · the shift-click fallback calls
`selectionModel.toggle(option)`, which mutates the model first; `onSelect` then reads
`wasSelected = selectionModel.isSelected(option)` **after** the change (`:2163`), so the guard at `:2187`
(`wasSelected !== …`) is always false and `propagateChanges()` never runs. Verified through the
`selectionModel.changed → option.select() → optionSelectionChanges → onSelect` chain. The option paints
selected and the trigger updates, while the form control, `selectionChange`, `valueChange` and `onChange`
are never notified.

**FB-01** · `packages/components/filter-bar/pipes/pipe-select.ts:39` and 8 sibling files ·
`providers: [{ provide: KbqBasePipe, useExisting: this }]`. Inside a decorator argument `this` is
module-scope. It works in the AOT bundle only because ngtsc re-emits the literal inside
`static { this.ɵcmp = … }`; the **same literal is re-emitted at module level** inside
`ɵɵngDeclareClassMetadata` — verified in `dist/components/fesm2022/koobiq-components-filter-bar.mjs:751`
— where `this === undefined`. Any JIT path yields `{useExisting: undefined}` and `NG0201`. All 8 pipe
specs patch it away with `overrideComponent`, so the shipped provider is exercised by zero tests.
**Fix:** `useExisting: forwardRef(() => KbqPipeSelectComponent)`, then delete the 8 overrides.

**OVL-01** · `packages/components/modal/modal.component.ts:472` · `kbqCloseByESC` is never read by the
component. The host `onKeyDown` closes on Escape unconditionally and calls `close()` directly rather than
`handleCloseResult('cancel', …)` — verified; the input appears only at `:173` and in `modal.service.ts:41`.
So `[kbqCloseByESC]="false"` does not work, and a `kbqOnCancel` returning `false` to guard unsaved data is
bypassed on the Escape path.

**OVL-02** · `packages/components/modal/modal.component.ts:389` · a modal destroyed while open locks the
page. `ngOnDestroy` only disposes the overlay: `body { overflow: hidden }` is removed only from the close
branch, and `KbqModalControlService.removeOpenModal` runs only from `afterClose`. Navigating away from a
route containing `<kbq-modal [kbqVisible]="true">` leaves the body unscrollable **permanently**, because
the stale ref keeps `openModals.length > 0`.

**OVL-03** · `packages/components/popover/popover.component.ts:462` · every popover subscribes the root
`ScrollDispatcher` with no teardown — verified, and the sibling subscription six lines above does use
`takeUntilDestroyed`. `closeOnScroll === null` is the default, so this applies to every `[kbqPopover]`.
Each destroyed trigger stays registered forever and runs `getBoundingClientRect()` on a detached node on
every scroll event, application-wide.

**SWP-01** · `packages/components/markdown/markdown.component.ts:99` · **XSS sink.**
`sanitizer.bypassSecurityTrustHtml(markdownService.parseToHtml(...))`, bound with `[innerHtml]`.
`KbqMarkdownService.parseToHtml` is documented as *not* sanitizing (`markdown.service.ts:12`) and `marked`
passes raw HTML through. `<kbq-markdown [markdownText]="commentFromApi">` executes
`<img src=x onerror=…>`. The sibling `code-block-highlight.ts:179` does it correctly with
`sanitizer.sanitize(SecurityContext.HTML, …)`. **Fix:** sanitize the output; reserve the bypass for an
explicit opt-in input.

**FRM-001** · `single-file-upload.component.ts:113,293` and `multiple-file-upload.component.ts:121,312` ·
`writeValue` assigns through a setter that calls `cvaOnChange` — verified. Every programmatic
`setValue`/`reset` marks the control dirty and re-emits `ngModelChange`; `control.reset()` leaves the
multiple variant's value as `[]` instead of `null`.

**FRM-002** · `single-file-upload.component.ts:250` · `dropzoneService.filesDropped.subscribe(...)` sits
**inside** an `effect`, so each `[fullScreenDropZone]` change adds another subscription and none are torn
down; one dropped file then fires `onFileDropped` N times. The multiple variant does it correctly outside
the effect.

**FRM-003** · `packages/components/file-upload/dropzone.ts:103` · `ngOnDestroy` calls `close()` but never
`stop()`, and `stop()` is the only thing that fires `dropAbort` — verified. Four `document.body` drag
listeners survive component destruction and `open()` then builds a portal through the destroyed
component's injector.

**FRM-004** · `packages/components/inline-edit/inline-edit.ts:378-392` · `initialValue` is captured
**after** `if (!formFieldRef) return;`. With `[getValueHandler]`/`[setValueHandler]` and no projected
form field — the shipped `inline-edit-custom-handler` example — Escape calls `setValue(undefined)` and
destroys the value instead of restoring it.

**FRM-005** · `packages/components/toggle/toggle.component.ts:122` · `@Input() disabled` has no
`transform: booleanAttribute`, unlike checkbox, radio, button-toggle and button (verified side by side).
`<kbq-toggle disabled>` yields `''`, which is falsy everywhere, so the toggle renders enabled and toggles
on click. Same class of bug at `file-picker.ts:26` for `<kbq-file-upload disabled>` (FRM-013).

**FRM-006** · `packages/components/file-upload/primitives/file-picker.ts:141-157` · `remove()` returns the
items it **kept**, not the one it removed — `isRemoved = currentItem !== item` is the *keep* predicate and
the array it fills is named `removed`. `remove(file2)` on `[f1,f2,f3]` returns `[f1,f3]`. The behaviour is
frozen by `file-picker.spec.ts:467`. The JSDoc also promises an event that is never emitted.

**CORE-A-001 / CORE-A-002** · `packages/angular-moment-adapter/adapter/moment-date-adapter.ts:85-87` ·
`startOf` truncates in the **source** zone and only then relabels, while the luxon twin converts first and
carries an explicit comment saying why (`date-adapter.ts:102-108`) — verified side by side. With
`KBQ_DATE_TIMEZONE='Asia/Kolkata'` and a UTC input at 22:00, moment returns the *previous* calendar day.
Because `super.startOf` is moment's in-place `date.startOf(unit)`, it also **mutates the caller's
`Moment`** before `applyTimezone` clones — the class's own comment at `:172` documents that hazard, and
`deserialize` has a "should not mutate" test while `startOf` has none.

**CORE-A-003** · `packages/components/core/formatters/number/formatter.ts:135-139` · with
`useDefineForClassFields: false`, `ParsedDigitsInfo`'s unassigned fields are not own properties, so
`result.maximumFractionDigits` is `undefined`, `4 > undefined` is false, and the clamp never fires. The
spread at `:190-193` then leaves the default `maximumFractionDigits: 3` beside `minimumFractionDigits: 4`
→ `Intl.NumberFormat` throws `RangeError`, rethrown as `InvalidPipeArgument`, aborting the whole view.
`{{ 1.23456 | kbqNumber: '1.4' }}` is a form the documented grammar allows; Angular's own `DecimalPipe`
returns `1,2346`.

**CORE-A-004** · `packages/components/core/locales/formatters.ts:168` · tk-TM's rounding
`groupSeparator` is `''`, and `formatter.ts:356-360` concatenates a stringified zero fraction with it, so
`10000` renders as **`100 M`** — every tk-TM value ≥ 1000 is off by a factor of ten.

**CORE-A-005** · `packages/components/core/forms/validators.ts:196` ·
`new RegExp(\`${acceptedExtensionOrMimeType}$\`)` — verified. `accept: ['image/*']` compiles to
"`image` followed by zero or more slashes, at end", which matches neither the file name nor the MIME type,
so **every wildcard MIME accept rejects 100% of files**; `.txt` treats `.` as the wildcard and accepts a
file named `mytxt`.

**DT-01** · `packages/components/datepicker/datepicker-input.directive.ts:1091` · `getDefaultValue()`
seeds `month` from the 0-based `adapter.getMonth()`, while `createDateTime` (`:1537`) subtracts 1 again —
verified. In year-first locales (`en-US`, `zh-CN`, `fa-IR`) typing a bare year yields the wrong month, and
in January it throws `Invalid month index "-1"` out of a `setTimeout`.

**DT-02** · `datepicker-input.directive.ts:1065-1073` · the day is clamped against the year currently in
the box, which the directive auto-filled from `today()`. Typing `29.02.2024` in `ru-RU` yields
**`28.02.2024`** with no error; pasting the same string works. Typing and pasting disagree.

**DT-03** · `packages/components/time-range/time-range-editor.ts:263` · `toDate: this.form.controls.toTime.value`
— the `toDate` control is never read (verified). The emitted `endDateTime` takes its date part from the
timepicker's stale date, so the range the consumer receives is not the range the UI shows, while
`rangeValidator` (which reads the real `toDate`) keeps Apply enabled.

**DT-04** · `packages/components/time-range/constants.ts:50` · the range validator uses day-granular
`compareDate` where the editor renders `HH:mm:ss`. Same day, from `18:00`, to `09:00` validates clean —
any inverted range under 24 h is accepted.

### Documentation (P1)

**DOC-03** · `packages/components/button/button.en.md:28` · the page documents three button colors —
`theme`, `secondary`, `error`. Verified against `button.component.ts:71`: `KbqButtonColor` is
`Theme | ThemeFade | Contrast | ContrastFade`. `secondary` is not in `KbqComponentColors` at all, and
`error` is excluded from `KbqButtonColor` — **two of the three documented values fail type-check**, and
the two real ones are undocumented.

**DOC-04** · `packages/components/button/button.en.md` · the English page is a stale document the Russian
one has superseded. Verified: EN references **1** example, RU references **8**
(`button-fill-and-style`, `…-only-icon`, `button-content`, `button-hug-content`, `button-fixed-content`,
`button-fill-content`, `button-loading-state` — all present in `example-module.ts`). The fill/style axis,
the button's primary visual API, has no English page at all; `button.en.md:33` still directs readers to
`class="kbq-progress"` for loading, and `:16` embeds a screenshot of a superseded design. `git log` shows
the file last touched only by a Prettier chore.

**DOC-05** · `progress-bar.en.md:46-61`, `progress-spinner.en.md:46-61` · three errors in one block: the
documented default `primary` is wrong (both constructors set `KbqComponentColors.Theme`); the documented
values emit `kbq-primary`/`kbq-secondary`/`kbq-error`, and `_progress-bar-theme.scss:4` defines exactly one
color rule (`.kbq-theme`) while `_progress-spinner-theme.scss` defines only `.kbq-contrast`/
`.kbq-contrast-fade` — so every copy-paste sample produces a component that has *lost* its theming; and
`ThemePalette` is the legacy enum. The RU files omit the block entirely and are correct by omission.

**DOC-06** · `docs/guides/versioning.en.md` · the RU guide publishes release frequency and a 12-month
support policy (Active 6 months / LTS 6 months, as a table) at `:48` and `:56`. English readers get
neither — there is no support-lifecycle information on the EN site. The EN MAJOR list also repeats one
bullet verbatim as items 1 and 3.

### Accessibility (P1)

| ID | Location | Defect |
|---|---|---|
| A11Y-ICONBTN-001 | `icon/icon-button.component.ts:32-42` | `tabindex="0"` with no `role="button"` and no Enter/Space handler — a tab stop that does nothing when activated |
| A11Y-ICONBTN-002 | `toast:100`, `file-upload:36,62`, `search-expandable:33` | icon-only buttons with no accessible name; `button.component.ts:288-309` warns in dev mode for exactly this |
| A11Y-BTNGROUP-001 | `button/button-group.ts:154-157` | `aria-orientation` on `role="group"` — axe `aria-allowed-attr`; already fixed in `button-toggle`, not here |
| A11Y-TOAST-001 | `toast/toast-container.component.ts:27-29` | no `aria-live`, no `role="status"` — verified zero `role` bindings; toasts are never announced |
| A11Y-TOOLTIP-001 | `tooltip/tooltip.component.ts:158-163` | no `role="tooltip"`, no `aria-describedby` — verified zero `role` bindings; every tooltip is invisible to AT, including those that are the only label on icon-only controls |
| A11Y-PROGRESS-001 / SWP-06 | `progress-bar:32`, `progress-spinner:38` | no `role="progressbar"`, no `aria-value*` — verified zero `role` bindings |
| A11Y-TAGS-001 | `tags/tag-list.component.ts:81`, `tag.component.ts:219,753` | no listbox/option roles; the remove affordance has no role, no name, `tabindex="-1"` |
| A11Y-SPLITTER-001 | `splitter/splitter.component.ts:63-69` | the gutter is `(mousedown)` only — no `role="separator"`, no `tabindex`, no keydown. `dl.component.ts:66-83` does the identical job correctly |
| A11Y-CLAMPED-001 | `clamped-text/clamped-text.ts:53` | `role="button"` on a span the trigger never gives a `tabindex`, so its Enter/Space handlers can never fire |
| A11Y-CLAMPED-002 | `clamped-text.ts:73`, `clamped-list.ts:11` | `aria-expanded` on a role-less (`generic`) host |
| A11Y-TOGGLE-001 | `toggle/toggle.component.html:4-7` | `aria-checked="mixed"` on `role="switch"` — forbidden by ARIA 1.2; NVDA falls back to "not checked" |
| A11Y-FORMFIELD-001 | `form-field/form-field.html:2` | `<label for>` cannot associate with `kbq-select`/`kbq-tag-list` custom elements, and no `aria-labelledby` is written — every such field has a visible label that names nothing |
| A11Y-CHECKBOX-001 | `checkbox/checkbox.ts:60` | the JSDoc tells consumers to supply `[aria-label]`; no such input exists and nothing forwards it to the inner `<input>`. Same absence in `radio` |
| A11Y-BREADCRUMBS-001 | `breadcrumbs/breadcrumbs.ts:176` | `'[attr.aria-label]': "'breadcrumb'"` — the only hardcoded component-provided ARIA string in the library; the component already injects the a11y locale at `:183` |
| A11Y-DATEPICKER-002 | `datepicker/datepicker-toggle.component.ts:48-55` | the toggle has `aria-expanded`/`aria-disabled` on a role-less host, no `tabindex`, no keydown and no name |

### Test suite (P1)

| ID | Location | Defect |
|---|---|---|
| TST-04 | `core/forms/forms.spec.ts:80` | the file's only suite is `xdescribe`d — `KbqFormsModule` has no live assertion anywhere |
| TST-05 | `tabs/tab-group.spec.ts:39` | "should default to the first tab" asserts index **1**, which the host set explicitly |
| TST-06 | 7 files, **21 sites** (verified by grep) | `expect(spy).not.toHaveBeenCalled()` immediately after `jest.spyOn` — a tautology |
| TST-07 | `actions-panel/e2e.playwright-spec.ts:30` | un-awaited `.click()` before `toHaveScreenshot`; the baseline encodes the race |
| TST-08 | `progress-bar:83`, `progress-spinner:115` | `expect(getAttribute('id')).toBeDefined()` accepts `null` |
| TST-09 | `loader-overlay/…spec.ts:44,59` | `toBeDefined()` on a `query()` result, in the test whose whole point is presence |
| TST-10 | `tree-select/…spec.ts:3198,3305` | search input and empty-message assertions cannot fail |
| TST-11 | `toast/toast.spec.ts` | the hover/focus pause of auto-dismiss (`toast.service.ts:52`) is entirely untested |
| TST-12 | `notification-center/…spec.ts` | `popoverMode`, `popoverHeight`, `disabled`, `placement`, `unreadItemsCounter` — the whole trigger input surface — untested |
| TST-13 | `sidepanel/sidepanel.spec.ts` | `trapFocus`, `size`, `beforeClosed()`, `sidepanelResult` untested (0 grep hits each) |

### Branch (P1)

**BR-01** · `datepicker-input.directive.ts:1085-1097` · the commit `fix(datepicker): min/max validation for
keyboard input` ships no library fix for the defect it names. `getDefaultValue()` still seeds a typed
date's time from `adapter.today()` and `compareDateTime` still compares to the millisecond, so `[max]`
bound to a midnight date still rejects its own last day. What actually shipped is two smaller, genuine
fixes — a crash guard for form-control-less inputs and correct handling of invalid `min`/`max` — plus
documentation of the trap. **Fix:** relabel the commit, or normalize the bound in the `max` setter.

**BR-08** · `packages/schematics/src/{collection,migrations}.json` · 9 of the 10 `origin/review/*` branches
conflict with `origin/main` **and with each other** on the same two files, each appending to the same JSON
region. Seven also touch `core.api.md` and `baseline.json`. They must land serially with manual
resolution; `review/search-expandable` is the only clean, migration-free one and is the natural first merge.

**BR-09** · `origin/review/title` · its base commit is superseded by `a31749c30`, already on `main` (same
subject, different patch-id, 29 lines of divergence). `review/tooltip` inherits the conflict because it
also carries `title.directive.ts`.

---

## P2 — should fix

<details>
<summary>Configuration, CI and tooling (18)</summary>

| ID | Location | Defect | Fix |
|---|---|---|---|
| CFG-002 | `.lintstagedrc.js:2-4` | `*`, `*.{css,scss}` and `*.{js,ts,html}` all **write** the same staged file concurrently — lint-staged's own README anti-example | split the globs so each file is claimed once |
| CFG-003 | `playwright.config.ts:99-103` | `reducedMotion: 'reduce'` on every screenshot, so all 234 baselines capture the `animation: none` branch of 8 stylesheets (verified) — a broken default animation is invisible | drop it; keep `animations: 'disabled'`; add a dedicated reduced-motion project |
| CFG-004 | `tools/builders/packager/build.ts:143-156` | cwd-relative paths, mutates the **tracked** `core/version.ts` in place without restoring, ignores `options.versionPlaceholder`, non-idempotent | resolve from `context.workspaceRoot`; restore in a `finally` |
| CI-04 | `build.yml:3-4` | `on: pull_request` only — the sole workflow that builds all packages + docs cannot report a broken `main` | add `push: branches: [main]` |
| CI-05 | root `package.json` (no `workspaces`) | `@koobiq/cli` ships 10 runtime deps that neither audit workflow can see; `dotenv` is built/tested at `^16.6.1` and published as `^17.4.2` (verified) | add the workspace or a second audit invocation; reconcile the ranges |
| CI-06 | `publish.yml:31,95` | tag grammar is validated only in the **downstream** release job, after npm already has the packages; nothing asserts `tag === package.json.version` | move the regex into the publish job's first step |
| CI-07 | `publish.yml:35`; `npm-client.ts:37` | `id-token: write` granted "for provenance" while `--provenance` is never passed — every `@koobiq/*` release is unattested | add the flag or drop the scope |
| CI-08 | `e2e-approve-snapshots.yml:51-59` | a `GITHUB_TOKEN` push does not re-trigger `e2e.yml`, so "✅ Snapshots updated" sits next to a stale check | push with a PAT/App token, or re-dispatch |
| CI-09 | `e2e-approve-snapshots.yml:28`, `redeploy-preview.yml:31` | `persist-credentials` leaves a write token in `.git/config` while PR-controlled code runs on the runner | `persist-credentials: false` |
| CI-10 | `package.json:154-166` | 11 undocumented `resolutions` holding security state, outside Dependabot and outside the repo's own stated pinning discipline (`.yarnrc.yml` justifies all three of its ignores) | comment each with advisory id and removal condition |
| API-005 | `migrations/css-selectors/index.ts:26,31` | `\b…\b` treats `-` as a boundary, so `\bkbq-body\b` rewrites inside `kbq-body-large`; the pattern is also interpolated unescaped, and the rule runs over `.ts` files | `(?<![\w-])…(?![\w-])` with escaping |
| API-006 | `packages/components/package.json:41`; `ng-add/index.ts:68-70` | `overlayscrollbars` is still a mandatory peer, but since the scrollbar rework nothing outside `scrollbar/deprecated/` imports it | mark optional; narrow the migration |
| API-012 | `npm-dist-tag-prompt.ts:35-44` | the documented pre-release guard has identical branches and the function is never called | see API-010 |
| API-013 | `packages/cli/src/cli.ts:26-42` | `repoUrl` has no CLI flag and no env fallback, so `git ls-remote undefined` fails silently and the remote-tag-collision guard never fires | add `--repo-url` with a default |
| API-014 / CI-14 | `npm/npm-client.ts:43-46` | `npmPublish` is the only function omitting `env: npmClientEnvironment` — the very workaround its file header exists for | add it |
| API-015 | `release-output/check-packages.ts:8` | the glob `+(esm5\|esm2015\|bundles)/*.js` matches nothing under ng-packagr 20, so the bundle validator has never run and reports success | `fesm2022/*.mjs`, and fail on zero matches |
| API-016 | `version-name/publish-branches.ts:10` | major releases are allowed only from `master`; this repo's default branch is `main` — staging a major is blocked | `return ['main']` |
| API-017 | `package.json:201` | stray `p` in `--project p packages/cli/tsconfig.lib.json` — `release:publish:dist` cannot run | delete the token |

</details>

<details>
<summary>Documentation and content pipeline (7)</summary>

| ID | Location | Defect | Fix |
|---|---|---|---|
| DOC-07 | `file-upload`, `toast`, `tree-select` EN docs | four sections that exist in RU are missing from EN, though all four example keys are in `example-module.ts`; `examples.file-upload.en.md:24` also uses an H2 where every sibling uses H3 | port the four sections |
| DOC-08 | `tools/generate-{sitemap,prerender-routes,llms-txt}.ts` | all three `catch` with `console.info` and no exit code, so a failed generation is a **green** step and the previous release's stale artifact ships. `prune-is-new-badges/index.ts:32-35` and `api-gen` do it correctly | `console.error` + `process.exitCode = 1` |
| DOC-09 | `.nvmrc` vs `package.json:18` | *(same as LEAD-3)* — and note `setup-node/action.yml:9` uses `node-version-file: .nvmrc`, so **CI runs on the below-floor version too** | bump `.nvmrc`, or lower `engines` |
| DOC-10 | `README.md:21` | the front-page table names the moment adapter `@angular/angular-moment-adapter`; it is published as `@koobiq/angular-moment-adapter` | fix the displayed name |
| DOC-11 | `packages/components/tags/tag.ru.md` | the "Remove Button" section exists only in EN — and the EN one is broken (DOC-02); resolve the two together | decide, then mirror |
| DOC-12 | `apps/docs/src/app/structure.ts` (Alert) | `alert-dynamic` is a real, documented example that no route can reach because `Alert` carries `hasExamples: false`. Checked all 64 `examples.*.md`: the other 33 unreachable ones are deliberate placeholders — Alert is the only false negative | `hasExamples: true` |
| DOC-13 | `docs-examples/components/icon/icon-button-custom size/` | a **space** in a directory name that is interpolated raw into the source-fetch URL and the StackBlitz writer; the example is live. `tree-select-with-multiline-matcher-overview/` likewise diverges from its key. Only 2 divergences across 580 directories | rename and regenerate `example-module.ts` |

</details>

<details>
<summary>core, selection, overlays, forms, filter-bar, date/time (76)</summary>

| ID | Location | Defect |
|---|---|---|
| CORE-A-006 | `formatters/date/formatter.pipe.ts:141` | relative-date pipes cache without `today()` in the key — a label frozen at "сегодня" stays wrong after midnight |
| CORE-A-007 | `formatters/number/formatter.ts:94` | `supportedLanguages` hard-codes 4 ids, so tk-TM and every consumer-registered locale skip the rounding interval table |
| CORE-A-008 | `angular-luxon-adapter/adapter/date-adapter.ts:72` | the Angular locale-data fallback is unreachable (`localeData` always has 7 keys), so an unknown `LOCALE_ID` throws during adapter construction |
| CORE-A-009 | `moment-date-adapter.ts:66` | `localeChanges` is `Subject<void>` where luxon and the core abstract class declare `BehaviorSubject<string>` |
| CORE-A-010 | `core/forms/validators.ts:193` | `isCorrectExtension` throws on a bare `File`, which `maxFileSize` in the same class accepts |
| CORE-A-011 | `core/forms/validators.ts:80` | the `minLowercase()` JSDoc example does not compile and documents a default that does not exist |
| CORE-A-012 | `formatters/number/formatter.ts:200,269,319,353` | impure pipes rebuild `Intl.NumberFormat` per binding per tick; the date pipes next door already solve this with a cache |
| CORE-A-013 | `core/forms/forms.directive.ts:47` | `elements()` is a signal query read once in `ngAfterContentInit`; rows added later never recompute their margins |
| CORE-B-03 | `core/pop-up/pop-up-trigger.ts:387` | `visibleChange` is subscribed with the **trigger's** `destroyRef` while `instance` is recreated per open, and `KbqPopUp.ngOnDestroy` never completes that emitter (verified) — one dead pop-up retained per open |
| CORE-B-04 | `core/pop-up/pop-up-trigger.ts:298,447` | a disposed `OverlayRef` is retained and returned by `createOverlay()`; `show()` has no destroyed guard |
| CORE-B-05 / OVL-11 | `core/pop-up/pop-up-trigger.ts:543,641,668` | listeners are removed from `getNativeElement()`, which `setExternalNativeElement` may have changed — the original host keeps them forever |
| CORE-B-06 | `core/overlay/auto-hide-scroll-strategy.ts:85,145` | an empty `ancestorScrollContainers` makes `.some()` false, so the strategy degrades to "never hide" and the viewport fallback is unreachable |
| CORE-B-07 | `core/select/common.ts:117-127` | a `Promise.resolve()` subscription can be created after `ngOnDestroy` already unsubscribed the placeholder |
| CORE-B-08 | `core/services/theme.service.ts:274` | unguarded `matchMedia` in a `providedIn: 'root'` service breaks SSR/prerender; every spec stubs it *(needs-verification)* |
| SEL-03 | `select.component.ts:2070` | the virtual-scroll lookup still calls `this.compareWith` raw — the third call site missed by `1895e72c9`; a throwing comparator now loses the whole selection |
| SEL-04 | `select.component.ts:1801` | `scrolledToBottom` has no sub-pixel tolerance; `notification-center.ts:303` already carries `SCROLLED_TO_BOTTOM_TOLERANCE = 2` with a written explanation |
| SEL-05 | `tree-select.component.ts:1288,1294` | tag removal uses `===` instead of `treeControl.compareValues`, so with object values it emits a removal event that removed nothing |
| SEL-06 | `autocomplete-trigger.directive.ts:283` | leaked `keyManager.change` subscription; every sibling pipes `takeUntilDestroyed` |
| SEL-07 | `tree/toggle.ts:56` | one permanent `filterValue` subscriber per rendered node, on a consumer-owned `BehaviorSubject` |
| SEL-08 | `tags/tag-list.component.ts:571` | `registerInput` subscribes the consumer's `statusChanges` with no teardown and no de-registration |
| SEL-09 | `core/option/option.ts:353` | shift-clicking an autocomplete option throws — `KbqAutocomplete` provides `KBQ_OPTION_PARENT_COMPONENT` without implementing `setSelectedOptionsByClick` |
| SEL-10 | `list-selection.component.ts:1041` | a drop into an `id`-connected list reports `currentIndex = previousIndex`, i.e. the **source** index |
| SEL-11 | `select.component.ts:2202` | the default sort comparator is `a.value - b.value` (NaN for strings/objects → insertion order) while tree-select uses panel order |
| SEL-12 | `select:1112`, `tree-select:869` | `multiline` feeds `multiSelection` but, unlike `multiple`, is unguarded and never rebuilds the model |
| SEL-13 | `tree-select.component.ts:869` | the select silently replaces the tree's `SelectionModel` with one of the opposite multiplicity instead of throwing |
| SEL-14 | `list-selection.component.ts:826` | drag reordering has no keyboard equivalent — WCAG 2.1.1, acknowledged in `list.en.md:196` |
| SEL-15 | `tree-select.component.ts:886` | a manual `tree.ngAfterContentInit()` plus Angular's own call creates a second key manager; the select subscribed to the first *(needs-verification)* |
| OVL-04 | `notification-center.ts:534` | leaked nested closing-actions subscription → `null.setStickPosition()` on every scroll after the trigger is destroyed |
| OVL-05 | `dropdown-trigger.directive.ts:200,336` | one `closeSubscription` field holds two different lifetimes; the panel-close subscription is orphaned after the first open |
| OVL-06 | `_dropdown-theme.scss:31` | the submenu safe-area rule is nested without `&`, compiling to "panel inside an item" — the feature added in `ef6d0515b` is visually inert |
| OVL-07 | `core/pop-up/pop-up-trigger.ts:574` | `focus()` is a bare native call, so Escape from a popover restores focus without the keyboard ring (WCAG 2.4.7); `KbqDropdownTrigger` uses `focusVia` correctly |
| OVL-08 | `modal.component.ts:384` | modal auto-focus is a bare `focus()` on the first `<button>` in DOM order — the header ✕ |
| OVL-09 | `notification-center.ts:241` | `switcher().focus()` instead of the available `focusViaKeyboard()` |
| OVL-10 | `popover.component.ts:115` | `focusFirstTabbableElement()` runs regardless of `isTrapFocus`; a focus-triggered popover closes itself, a hover-triggered one steals focus *(needs-verification)* |
| OVL-12 | `sidepanel.service.ts:171` | `[...sidepanels.reverse()]` mutates the live stacking array before copying |
| OVL-13 | `sidepanel-ref.ts:128` | the already-closed guard tests `Subject.closed`, which `complete()` never sets |
| OVL-14 | `modal.component.ts:399` | `focusMonitor.monitor` is stopped only by a `take(1)` that may never fire; no `stopMonitoring` on destroy |
| OVL-15 | `modal-control.service.ts:108` | an untracked `beforeClose` subscription in a root service, closing over possibly destroyed modals |
| OVL-16 | `toast.service.ts:195` | `toTop()` re-inserts the overlay host on every show, blurring focus inside the toast and resuming its TTL *(needs-verification)* |
| OVL-17 | `toast-container.component.ts:56` | reflow is reported on the **global** `ScrollDispatcher`, so a toast appearing still closes every tooltip using a close-scroll strategy *(needs-verification)* |
| OVL-18 | `core/pop-up/pop-up-trigger.ts:403` | `stickToWindow` is re-applied on resize only, not after the reposition strategy rewrites the pane on scroll *(needs-verification)* |
| FRM-007 | `textarea.component.ts:235-237` | subscribes the tab group's `animationDone` with no teardown and re-invokes `ngOnInit()` on a destroyed directive |
| FRM-008 | `checkbox.ts:342-346` | `onTouched` fires on **focus**, so a `requiredTrue` checkbox shows its error the moment the user tabs in; radio does it correctly |
| FRM-009 | `toggle.component.ts:210-212` | `focusMonitor.monitor(...)` is called without subscribing — the control is never marked touched on blur |
| FRM-010 | `button-toggle.component.ts:124,240` | `writeValue` emits `valueChange`, N+1 times per programmatic `setValue` |
| FRM-011 | `button-toggle.component.ts:223` | `SelectionModel` multiplicity is frozen at `ngOnInit` while `currentValue`, `role` and `ariaOrientation` keep re-reading `multiple()` |
| FRM-012 | `button-toggle.component.ts:494` | a plain `@Input value` is read inside the group's `computed`, so it is not a reactive dependency |
| FRM-014 | `checkbox.ts:75` | `'[attr.disabled]': 'disabled'` renders `disabled="false"`; every other control in the library guards with `\|\| null` |
| FRM-015 | `inline-edit.ts:495-505` | the fallback-timeout path leaves a capture-phase `scrollend` listener on `window` that later clears a different request's handle |
| FRM-016 | `inline-edit.ts:542-543` | `markAllAsTouched()` runs on **every** keydown, so errors appear on the first character typed |
| FRM-017 | `file-drop.ts:26-44` | `accept` is enforced only on the hidden `<input>`; dropped files bypass it silently |
| FRM-018 | `cleaner.ts:127` | the cleaner renders and swallows the click but clears nothing when the control has no `NgControl` *(needs-verification)* |
| FB-02 | `filters.ts:91,135` | `viewChild<KbqDropdownTrigger>('filterActionsButton')` resolves to `KbqButton`, so the dropdown half of `filterActionsOpened` is dead |
| FB-03 | `filter-bar.ts:126`, `filter-reset.ts:34` | `onResetFilter` is a `BehaviorSubject` latched at `true`; later `openOnReset` pipes self-open on creation |
| FB-04 | `filter-bar.ts:133`, `pipe-add.ts:100` | `openPipe` latches the last id; a recreated pipe with the same id opens by itself |
| FB-05 | `filters.ts:195-211` | `saveChanges()` clears `changed` before the host confirms and `filterSavedUnsuccessfully()` restores nothing — a failed save silently looks successful |
| FB-06 | `filter-save-popover.ts:256-275` | `filterSavedUnsuccessfully()` with the popover closed reads an empty `viewChild.required` → NG0951 from a timer, and its error alert lives only inside the closed popover |
| FB-07 | `filter-save-popover.ts:299-304` | `subscribe(this.close)` passes the emitted `false` as `restoreFocus`, so Escape/backdrop close drops focus on `<body>` (WCAG 2.4.3) |
| FB-08 | `filters.ts:74`, `filter-save-popover.ts:117` | a projected child injects the concrete `KbqFilterBar` although `KBQ_FILTER_BAR_HOST` exists and every sibling uses it — AGENTS.md violation, plus a module cycle |
| FB-09 | `filter-save-popover.ts:279-306` | reopening during the exit animation double-subscribes and silently fails to reopen *(needs-verification)* |
| DT-06 | `datepicker-input.directive.ts:875` | the result of `String.replace` is discarded — paste separator normalisation never happens |
| DT-07 | `datepicker-input.directive.ts:733`, `timepicker.directive.ts:592` | neither directive has an `(input)` host listener, so Backspace, Delete, Ctrl+X, Ctrl+Z and drag-edits never re-parse until blur |
| DT-08 | `datepicker-input.directive.ts:1472`, `timepicker.directive.ts:1054` | the `control.valueChanges` subscription is never unsubscribed and writes the **raw** value into `_value`, bypassing `deserialize` |
| DT-09 | `timepicker.directive.ts:975-977` | both 12-hour edge cases produce hour 24, and luxon's `set()` rolls it into the next day — `12:30 pm` becomes the following day 00:30 |
| DT-10 | `timepicker.directive.ts:580-624` | no `readOnly` guard; arrow keys mutate a read-only timepicker. The datepicker guards at `:711` |
| DT-11 | `calendar-header.component.ts:233-239` | min/max in the same year take exclusive branches, so months past `maxDate` stay enabled and snap back after selection |
| DT-12 | `calendar-header.component.ts:73,92` | `if (!value) return;` means bounds can be raised but never cleared — header and grid desync |
| DT-13 | `calendar-header.component.ts:196-218` | an active year outside the hardcoded 1900–2099 window shows the wrong year and blocks navigation |
| DT-14 | `month-view.component.ts:211-212` | day-granular `shouldEnableDate` enables the `maxDate` day, whose selection then fails the millisecond-granular `maxValidator` |
| DT-15 | `timezone/timezone.utils.ts:91-93` | the sort comparator returns an **absolute offset**, not a difference — not antisymmetric; every UTC zone compares equal to everything |
| DT-16 | `timezone/timezone.utils.ts:106-110` | a `g`-flagged regex reused across `.filter()` drops every second match, and the unescaped pattern throws on `*`, `(`, `[` |
| SWP-02 | `code-block/code-block-highlight.ts:194-200` | per-instance plugin install adds a `document`-level `copy` listener and a `<style>` node per code block, never removed, and clobbers `window.hljs` |
| SWP-03 | `splitter/splitter.component.ts:608` | an area subscribes to the parent's `output()` with no teardown; removed areas keep emitting from detached nodes |
| SWP-04 | `table/table.component.ts:33` | `KbqTableCellContent`'s selector is `kbq-table td`, but the table is `table[kbq-table]` and no `<kbq-table>` element exists anywhere (verified) — the directive and its CSS have never run |
| SWP-05 | `progress-bar.component.ts:34` + `.html:3` | the same generated id is bound to both the host and the inner track (verified) — duplicate DOM id |
| SWP-07 | `scrollbar/deprecated/scrollbar.component.ts:61` | `mergeEvents()` allocates a new object per call in the template, and the receiving setter re-registers all listeners on identity change |
| SWP-08 | `markdown/markdown.values.ts:2-23` | bare tag prefixes with no boundary: `<a` matches `<abbr`, producing a styled anchor with a garbage attribute |
| SWP-09 | `empty-state.component.ts:89-93` | `errorColor` is read once in `ngAfterContentInit`; toggling it never re-tints the projected icon |
| SWP-10 | `dynamic-translation.ts:172-174` | slot replacement runs once in `afterNextRender`; changing `[slots]`/`[text]` leaves empty placeholder spans |
| LEAD-1 | `notification-center.service.ts:268` | `setIds` assigns `new Date().getTime().toString()` inside a `forEach`, so a bulk load gives **every** id-less item the same id; the toast-read handler then marks the wrong item read (`:150`) |
| LEAD-2 | `tsconfig.json` | `strictNullChecks` + `strictFunctionTypes` only — no `strict`, no `noImplicitAny`, no `strictPropertyInitialization`, while AGENTS.md requires "strict type checking". `moduleResolution: "Node"` is legacy |
| LEAD-3 | `.nvmrc` vs `package.json:18` | pinned Node `24.11.1` is **below** the declared `engines.node: ">=24.16"`; masked by `engine-strict=false` |
| LEAD-4 | `package.json:48` | `xlsx` is installed from `https://cdn.sheetjs.com/...` as a runtime dependency of a published library — invisible to `yarn npm audit` and Dependabot, and every consumer install depends on that CDN |
| SCSS-001 | `badge/_badge-theme.scss:18` | `border: transparent` is the **shorthand**, so filled badges lose `border-style`/`border-width` and render 2px narrower than outline badges |
| SCSS-002 | `code-block/code-block-tokens.scss:18-119` | 102 `--kbq-code-block-font-hljs-*` tokens have no consumer; `.hljs-title.class_` never gets its weight 500 |

</details>

## P3 — hygiene

<details>
<summary>87 findings</summary>

**Configuration** — CFG-005 unanchored `'dist'` in `modulePathIgnorePatterns` hides 4 real source files
from Jest's resolver (verified); CFG-006 no `testPathIgnorePatterns`, so a bare `npx jest` walks
`.claude/`, `tmp/`, `coverage/`; CFG-007 `transformIgnorePatterns` drops the preset's
`@angular/common/locales` allowance; CFG-008 dead `@koobiq/cli` path alias pointing at a non-existent
`packages/cli/index.ts` (verified), which also plants a broken Jest `moduleNameMapper`; CFG-009 the SSR
lint rule is not applied to the published `components-experimental`; CFG-010 bare
`// eslint-disable-next-line no-restricted-globals` is allowed (6 files use it) because
`eslint-comments/require-description` is off, and a local `const window = inject(KBQ_WINDOW)` defeats the
rule by shadowing; CFG-011 the `@koobiq/builders:typescript` builder is unused, has an unreachable error
branch and an unquoted, non-portable `tsc` invocation; CFG-012 "Packaging done!" is printed after a failed
ng-packagr run; CFG-013 no `files` allow-list and no `.npmignore` — the clean package contents rest
entirely on the `**/*.scss`-only asset globs; CFG-014 `CSS.supports` stubbed to `false` and a no-op
`ResizeObserver` make production branches unreachable in tests; CFG-015 `core/testing` is public runtime
API of `@koobiq/components/core` (CDK keeps the equivalent in a separate entry point); CFG-016 cspell
covers `**/*.md` only; CFG-017 Angular build cache disabled workspace-wide and **zero** `budgets` anywhere,
including the deployed docs bundle.

**CI** — CI-11 `npmAuditExcludePackages` is referenced by two workflows and printed into every weekly issue
but does not exist in `.yarnrc.yml`; CI-12 slash-command gates use `contains`, and `e2e.yml:75` embeds the
literal trigger, so a quote-reply fires a repo-write push; CI-13 no `concurrency` on any PR workflow —
superseded 60-minute e2e runs continue and preview deploys race the same channel; CI-14 `docs-stable.yml`
hardcodes the major in its tag filter, `docs-next.yml` is the only `read-all` workflow, `pr-notify.yml`'s
second step lacks the first's guard, and five workflows have no `timeout-minutes`.

**API and schematics** — API-004 the `any` ratchet scans one hardcoded directory (currently 547 = 547,
exact); API-007 `deprecated-icons/schema.json` duplicates `new-icons-pack`'s `$id`; API-018
`extract-release-notes` matches the version as a substring, so `20.3.0` can pick up a `20.3.0-rc.1`
section; API-019 two CI publish tasks skip `checkReleaseConfiguration()`; API-020
`concat(undefined)` prints a bare `undefined` under package-level failures.

**core** — CORE-A-014 `KBQ_DATE_LOCALE` optionality diverges between adapters and the `!` masks a null;
CORE-A-015 the luxon options token carries the moment token's name and JSDoc, so DI errors misreport the
package; CORE-A-016 `Intl.NumberFormat.call(this, …)`; CORE-A-017 `getFormattedSizeParts` JSDoc is wrong on
both argument and result; CORE-A-018 25 specs use the `useClass: KbqLocaleService` form the guide and a
regression test both call broken; CORE-A-019 `createDate` diverges between adapters on a midnight DST
transition *(needs-verification)*; CORE-B-09 `setActiveInWrapMode` assumes `|delta| === 1`, so page
navigation under `withWrap()` lands arbitrarily; CORE-B-10 `KBQ_WINDOW`'s "not available" error is
unreachable because evaluating the bare `window` fallback throws first (verified); CORE-B-11 `isMac()`
reads a raw `navigator` behind a lint disable; CORE-B-12 `KbqColorDirective`'s constructor runs its own
`@Input` setter before subclasses set `defaultColor`, which six components work around by assigning both;
CORE-B-13 `optional: true` paired with `!` then used unguarded, turning a prepared error message into an
opaque `TypeError`; CORE-B-14 nine `Renderer2.setStyle` calls take `overlayRef?.overlayElement`, which
throws on null in Angular 20; CORE-B-15 the scrollbar-width cache tests falsiness, so a real `0` re-measures
forever (forced reflow on macOS and on the server); CORE-B-16 `ListKeyManager` has no `destroy()` and
`activeItem` can return `undefined` despite its `T | null` type.

**Components** — SEL-16 autocomplete drops Home/End/PageUp/PageDown; SEL-17 tree-select restores scroll on
the wrong element; OVL-19 `KbqModalTitle`/`Body`/`Footer` and `KbqDropdownTrigger` inject host classes
instead of the existing narrow tokens (AGENTS.md); OVL-20 dead migration leftovers — an empty
`viewChildren('autoFocusedButton')` and a `notification-center` `isTrapFocus` bound nowhere; FB-10
`onChangeFilter` is public API that can never emit, and two JSDocs point consumers at it; FB-13 `kbqPipe`
input changes are ignored after first render; FB-14 hardcoded `Ctrl + ` / `⌘` outside the locale config;
FB-15 unguarded `this.values.filter` in two pipes *(needs-verification)*; FRM-019 `startWith()` with no
arguments is a no-op, so the initial password-strength pass never runs; FRM-020 a `:has()` rule outranks
the prefix inset reset, double-indenting a multi-select trigger that has a prefix; FRM-021
`selectionStart = null` throws for `type="number"` *(needs-verification)*; FRM-022 the local drop zone
highlights while disabled; DT-17 two-digit year `00` becomes 2001; DT-18 typing the locale separator is
rejected as incorrect input; DT-19 the default calendar minimum is **February** 1900, so January 1900 is
unreachable; DT-20 arrow-key edits are clamped by `minDate`/`maxDate`, contradicting the split this branch
documents; DT-21 the timepicker's copy of the datepicker mask engine has lost the `readOnly` guard and the
paste-letter handling; SWP-11 slot names interpolated into a regex unescaped; SWP-12
`renderer.addClass` on a nullable `parentElement`; SWP-13 five components missing `OnPush`
(`accordion-content`, `accordion-trigger`, `kbq-dt`, `kbq-dd`, `navbar-brand` — verified); SWP-14
`delay(0)` subscription without `takeUntilDestroyed`; SWP-15 `setTimeout` without `clearTimeout` in
`ellipsis-center` and `clamped-text`; SWP-16 `destroyRef.onDestroy` registered inside a re-running callback,
accumulating stale closures; SWP-17 a CSS `<time>` token parsed as a bare millisecond number, so
`1.2s` silently breaks the skeleton wave and an unset value writes `NaNms`; SWP-18 `detectChanges()` inside
a component's own effect; SWP-19 the actions-panel close-fallback timer is not cleared on overlay
detachment; SWP-20 the global `[`/`]` sidebar shortcut fires inside `contenteditable`.

**SCSS** — SCSS-003 a dead `--kbq-autocomplete-size-panel-padding` that also misdescribes the shipped
value; SCSS-004 two genuinely undefined checkbox padding tokens with no fallback (IACVT → 0); SCSS-005 an
undefined `--kbq-tree-size-toggle-padding` with a `FIXME` in place, collapsing the toggle's hit area;
SCSS-006 a width-less `border-style: solid` on the radio inner circle, patched by a redundant
override-blocking `!important`; SCSS-007 `kbq-palette` is defined twice in `_theming.scss`, and the second
silently shadows the first, making `kbq-contrast` unreachable; SCSS-008 nine `@deprecated … unused` markers
on functions both public theme constructors call; SCSS-009 three tokens missing upstream, tracked only in
code comments; SCSS-010 86 tokens whose literal value is `null`, forcing `color: inherit` over a consumer's
highlight.js theme; SCSS-011 six publicly forwarded mixins with no caller; SCSS-012 a redundant
`ng-package.json` asset glob with no ignore list.

**Documentation** — DOC-14 heading levels differ between locales at identical positions
(`accordion:57`, `breadcrumbs:84`, `tooltip:81`, `icon-button`, `popover`, `date-formatter.ru.md:182`), and
`anchors.component.ts:229` derives the anchor nesting from the heading class, so the in-page tree differs
per locale; DOC-15 `examples.validation.ru.md` renders three sections as bold text where EN uses `###`,
producing no anchors; DOC-16 `tools/region-parser/` is dead code — zero references outside itself and zero
`docregion` markers in all 580 examples; DOC-17 both `examples.search-expandable.{en,ru}.md` are **0 bytes**
and are fed to the content task; DOC-18 six examples are built and referenced from no `.md`, including the
canonical `inline-edit-overview` and `link-overview`; DOC-19 742 files under `docs-examples` contain
Cyrillic literals, so English example pages display Russian copy — systemic, flagged once.

**Accessibility** — A11Y-TABS-002 tab-pagination arrows are unreachable by keyboard; A11Y-RADIO-001
`role="radiogroup"` with no accessible name; A11Y-BREADCRUMBS-002 the element-form selector puts
`aria-label` on a `generic` *(needs-verification)*.

**Tests** — TST-14 27 permanently disabled tests across 11 files, 9 in `tag-list.component.spec.ts`, none
with a linked issue; TST-15 `sidebar.spec.ts` has an `xit` with the assertion commented out, an unasserted
`jest.fn()` and a dead `showContainer` flag; TST-16 25 Playwright specs assert nothing but a screenshot
pair; TST-17 `dispatchMouseEvent(el, 'touchstart')` where a `dispatchTouchEvent` helper exists two lines
away; TST-18 `describe(KbqUsernamePipe.name)` wraps `KbqUsernameCustomPipe`; TST-19 `actions-panel`
baselines are unpadded (`1-light.png`) and one state has no dark pair.

**Lead's sweep** — `tools/api-extractor/config.json` lists `button-toggle` twice (65 entries, 64 unique —
verified; coverage is otherwise complete); `tsconfig.json:93` maps `@koobiq/components/vertical-navbar` to
a directory that does not exist, and nothing imports it; `stripInternal: false` means the single
`@internal` member in the library (`core/overlay/shadow-dom-overlay-container.ts:54`) is part of the
guarded public surface (`core.api.md:4163`) — the annotation has no effect in this repo; `.firebaserc`
declares a `v16` hosting target absent from `firebase.json`; `.opencode/` is missing from both `.gitignore`
and the ESLint ignores, unlike `.ai` and `.claude`; `jest.config.js:23` sets a global
`testTimeout: 2000`, tight for Angular component tests; the checkout carries 9 stale root `.log` files
including one named `C:UsersAdminAppDataLocalTempcheck-api.log` (all gitignored, none tracked — verified).

</details>

---

## Checked and found clean

Recorded so these are not re-investigated:

- **Automated gates.** `yarn run eslint`, `stylelint`, `prettier` and `cspell` all pass on this tree —
  every finding above is beyond what tooling can catch.
- **AGENTS.md hard prohibitions.** Zero `ngClass`, `ngStyle`, `@HostBinding`, `@HostListener` or
  `standalone: true` in `packages/components`. The seven `*ngIf` matches are all inside migration
  **comments**; the four `new Date(` calls are real but confined to `core/common-behaviors/read-state.ts`,
  `core/datetime/timezone.ts` and `notification-center.service.ts` (see LEAD-1).
- **SSR.** The only raw browser global in the library is `breadcrumbs/utils.ts:37,44`, and it carries an
  explicit lint suppression. `scrollbar/scrollbar.ts` was a false positive — it shadows `window` with
  `inject(KBQ_WINDOW)`. Everything else routes through `KBQ_WINDOW`/`DOCUMENT`;
  `accordion/accordion-state-store.ts` is a model implementation.
- **Secrets.** No credential-shaped strings in tracked files. All 12 third-party GitHub Actions are
  SHA-pinned. Every `${{ github.event.* }}` reaching a `run:` block goes through `env:` first — no script
  injection sink.
- **Published package contents.** `e2e.ts`, `*.spec.ts`, `*.playwright-spec.ts` and the 234 baseline PNGs
  do **not** ship: `ng-package.json`'s assets are `**/*.scss` only, `tsconfig.lib.json` sets `types: []`,
  and `dist/components` contains none of them. (The exclusion is incidental rather than enforced — CFG-013.)
- **API guard fidelity.** 63 of 64 components are byte-accurate against their golden files; the `any`
  ratchet is exact at 547 and cannot drift upward silently. The `.replace()`-based entry-point derivation
  in `api-extractor.ts` was replayed over all 65 entry points with **0** mismatches — `button-toggle` and
  `split-button` are fine.
- **Schematics.** All 18 `migrations.json` entries have a matching directory and resolvable factory; the
  six extra directories are `collection.json` generate-schematics by design; all 24 have a spec, schema and
  README; version ranges check out against tag `20.2.0`.
- **SCSS.** Of 901 referenced `--kbq-*` properties, only **4** are genuinely dead (SCSS-004, SCSS-005); the
  rest resolve against `@koobiq/design-tokens`, are set at runtime from TypeScript, or are documented
  opt-in hooks. No light/dark token asymmetry. Exactly two hardcoded colours, both intentional. No alpha
  doubling at any of the 16 `-1px` sites. The three option families use disjoint highlight/press classes.
- **Screenshot baselines.** All 234 cross-check against their `toHaveScreenshot` literals — none orphaned,
  none missing. The tooltip harness is not cropped.
- **Lifecycle non-findings.** `nested-tree-control.ts`, `flat-data-source.ts` and `tree-option.component.ts`
  use `take(1)` and do not leak; `QueryList.changes` completes on view destroy;
  `KbqAutoHideScrollStrategy`'s missing `ngOnDestroy` is not a leak because CDK calls `disable()`;
  `sidepanel-ref` and `actions-panel-ref` do not leak. `modal-control.service.ts` does (OVL-02, OVL-15).
- **Docs ↔ API parity.** Every `[input]`/`(output)` documented for `select`, `datepicker`, `filter-bar`,
  `tree`, `list`, `form-field` and `tags` resolves against the golden files — only `button` and the two
  `progress-*` pages are wrong. All 151 `Kbq*` identifiers named in the docs resolve; the 17 outside the
  API guard are documented *removals* in the breaking-changes guides or live in `ag-grid`/adapter packages.
- **Prerender routes are in sync — no drift.** Derived independently from `structure.ts`: 86 items,
  31 `hasExamples`, 70 `hasApi`, DesignTokens expanding to 7 tabs → 195 paths per locale →
  `1 + 2×195 + 1 = 392`, exactly the committed line count. `discoverRoutes: false` is currently safe.
  `seo-descriptions.ts` likewise matches its 87 localized overview ids with no orphans either way.
  580 example directories ↔ 580 module keys, with only the two name divergences in DOC-13.
- **`empty-state-actions2` is intentional**, not a copy-paste leftover: referenced from both locales and
  deliberately paired with `empty-state-actions` to contrast two actions against three. Do not delete.
- **Positive design decisions.** `playwright.docs.config.ts` correctly spreads rather than nesting the base
  config; `resolveWorkers()` closes the `NaN` "green suite that tested nothing" hole; the e2e Dockerfile is
  digest-pinned with a font/browser assertion; `publish.yml`'s `sort -V` `--latest` decision is correct;
  the three `.yarnrc.yml` audit ignores are still legitimately unmet (verified against `yarn.lock`).
- **The branch.** `git merge-tree` reports `fix/DS-3055` clean against `origin/main`; nothing on main
  touches `packages/components/datepicker`. No AI-attribution trailers, `debugger` statements or focused
  tests were introduced on this branch or on any `review/*` branch. The spec change at
  `datepicker.spec.ts:1149` corrects a test that had been passing for the wrong reason —
  `DateTime.local(2009, 11, 31)` is November 31, i.e. an *invalid* date.

---

## Recommended order of work

1. **CI-01** — the only finding with a security shape. One workflow, four lines.
2. **CFG-001** — restoring `jest-fail-on-console` will surface failures the suite has been hiding; do it
   before anything else that relies on the suite being meaningful.
3. **API-008 / API-009** — the changelog silently drops 11 queued breaking changes; fix before the next release.
4. **TST-01 · TST-02 · TST-03**, then the 21 `expect(spy).not.toHaveBeenCalled()` sites — tests that
   certify defects are worse than absent tests.
5. **The five a11y P0s.** `kbq-select` first (highest traffic, and `list-selection` is a working in-repo
   template), then the datepicker calendar and tree expander, which are WCAG Level A keyboard failures.
   Add a `jest-axe` assertion to each component as it is fixed.
6. **DOC-01 · DOC-02** — five link prefixes and two example keys, with the Russian file as the reference
   answer in both cases. The cheapest user-visible fixes in this report. Follow with DOC-03/04/05: the
   `button` and `progress-*` English pages currently hand readers samples that do not compile or do not render.
7. **The one-line correctness bugs**: DT-03, DT-04, DT-15, SEL-03, SWP-04, SWP-05, FRM-005, FRM-006,
   API-016, API-017, LEAD-1. Each is a few characters and each is a real defect.
8. **SWP-01** — sanitize the markdown component, or make the bypass an explicit opt-in.
9. **BR-01** — relabel the datepicker commit, or fix the midnight-`max` trap in the library.
10. Everything else by severity, with the leak family (CORE-B-03/04/05, OVL-03/04/05, SEL-06/07/08) worth
   doing as one pass since they share a shape.

---

## Appendix — method

Sixteen reviewers ran in parallel over disjoint domains, each read-only and each required to produce
`file:line`, an evidence quote, a concrete failure scenario and a proposed fix. No reviewer was permitted
to run a build, a test or a lint — those were run by the lead, sequentially, and all four pass.

Every P0 and P1 was then re-read in the source by the lead before it entered this report, and a random
sample of P2/P3 findings was re-read to confirm line numbers had not drifted. Findings that did not survive
that check were removed rather than downgraded — one is worth recording: the initial repo-wide grep
flagged `scrollbar/scrollbar.ts` as an SSR violation, and reading the file showed it shadows `window` with
an injected token deliberately.

Two independent reviewers converged on the same shift-click anchor defect from opposite directions
(`CORE-B-01` from the key manager, `SEL-01` from the select), which is the strongest single confirmation in
this report.

`origin/main` advanced twice during the review (`b665e5037` → `c33811a5e`); the branch distance quoted
throughout is against the final state.

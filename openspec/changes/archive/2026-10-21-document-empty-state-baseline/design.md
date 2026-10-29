# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are `packages/components/empty-state/`:

- the component and the four slot directives, the template, the context token and the module;
- the stylesheets (`empty-state.scss`, `_empty-state-theme.scss`, `empty-state-tokens.scss`), read for layout only;
- the unit spec, `e2e.ts` and the Playwright spec;
- the `empty-state.{en,ru}.mdx` and `examples.empty-state.{en,ru}.mdx` pages.

Around it: the docs examples under `packages/docs-examples/components/empty-state/`, the dev app in `packages/components-dev/empty-state/`, the API golden file `tools/public_api_guard/components/empty-state.api.md`, and the parts of `KbqIcon`, `KbqIconItem` and `KbqColorDirective` that the error tint works through. `openspec/specs/` holds only `select`, whose baseline set the pattern this change follows.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the component, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when empty-state behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: the context token the slots inject, the fields the tint sets on an icon, change-detection details.
- Design tokens as an API: their names, their renames and the stylesheet-packaging unit tests that guard them.
- The behaviour of `kbq-icon-item`, `kbq-button` and other content beyond what the empty state does to it.
- Changes to tests, docs or examples.

## Decisions

The general decisions follow the `select` baseline (`openspec/changes/archive/2026-10-21-document-select-baseline/design.md`): English, one flat capability named after the entry point, the spec describes what ships with its quirks, only behaviour confirmed by a test or read in the source goes in, and public names, selectors, host classes and ARIA count as contract. Specific to this component:

1. **One capability for the component and its four slot directives.** The directives have no use apart from `kbq-empty-state`; splitting them out would put the error tint and the slot order in different specs.
2. **Layout is in scope, other styling is not.** The alignment, the width limit, the optical compensation and the zero title margin are what `size`, `alignTop` and the slots visibly do, and the docs page documents them. They are stated with their default values: 320 and 480 px, `--kbq-size-xxl` and `--kbq-size-6xl`, the typography level names. Padding values, colors as hex and token names stay out.
3. **The error tint is stated as the `kbq-error` class on the icon.** That is what the unit tests and a consumer's stylesheet observe. How the tint is applied (a public field of the icon plus a direct class toggle) can change without changing the class, so it stays out.
4. **Content projection rules are in the spec.** The component has no default slot, so content without a slot attribute disappears without an error. The docs page warns about it, and it is the most likely way a consumer loses content. The rule is stated from the template; the control-flow case comes from Angular and is checked by hand.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/empty-state` updates `openspec/specs/empty-state/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Layout and color requirements rest on one e2e screenshot of a table of states] → The screenshot fails on any visual change but does not say which requirement broke. tasks.md checks the layout requirements by hand in `yarn run dev:empty-state`.
- [Default values belong to the tokens] → A theme that overrides `--kbq-empty-state-*` changes the widths and offsets. The spec states the defaults, not a guarantee against overrides.
- [A defect gets recorded as intended behaviour] → "Illustration marks the host" states the class follows the content query, which is what the code does. The consequence that looks like a defect is listed under Findings, not in the spec.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. Both docs pages say `alignTop` and `errorColor` are switched on by "the attribute". Neither input has a boolean transform. A bare `alignTop` attribute is therefore a type error under `strictTemplates` and an empty, falsy string without it. Only `[alignTop]="true"` works, which is what every example uses.
2. The Error section of both pages says an icon in the illustration slot is tinted, and the JSDoc of `errorColor` says "the projected icon". Only a `kbq-icon-item` declared in the consumer's own template is tinted. An image, a plain `kbq-icon`, or an icon item rendered inside a child component keeps its color. The JSDoc of `KbqEmptyStateIcon` names `kbq-icon-item` correctly.
3. The JSDoc of `KbqEmptyStateTitle` and the Accessibility section of both pages give the title typography only for the normal and big sizes. At `compact` the title uses `text-normal`, which is body text rather than heading typography.
4. The JSDoc of `size` says it limits the width of "the title and the text". The actions row is limited to the same width.
5. The Illustration section says "the illustration size can be changed". The component does not size the illustration; the examples set `width` and `height` on the image.
6. `examples.empty-state.{en,ru}.mdx` are "Documentation in progress" stubs. `structure.ts` sets `hasExamples: false`, so they are not routed, but they would show as stubs if the examples tab were turned on.
7. The Accessibility section advises adding `role="status"` to an empty state that is inserted dynamically. A live region inserted together with its content is often not announced; the region usually has to exist before its content changes. Not checked with a screen reader.

**Suspected defects (from reading the code, not reproduced)**

1. `kbq-empty-state_has-icon` follows a content query that includes descendants, not what is projected. A `kbq-empty-state-icon` inside an element without a slot attribute, which is not rendered, or one placed inside another slot, still sets the class. A centred `normal` or `big` empty state then gets the compensation margin with no visible illustration.
2. The `empty-state-content` example gives its decorative illustration `alt="Empty state"`. Next to the title, a screen reader reads a redundant image name; `alt=""` would hide it. It also uses a plain `<img>` with absolute koobiq.io URLs rather than `NgOptimizedImage`.
3. The `empty-state-text-only` example declares `styles` and `colors` fields that its template never uses.

**Tests whose name and body disagree, or that cannot fail**

- "should replace the previous size class instead of accumulating" only checks that `kbq-empty-state_normal` is gone. It would also pass if no size class were rendered at all; the `it.each` case covers the new class separately.
- The comment above "should tint an icon wrapped by the illustration slot" says the directive finds the icon only through `inject(KbqIconItem)` on its own host. The directive now also queries wrapped icons, so the comment describes the past.
- Several comments in the unit spec describe change history ("used to be applied once from ngAfterContentInit", the two "DS-5520 follow-up" notes, "EST-CSS-01 ... used to live in two files"). The repository conventions ask to leave such comments out.
- The e2e spec has one `states` test that screenshots the whole table. A failure does not name the state that changed, and long text and `alignTop` are shot only at the `normal` size.

**Behaviour without a test.** The spec states these from the source, or from Angular's content projection:

- slots declared out of order still render as illustration, title, text, actions;
- an element without a slot attribute and an `@if` block with two roots are not rendered (the single-root block is covered by the unit fixtures);
- the slot directives used outside an empty state;
- an image, a plain `kbq-icon` or an icon item inside a child component is not tinted;
- no `role` or `aria-*` attribute from the component, and a consumer `role` is kept;
- the `kbqEmptyState` template reference;
- a host without a height looking the same in both alignments;
- the 480 px width limit at `big`, which no long-text state exercises.

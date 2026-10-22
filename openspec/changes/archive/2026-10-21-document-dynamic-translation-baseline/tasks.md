# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/dynamic-translation/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/dynamic-translation`, and verify that all eleven tests pass with no snapshot written or updated
- [ ] 1.2 Verify that `packages/components/dynamic-translation` has no `e2e.ts` and no `*.playwright-spec.ts`, so no e2e run applies to this change
- [ ] 1.3 For each requirement in `specs/dynamic-translation/spec.md`, name at least one unit test that asserts it, and for a snapshot test the part of the snapshot that does. Verify that every requirement without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev app

`dev:dynamic-translation` exists in `package.json`. Run `yarn run dev:dynamic-translation` (http://localhost:3003). Its page shows only the two docs examples, whose texts are fixed, so checks 2.3 to 2.7 need a local scratch component added to `packages/components-dev/dynamic-translation/module.ts`. It is never committed and is removed in 2.8.

- [ ] 2.1 Verify the docs examples in the DOM:
    - the overview renders the text, a link reading "Open in a new tab" and the rest of the text directly inside `kbq-dynamic-translation`, which has no attribute other than `text`;
    - the helper example renders `<b>1000</b>` followed by " incidents have been registered." and leaves no `span[data-slot-name]` behind
- [ ] 2.2 Add the scratch component: a `textarea` whose value is bound to the `text` of a `kbq-dynamic-translation` with an `accent` slot rendering `strong`, a later `accent` slot rendering `em`, a list slot rendering `ul`/`li`, a slot inside `@if` with a checkbox for the condition, and a slot nested inside a `span`. Verify the page compiles and renders it
- [ ] 2.3 Verify the text rules by typing into the scratch text:
    - `Press <b>Save</b>` shows the tags as characters and creates no `b` element;
    - switching the locale with the dev locale selector leaves the output unchanged
- [ ] 2.4 Verify slot registration:
    - `[[accent:word]]` renders `<em>word</em>`, the later of the two slots;
    - `[[Accent:word]]` stays literal text;
    - a marker of the slot nested in the `span` stays literal text;
    - a marker of the `@if` slot renders while the checkbox is on and turns into literal text when it is cleared
- [ ] 2.5 Verify the context rules:
    - `(first, second)` gives two items, the second starting with a space;
    - `()` reaches the list slot as the string `()`;
    - a context with a line break typed into it leaves the whole marker as literal text
- [ ] 2.6 Add `<b kbqDynamicTranslationSlot="x">` without the `*` to the scratch template, and verify that the console shows Angular's missing-provider error for `TemplateRef`; then remove it
- [ ] 2.7 Verify the helper in the scratch component:
    - a slot `{ name: 'link', tag: 'a', content: 'docs', attributes: [{ key: 'href', value: '/docs' }] }` renders `<a href="/docs">docs</a>` for `[[link:ignored]]`;
    - `tag: 'kbq-dynamic-translation'` creates an element holding only the marker's context as text, which Angular does not instantiate;
    - changing the helper's `text` after the first render to add a new marker creates no element for it;
    - importing only `KbqDynamicTranslation` and `KbqDynamicTranslationSlot` in the scratch component, without the module, compiles
- [ ] 2.8 Remove the scratch component and verify that `git diff --stat packages/components-dev` prints nothing

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-dynamic-translation-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-dynamic-translation-baseline` once the checks pass. This creates `openspec/specs/dynamic-translation/spec.md`.
- Decide which Findings in `design.md` become changes of their own. Unescaped slot names, which can make rendering throw, and the helper creating its elements only once are the most consequential.
- Decide whether `KbqDynamicTranslationHelper` stays public and documented or becomes internal; either way the spec follows through a delta.

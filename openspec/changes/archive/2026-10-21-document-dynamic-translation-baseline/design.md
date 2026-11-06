# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are `packages/components/dynamic-translation/` (`dynamic-translation.ts`, `module.ts`, the unit spec and its snapshot file), the `dynamic-translation.{en,ru}.mdx` and `examples.dynamic-translation.{en,ru}.mdx` pages, the two docs examples under `packages/docs-examples/components/dynamic-translation/`, the dev app `packages/components-dev/dynamic-translation/` and the API golden file `tools/public_api_guard/components/dynamic-translation.api.md`. The entry point has no styles, no `e2e.ts`, no Playwright spec and no dependency on `@koobiq/components/core`. Two requirements rest on Angular itself rather than on the component's code: which slot templates a content query finds, and the error for injecting `TemplateRef` on a plain element. Both were checked in `@angular/core` 21.2.25.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the component, and every scenario can be checked by an existing test or by hand.
- The marker syntax written down as rules, so a change to the parser can be reviewed against them.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: the parsed-slot model, private members, the regular expression itself and change-detection details.
- The components placed inside slots, such as `KbqLink`.
- Changes to tests, docs or examples.

## Decisions

1. **General decisions follow the select baseline.** One capability at a flat path matching the entry point, written in English; the spec describes what ships, quirks included; only behaviour confirmed by a test or read in the source goes in; suspected defects stay in Findings. The same definition of contract applies: public input and directive names, element selectors, the template context a slot receives, the DOM the component renders and thrown errors.
2. **The helper is in the spec although it is `@docs-private`.** `KbqDynamicTranslationHelper` and `KbqDynamicTranslationHelperSlot` are exported from the entry point, are part of `KbqDynamicTranslationModule`, and the examples tab of the docs page is built on them, so consumers who follow the docs depend on them. Leaving them out was considered and rejected: a change to the helper would then have no contract to diff against. If the helper is later made internal or removed, a `REMOVED` delta records it.
3. **The marker syntax is specified by its outcome, not by the regular expression.** The spec says what reaches the template: the context is the shortest non-empty run of characters on one line that is followed by `]]`, a parenthesised context is split at commas, an unknown name stays as text. Quoting the expression was rejected because it is implementation; a vaguer rule such as "up to the closing brackets" was rejected because it hides the edge cases listed in Findings.
4. **Quirks stated as they ship.** Examples:
    - `[[name]]` gives the template `undefined`;
    - list items keep the spaces after the commas, and `()` gives the string `()`;
    - when two slots share a name, the later one wins;
    - the helper creates its elements once and does not update them.

    A baseline that already "fixed" these would hide the change that fixes them.

5. **Angular-level behaviour counts when a consumer meets it directly.** Where a slot template may sit (direct content children, with `@if`, `@for` and `<ng-container>` transparent) and the missing-provider error for a slot directive without `*` come from Angular, but a consumer writing a template runs into them, so they are requirements. Both are listed under "Behaviour without a test".

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/dynamic-translation` updates `openspec/specs/dynamic-translation/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [More than half of the requirements rest on the source rather than on a test] → tasks.md checks each of them by hand before archiving. A mismatch is corrected in the delta, not in the code.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings. Behaviour the spec does state, such as the helper creating its elements once, can change later through `MODIFIED`.
- [The unit tests are snapshots that also record `KbqLink` markup] → The mapping in tasks.md names the part of each snapshot that backs a requirement, so a link change that breaks a snapshot is not mistaken for a dynamic-translation regression.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The JSDoc of `text` says "The text which will be translated". The component translates nothing; the docs page itself says the string arrives already translated.
2. `KbqDynamicTranslationHelper` and `KbqDynamicTranslationHelperSlot` are marked `@docs-private`, so the API tab hides them and their inputs have no description, yet the examples tab builds its second example on them.
3. The examples heading "Dynamic component creation" and the example title promise component creation. The helper creates plain DOM elements by tag name: a component selector given as `tag` produces an inert element.
4. The syntax section presents `[[<slotName>:<context>]]` as if the context were required. `[[slotName]]` works and gives the template `undefined`.
5. The docs do not say that:
    - a marker with an unknown name stays in the output as literal text;
    - list items keep the spaces after the commas;
    - a context cannot hold `]]` or a line break;
    - a slot template has to be a direct content child of `kbq-dynamic-translation`.
6. The dynamic-component-creation example attaches the created component to `ApplicationRef` and never detaches or destroys it.

**Suspected defects (from reading the code, not reproduced)**

1. Slot names go into a regular expression without escaping. With a slot named `a.b`, `[[axb]]` is taken as a marker and renders nothing; a name containing `|` splits into two alternatives that match no template; an unbalanced `(` or `[` in a name makes rendering throw a `SyntaxError`.
2. With no slot template registered, for example when every slot sits in a false `@if`, the pattern has an empty alternative: `[[]]` and `[[:text]]` disappear from the output instead of staying as text.
3. `[[name:]]` is not a marker on its own, but when a later `]]` follows, the context runs on to it and swallows the text and markers in between: `[[a:]] x [[b:y]]` renders one `a` slot with the context `]] x [[b:y`.
4. A line break inside a context, which longer translations can contain, leaves the whole marker as literal text.
5. `()` gives a template written for a list the string `()` instead of an empty array.
6. The helper replaces its placeholders once. After a later change to `text`, the created elements keep their first text, markers new to the text render as empty placeholder `span` elements with `data-slot-name` and `data-slot-content`, and the elements of removed markers stay in the DOM, because Angular removes only the placeholder it rendered.
7. The helper's elements are created only in the browser, so server-rendered or prerendered output holds the empty placeholders.
8. A helper slot without `content`, used in a marker without a context, renders the text "null": the placeholder has no `data-slot-content` attribute, and the missing value becomes a text node.
9. The helper sets `attributes` with `Renderer2.setAttribute`, which bypasses Angular's sanitization, and accepts any `tag`. An `href` from untrusted data, or a `script` tag whose text comes from the translation, is not sanitized.

**Tests whose name and body disagree, or that cannot fail**

- "should render component with 2 slots", "should change text dynamically" and "should handle slots without context" snapshot the inner markup of `KbqLink` (`kbq-link__text`, `kbq-link__trailing`, `tabindex`), so a change to the link component fails them.
- "should handle undefined slot" tests a slot name that is not registered, not an `undefined` value.
- "should handle malformed slot syntax" covers only unknown names and single brackets. An unclosed marker of a registered name, such as `[[testSlot2:x`, is not tested.
- No test covers `KbqDynamicTranslationHelper`.

**Behaviour without a test.** The spec states these from the source:

- the text is not translated and does not follow the locale;
- the text is not parsed as markup;
- which slot templates are registered (control flow and `<ng-container>` are transparent, another element is not) and that an empty name is ignored;
- the missing-provider error for a slot directive used without `*`;
- the later of two slots with the same name wins;
- slot names are compared case-sensitively;
- list items keep their spaces, and `()` gives the string `()`;
- a context does not span a line break;
- adding or removing a slot template re-renders the output;
- every helper requirement, and the standalone import of a single piece.

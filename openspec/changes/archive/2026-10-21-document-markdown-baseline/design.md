# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are `packages/components/markdown/` (the component, the parsing service, the list of aliased tags, the module, the styles where they decide what is shown, the unit specs with their snapshot file, `e2e.ts`, `e2e.html` and the Playwright spec), the `markdown.{en,ru}.mdx` and `examples.markdown.{en,ru}.mdx` pages, the docs examples under `packages/docs-examples/components/markdown/`, `KbqNativeScrollbar` in `@koobiq/components/scrollbar`, and the API golden file `tools/public_api_guard/components/markdown.api.md`. The output that `marked` 17.0.3 (the installed version; the peer range is `^17.0.0`) gives for fenced code, ordered lists, aligned tables, hard breaks and raw HTML was checked by running the parser directly, without the component. The general approach follows the `select` baseline in `openspec/specs/select/spec.md`.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the component, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when markdown behaviour changes later, including the `kbq-markdown__*` classes that the docs site also depends on.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Restating CommonMark or GitHub Flavored Markdown: the spec covers the constructs the docs page shows, at the level of the element and class each one produces.
- Internals: the private members of the component, the regular expressions of the service, the lists of aliased tags as data, change detection and timing.
- Visual styling and design tokens, beyond what decides whether something is shown at all.
- Changes to tests, docs or examples.

## Decisions

1. **General decisions follow the `select` baseline**: one capability at a flat path named after the entry point, English, quirks described as they ship, only confirmed behaviour, and the same rule for what counts as contract.
2. **`KbqMarkdownService` is part of the capability.** It is marked `@docs-private`, but it is exported, listed in the API golden file, provided by `KbqMarkdownModule`, has its own unit suite, and its output is not sanitized. Leaving it out was considered and rejected: a consumer can inject it today, and a change to it changes the component's output too.
3. **The `kbq-markdown__*` classes are contract.** They are the styling hooks the component exposes, `CLASS_PREFIX` is exported, and `apps/docs` styles its pages and derives anchor levels from them. Which tags get a class, and the cases where they do not, are written as requirements.
4. **Behaviour that comes from `marked` is described through the component's output.** The spec says what HTML a consumer gets, not which library option produced it, except for the options token, which is the component's own API. A `marked` upgrade that changes the output is a spec change, and the snapshot tests will show it.
5. **Three quirks are in the spec, because a test or the source states them directly:** header cells of aligned columns get no class, the `language-*` class of a fenced code block is lost, and the HTML is not sanitized. They are also listed under Findings, so that a fix can come as a `MODIFIED` delta.
6. **Two visual rules are in the spec:** the projected source is not displayed, and the line after an image is displayed as its caption. Without the first the component would show its input; the second is how the docs page presents images. The other styles stay out.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/markdown` updates `openspec/specs/markdown/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [The output depends on the version of `marked`] → The two snapshot tests assert the whole rendered DOM, so a parser upgrade that changes it fails them. The spec is then corrected through a delta in the same change.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand before archiving. A mismatch is corrected in the spec, not in the code.
- [Writing down HTML that is not sanitized as a requirement reads like an endorsement] → It is what ships, and the service JSDoc says so. It is recorded first under Findings; making the output safe is a change of its own.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The "Line break" section of `markdown.en.mdx` and `markdown.ru.mdx` says that with `markdownText` you need `\n` at the end of the line and `{ breaks: true }`. Neither is quite right:
    - `\n` becomes a newline only inside a TypeScript string or an inline template literal, as in the example; in an external `.html` template, `markdownText="a\nb"` passes a backslash and an "n".
    - `breaks: true` is not needed: two trailing spaces before the newline give a `br` with the default options, as they do for projected content.
2. The docs do not say that projected content needs `ngPreserveWhitespaces` on `kbq-markdown`, although every example and test uses it. They also do not say that the projection is read as plain text, so markup characters have to be written as entities and elements lose their tags.
3. The docs do not say that the output is not sanitized. Only the JSDoc of `KbqMarkdownService.parseToHtml` says so, and the service is `@docs-private`, so the API tab hides it.
4. The docs never name `KBQ_MARKDOWN_MARKED_OPTIONS` or `kbqMarkdownMarkedOptionsProvider`; only the source of the line-break example shows the provider.
5. The comment on the whole-tag list says `th` and `p` are kept apart only to avoid matching `thead` and `pre`. The same rule also skips a `th` or `p` that has attributes (see suspected defect 3).
6. The examples `markdown-line-break` and `markdown-line-break-with-markdown-text-input` share the title "Markdown line break", and `markdown-overview` is titled "Markdown headers".

**Suspected defects (from reading the code, not reproduced)**

1. `KbqMarkdown` imported on its own, without `KbqMarkdownModule`, seems unable to start. `KbqMarkdownService` is `@Injectable()` without `providedIn`, and only the module provides it, so creating the component should fail with a missing-provider error. AGENTS.md treats the modules as legacy and the components as standalone; every test and example imports the module.
2. Raw HTML in the source reaches the DOM without sanitization, so an event-handler attribute such as `onerror` on an `img` runs. With `markdownText` bound to user input, this is a script-injection path.
3. Header cells of aligned table columns get no `kbq-markdown__th` class, because `th` is aliased only without attributes. The snapshot tests lock this in.
4. Inserting the alias `class` in front of an existing `class` attribute leaves two `class` attributes, and the browser keeps the first. A fenced code block loses its `language-*` class, which syntax highlighters look for, and a raw HTML element of a listed tag loses its own classes.
5. `async: true` in the options, or an async extension registered with `marked.use()`, makes `marked.parse` return a promise. The service treats the result as a string, so rendering would throw a `TypeError`.
6. The component calls the global `marked` instance, so `marked.use()` or `marked.setOptions()` anywhere in the application changes every `kbq-markdown`. This is not documented.
7. An ordered list that starts at another number, such as `3.`, gets `start="3"`. However, the styles hide the native numbers and count the items with a CSS counter that starts from zero, so the list seems to display from "1.".
8. Projected content is read only in the browser, so prerendered pages, the docs site included, carry an empty output for projected Markdown until the application starts.
9. The `--kbq-markdown-*-max-width` tokens, `--kbq-markdown-size-max-width: 650px` among them, are declared, but no style rule reads them.

**Tests whose name and body disagree, or that cannot fail**

- "should generate html from markdown string" builds its fixture in a TypeScript string, where `&#32;&#32;` is entity text, not two spaces. The line-break part of the fixture therefore renders no `br` (the snapshot shows "First line" and "Second line" in one text node), while the same lines in the inline-template test do. The fixture reads as if it tested hard breaks for the input.
- "should customize the scrollbars of the host and of the rendered content" asserts only the two host classes; nothing about the rendered content is checked.
- The two snapshot tests assert the whole DOM, so the quirks in suspected defects 3 and 4 are locked in without a test that names them. A fix shows up only as a snapshot diff.

**Behaviour without a test.** The spec states these from the source:

- re-rendering when `markdownText` changes to another non-empty text (only the change to `null` is tested);
- falling back to the projected content when `markdownText` is an empty string;
- elements in the projection contributing only their text;
- the projected source not being displayed (the e2e screenshot shows it only implicitly);
- projected content rendering only in the browser;
- `KBQ_MARKDOWN_MARKED_OPTIONS`, which has no unit test; the e2e screenshot of the `breaks: true` case backs it;
- the event-handler attribute surviving, that is, the component not sanitizing (the service suite shows only a harmless `abbr` passing through);
- links getting no `target` and not going through the router, and a link title being kept;
- the caption under an image being displayed on a line of its own.

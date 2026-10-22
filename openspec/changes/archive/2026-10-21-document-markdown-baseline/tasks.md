# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/markdown/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/markdown`, and verify that the component and service suites pass on the baseline commit without updating `__snapshots__/markdown.component.spec.ts.snap`
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/markdown` and verify that both tests pass without new baselines. They back the hidden source, the code block, the `breaks: true` option and the link focus ring requirements
- [ ] 1.3 For each requirement in `specs/markdown/spec.md`, name at least one unit test, snapshot entry or e2e test that asserts it. Verify that every requirement without one is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour by hand

Run the checks in `yarn run dev:markdown` (the script exists in `package.json`; it serves the docs examples on http://localhost:3003). The projected content is watched, so editing the text of a hidden `.kbq-markdown__input` element in the browser's developer tools re-renders that component without touching the code. Checks that need a `markdownText` binding use a temporary fixture in `packages/components-dev/markdown/module.ts` that is removed before 3.2.

- [ ] 2.1 Verify in the DOM and the computed styles:
    - `.kbq-markdown__input` has `display: none` and the raw Markdown is not visible;
    - in the image example, the caption `em` follows the `img` and is displayed on its own line under it;
    - links have an `href` and no `target`
- [ ] 2.2 Verify the projection as plain text by setting the `innerHTML` of a `.kbq-markdown__input` element in the console:
    - `<b>bold</b>` renders the plain paragraph "bold" without a `b` element;
    - `[t](https://koobiq.io "title")` renders a link that keeps `title="title"`
- [ ] 2.3 Verify that the output is not sanitized: set the `textContent` of a `.kbq-markdown__input` element to `<img src="x" onerror="console.log('not sanitized')">` and check that the rendered `img` keeps `onerror` and the message is logged
- [ ] 2.4 With the temporary fixture, verify the `markdownText` rules:
    - changing the bound text from `'# One'` to `'# Two'` leaves one `h1` reading "Two";
    - setting it to `''` renders the projected Markdown instead;
    - `kbqMarkdownMarkedOptionsProvider({ breaks: true })` on the fixture turns a single newline into a `br`, and without it the newline does not
- [ ] 2.5 Verify the server rendering rule without the SSR dev app, which does not include markdown: after building the libraries and running `yarn run docs:build`, open `dist/releases/koobiq-docs/browser/en/components/markdown/overview/index.html` and check that the `kbq-markdown__output` elements of the projected examples are empty in the prerendered HTML

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-markdown-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed, the temporary dev-app fixture included

## Workflow follow-up

- Archive with `/opsx:archive document-markdown-baseline` once the checks pass. This creates `openspec/specs/markdown/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The output that is not sanitized and the standalone component that cannot find its service are the most consumer-visible ones.

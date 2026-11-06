# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/icon/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/icon`, and verify that the icon, icon button, icon item and registry unit suites pass on the baseline commit
- [ ] 1.2 Run `npx vitest run packages/components/timepicker -t "kbq-error class to a prefix clock icon"` and verify it passes. It backs the automatic error color inside a real form field
- [ ] 1.3 Run `yarn run e2e:docker yarn playwright test packages/components/icon` and verify the icon e2e suite passes. It backs the projected SVG, the URL resolver with a component-level registry, the color classes and the icon item variants
- [ ] 1.4 For each requirement in `specs/icon/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev app

`dev:icon` exists in `package.json` (`ng serve dev-icon --port 3003`). Its `main.ts` registers a dictionary and a catch-all resolver to `/assets/svg-icons/<name>.svg`, and the app also serves the `@koobiq/icons` sprite at `/assets/svg-icons/sprite/sprite.symbol.svg`. Run each check in `yarn run dev:icon` (http://localhost:3003) with the Elements and Network panels open. Registry calls the page does not make are made from the browser console: `ng.getComponent(element)` returns the icon, and its `registry` and the registry's `sanitizer` are reachable there at runtime.

- [ ] 2.1 Verify resolution and fallback on the "SVG icon provisioning approaches" rows:
    - `chevron-down-s_16` requests `/assets/svg-icons/chevron-down-s_16.svg`, and the host gets that `<svg>` as its first child with `aria-hidden="true"`, `focusable="false"`, `width="16"` and `height="16"`, and loses the font class;
    - `dict-plus_16` requests `/assets/svg-icons/plus_16.svg`, the dictionary value, not `dict-plus_16.svg`;
    - `kbq:plus_16` requests `/assets/svg-icons/plus_16.svg`, without the namespace;
    - `kbq-chevron-down-s_16` (approach D) requests `/assets/svg-icons/kbq-chevron-down-s_16.svg`, gets no SVG back, and keeps the font class and `kbq-empty`
- [ ] 2.2 Verify the sprite rules from the console:
    - after `addSvgIconSetInNamespace('s', …)` with the sprite URL, `getNamedSvgIcon('s:plus_16')` emits an `<svg viewBox="0 0 16 16">` after one request, and a second lookup in `s` makes no request;
    - with the sprite registered in a namespace `t` under the URL with `?first` and then under the URL with `?last`, a lookup of `t:plus_16` requests only the `?last` URL, the one registered last
- [ ] 2.3 Verify the literal and markup rules from the console:
    - a trusted literal registered with `{ viewBox: '0 0 24 24' }` emits an `<svg>` with that view box and makes no request;
    - `getNamedSvgIcon('<svg viewBox="0 0 16 16"><path d="M0 0h16v16H0z"/></svg>')` fails with "could not find <svg> element", which shows that the sanitizer drops `<svg>` from untrusted markup, as the resolver-markup requirement states
- [ ] 2.4 Verify the icon button on the first docs example (`icon-button-overview-example`), after adding a click listener to it from the console:
    - the `<i>` host has `role="button"`, `tabindex="0"` and no `aria-hidden`;
    - tabbing onto it adds `cdk-focused` and `cdk-keyboard-focused`, and pressing Enter or Space does not run the click listener;
    - checking "disabled" adds `disabled`, `aria-disabled="true"` and `kbq-disabled`, removes `tabindex` and the focus classes, and a mouse click no longer runs the listener
- [ ] 2.5 For the behaviour neither the tests nor the dev app reach, read the source and verify it matches the spec: the `iconSize` transform and the SVG adoption in `icon.component.ts`, the single-value provider of `kbqIconsProvider` in `icon-registry-providers.ts`, the root registry reading its own injector's providers in `icon-registry.ts`, and `autoColor` without an error-state provider

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-icon-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-icon-baseline` once the checks pass. This creates `openspec/specs/icon/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The disabled icon button on a link that stays reachable from the keyboard and the resolver JSDoc that promises inline SVG strings are the most user-visible ones.

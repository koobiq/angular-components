# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/badge/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/badge`, and verify the badge unit suite passes on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/badge` and verify the badge e2e suite passes. It backs the color values, the supported color and fill combinations, and the trailing icon added after the first render
- [ ] 1.3 For each requirement in `specs/badge/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev app

`dev:badge` exists in `package.json` (`ng serve dev-badge --port 3003`). Run each check in `yarn run dev:badge` (http://localhost:3003). The dev app renders a static grid of badges and does not embed the docs examples, so checks marked "temporary markup" add it to `packages/components-dev/badge/template.html` (and a field to `module.ts` where a binding needs one) and revert both before 3.2.

- [ ] 2.1 Verify in the DOM of the existing badges:
    - the projected text and icons are direct children of `kbq-badge`, with no element of the badge's own around them;
    - a `<span kbq-badge-caption>` has the `kbq-badge-caption` class;
    - a badge in the `disabled` color has no `disabled` or `aria-disabled` attribute;
    - no badge host has a `tabindex`, a `role` or an `aria-*` attribute, and Tab never stops on a badge
- [ ] 2.2 With temporary markup, verify the color input:
    - `badgeColor="brand"` gives the host `kbq-badge_brand` and logs nothing;
    - `[badgeColor]="null"` and `[badgeColor]="undefined"` give `kbq-badge_fade-contrast`;
    - `<span kbq-badge>` creates no badge
- [ ] 2.3 With temporary markup bound to a field toggled from the console or a button, verify:
    - `outline` switching from `true` to `false` swaps `kbq-badge-outline` for `kbq-badge-filled`;
    - `compact` switching from `true` to `false` removes `kbq-badge_compact`;
    - `[outline]="'false'"` leaves the badge filled
- [ ] 2.4 With temporary markup, verify the icon spacing rules:
    - a badge holding only `<i kbq-icon="kbq-play_16"></i>` has no icon spacing class on the icon or the host;
    - in text, icon, caption order the icon has neither `kbq-icon_left` nor `kbq-icon_right`;
    - an icon wrapped in a `<span>` before the text gets no class;
    - an icon added and then removed by an `@if` leaves the host without `kbq-badge-icon_right`
- [ ] 2.5 With temporary markup, verify that an outlined badge in the `error` color gets no text, background or border color rule from the theme (DevTools "Computed" shows the inherited color and a transparent background)
- [ ] 2.6 Verify that a template importing only `KbqBadge`, for example a temporary standalone component in the dev app, renders a badge with a leading icon without `kbq-icon_left` on the icon or `kbq-badge-icon_left` on the host

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-badge-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed, including the temporary dev app markup from group 2

## Workflow follow-up

- Archive with `/opsx:archive document-badge-baseline` once the checks pass. This creates `openspec/specs/badge/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The docs promising a tooltip on focus for a badge that cannot take focus, and the icon spacing that a standalone `KbqBadge` import silently loses, are the most user-visible ones.

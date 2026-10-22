# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are `packages/components/link/` (`link.ts`, `link.scss`, `link.module.ts`, the unit spec `link.spec.ts`, `e2e.ts` and the Playwright spec `e2e.playwright-spec.ts` with its baselines), the shared link mixins in `packages/components/core/styles/common/_link.scss`, `supportsNativeDisabled` in `core/utils`, `KbqIcon` for the external icon, the `link.{en,ru}.mdx` and `examples.link.{en,ru}.mdx` pages, the examples under `packages/docs-examples/components/link/`, the dev app in `packages/components-dev/link/` and the API golden file `tools/public_api_guard/components/link.api.md`. The consumers of `disabledSignal` (`kbqTooltip`) and of a negative `tabIndex` (file-upload) were read to confirm what the link exposes to them. `link/deprecated` was not read beyond its file list.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the component, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when link behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: private members, the order in which listeners are attached, change-detection details, CSS structure and design tokens beyond what a consumer selects through an input.
- The deprecated `kbq-link` directive in `link/deprecated`, and the components that render a link inside them.
- Changes to tests, docs or examples.

## Decisions

1. **The general decisions follow the select baseline** (`openspec/changes/archive/2026-10-21-document-select-baseline/design.md`): one capability at the flat path `link`, English, quirks documented as they ship, only confirmed behaviour in the spec, and the same idea of what counts as contract.
2. **Quirks that the spec states as they ship.** Examples:
    - an `<a>` without a `href` and without `pseudo` is a regular link: a tab stop with no role and no Enter or Space handling;
    - Space activates a pseudo link when the key goes down, where a native button waits for the key to be released;
    - declaring a `role` on a pseudo link turns off the component's Enter and Space activation;
    - a disabled link keeps its `href` and its `data-print` attribute; only activation and the printed text are suppressed.

    A baseline that already "fixed" these would hide the change that fixes them.

3. **Host classes, attributes and the icon name count as contract.** `kbq-link`, `kbq-link_pseudo`, `kbq-link_size_*`, `kbq-link_underline_*`, `kbq-link_use-visited`, `kbq-disabled`, the `kbq-link__text`, `kbq-link__trailing`, `kbq-link__prefix`, `kbq-link__suffix` and `kbq-link__external-icon` classes, the `data-print` attribute and the `kbq-north-east_16` icon are asserted by the unit tests and used by the stylesheet, so consumers can style or test against them. The `kbq-visited`, `kbq-hovered` and `kbq-active` classes that the stylesheet reads are named only where the e2e baselines rely on them.
4. **`disabledSignal` is left out.** It is public but `@docs-private`, and exists for `kbqTooltip`'s `forDisabledComponent`, whose behaviour belongs to the tooltip spec. The spec describes the `disabled` input instead.
5. **Visual requirements rest on the Playwright suite.** "Only the text is underlined", the underline modes, visited links, the printed page, wrapping and right-to-left layout are visual. Each has an e2e screenshot or a geometric e2e assertion behind it, and the spec states the effect, not the CSS that produces it.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/link` (not `link/deprecated`) updates `openspec/specs/link/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand in `yarn run dev:link`, or in the source where no rendered example covers them, before archiving. A mismatch is corrected in the delta, not in the code.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings. Behaviour the spec does state can change later through `MODIFIED`.
- [Screenshot baselines say little in words] → The visual requirements name what a screenshot shows, so a failing baseline can be traced to the requirement it backs.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The JSDoc of `KbqLink` says the link applies to "an `<a>` with a `href`" or to "any other element, which makes it a pseudo link that acts as a button". An `<a>` without a `href` and without `pseudo` is neither: it stays a regular link. A `<button>` or a `<label>` host is a pseudo link that gets no button role from the component.
2. The JSDoc of `tabIndex` says a `<label>` "is left out" of the tab order. A `<label>` that declares a role in the template gets the `tabindex` like any other link.
3. The JSDoc of `pseudo` describes a pseudo `<a>` as "a control without a `href`". `pseudo` also works on an `<a>` with a `href`, which keeps it: Enter is then left to the browser and Space clicks the anchor (tested).
4. The docs say `print` prints "its address" and that "http://www" can be dropped. The component prints the resolved `href`, so a relative `href` prints with the host (`localhost/docs`), and it strips only `http://` and `https://` with a following `www.`; a `mailto:` address is printed in full.
5. The `link-print` example binds an explicit text instead of showing the valueless `print` the docs describe, and its text has no trailing slash, while the sample printout above it ends with `/`.
6. The docs do not say that `kbqLinkPrefix` and `kbqLinkSuffix` have to be imported. Without them the marked content is still projected into place, because projection matches the attribute, but it lacks the `kbq-link__prefix` and `kbq-link__suffix` classes: the prefix loses its gap to the text, and a caption in the suffix no longer wraps inside.
7. The "Disabled" section of the docs has only an example. It does not say that a disabled link keeps its `href`, is marked with `aria-disabled`, leaves the tab order and also stops ArrowDown, ArrowLeft and ArrowRight.
8. The `link-overview` example declares the unused fields `active` and `focus` and renders the same external link twice.

**Suspected defects (from reading the code, not reproduced)**

1. `[tabIndex]="null"`, `undefined` or a non-numeric string goes through `numberAttribute` without a fallback and becomes `NaN`. The host then gets `tabindex="NaN"`, which browsers ignore: a pseudo `<span>` loses its tab stop, its `button` role and its Enter and Space activation.
2. An external link is marked only by an icon that `KbqIcon` hides with `aria-hidden="true"`. The accessible name does not say that the link leads outside the product, and axe does not flag it.
3. An `<a kbqLink>` without a `href` and without `pseudo` gets `tabindex="0"` but no role and no keyboard activation: a tab stop that the keyboard cannot use.
4. `kbqLinkOptionsProvider({ size: undefined })` is allowed by its `Partial` type, overrides the built-in `normal` with `undefined` and leaves links without any size class.

**Tests whose name and body disagree, or that cannot fail**

- "should keep reporting the bound tabIndex while disabled" reads the `tabIndex` and `disabled` inputs, which the component cannot write, and looks at no DOM, so it cannot fail.
- "should let a forDisabledComponent consumer drive disabledSignal" uses no tooltip and writes the signal itself. The real consumer, `kbqTooltip`, only reads it.
- The Playwright "states of every kind of link" and "icons in every state" force hover, press and keyboard focus with the `kbq-hovered`, `kbq-active` and `cdk-keyboard-focused` classes. They show the styles of those states, not that a real pointer or keyboard reaches them.

**Behaviour without a test.** The spec states these from the source:

- `exportAs: 'kbqLink'`, `focus()` and `getHostElement()`;
- the default `tabindex="0"` of a link and a pseudo link;
- a `<button>` host: the `kbq-link_pseudo` class, no role and no activation from the component (only its native `disabled` is tested);
- a `<label>` that declares a role keeps the tab stop;
- keys pressed on an element inside the link do not activate it;
- non-breaking spaces at the edges of the text are kept;
- `aria-hidden="true"` on the external icon;
- a given `print` text on a link without a `href` is printed as is;
- a disabled pseudo link keeps `role="button"`, and a disabled link stops ArrowDown, ArrowLeft and ArrowRight but lets other keys through (only Enter is tested);
- `KbqLinkModule` re-exports the three standalone pieces.

# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are:

- `packages/components/icon/`: `KbqIcon`, `KbqIconButton`, `KbqIconItem`, the registry and its providers, the error-state context, the styles where they define behaviour (`pointer-events` of a disabled icon button, the focus ring classes), the unit specs of the three components and the registry, `e2e.ts` and the Playwright spec;
- `KbqColorDirective` and `KbqComponentColors` in `packages/components/core/common-behaviors/color.ts`, and the error-state provider of `kbq-form-field`;
- the `icon`, `icon-button` and `icon-item` pages (`*.en.mdx`, `*.ru.mdx`), the docs examples under `packages/docs-examples/components/icon/` and the dev app in `packages/components-dev/icon/`;
- the API golden file `tools/public_api_guard/components/icon.api.md`.

Claims about Angular itself (`HttpClient` provided in root, the HTML sanitizer dropping `<svg>`) were checked against the installed `@angular/common` and `@angular/core` 21.2. `openspec/specs/` holds only the `select` spec, which set the pattern this change follows.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the entry point (host classes and attributes, the inserted SVG, requests, console output, thrown and emitted errors), and every scenario can be checked by an existing test or by hand.
- One place to diff against when icon behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- The glyphs and SVG files of `@koobiq/icons`, including the two-tone `--icon-accent-color` variable, which the icon artwork defines and this entry point never reads.
- Colors, paddings, design tokens and the `kbq-icon-rotate_*` and `kbq-icon-flip-*` utility classes.
- How other components use icons (form field cleaner, tags, alert, empty state and the rest).
- Changes to tests, docs, examples or the dev app.

## Decisions

The general decisions follow the select baseline: English, a flat capability path named after the entry point, quirks documented as they ship, only behaviour confirmed by a test or read in the source, and public names, host classes, ARIA attributes and error messages as the contract. Decisions specific to this change:

1. **One capability for the three components and the registry.** They ship in one entry point, the icon button and the icon item extend the icon, and the registry is what decides between the font class and an inline SVG. A separate `icon-registry` capability was considered and rejected: almost every registry behaviour is observed through the DOM of an icon, and a change to resolution would touch both.
2. **The registry is specified through its public surface.** Requirements name `addSvgIcon*`, `getNamedSvgIcon`, `kbqIconsProvider`, `kbqIconsResolverProvider`, `kbqIconsDictProvider` and `KbqIconOptions`, and quote the registry's error messages, because consumers call these and match on these. Caches, in-flight request maps and how a sprite symbol is copied are not contract.
3. **The error-state context is described through the form field.** `KBQ_ICON_ERROR_STATE_CONTEXT` and its provider factory are `@docs-private`, and `kbq-form-field` is the only provider in the library, so the `autoColor` requirement speaks of the form field.
4. **Quirks stated as contract.** These ship and are plausibly intended, so the spec states them:
    - a resolver answer that starts with `<` goes through the HTML sanitizer, and the icon falls back to its font class;
    - a later `kbqIconsProvider` in the same injector replaces an earlier one;
    - an icon without a color carries `kbq-empty`;
    - the icon button writes `aria-disabled` and the `disabled` attribute on every host and adds no keyboard activation.
5. **Suspected defects stay out.** The focus-origin requirement speaks of an icon button that "becomes disabled", because an icon button disabled from the start appears to be monitored anyway (Findings). Assigning `iconName` after initialization is left out for the same reason.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/icon` updates `openspec/specs/icon/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Many registry requirements rest on the source rather than on a test] → tasks.md checks them by hand in `yarn run dev:icon`, whose `main.ts` already registers a dictionary and a catch-all URL resolver. A mismatch is corrected in the delta, not in the code.
- [Two requirements depend on Angular's behaviour, not on this library] → The sanitizer dropping `<svg>` and `HttpClient` being provided in root can change with an Angular upgrade. The upgrade that changes them updates the "Resolver answers that are markup", "Literals are sanitized" and "URL icons without an HTTP client" requirements.
- [A defect gets recorded as intended behaviour] → Suspected defects are listed under Findings and kept out of the spec. Behaviour the spec does state can change later through `MODIFIED`.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The JSDoc of `KbqIconResolver` and `KBQ_ICON_RESOLVER` says a resolver may answer with an inline SVG string. Such an answer goes through Angular's HTML sanitizer as untrusted text, which removes `<svg>`; the icon keeps its font class and Angular logs a "sanitizing HTML stripped some content" warning in dev mode. Only the JSDoc of `kbqIconsDictProvider` says so.
2. The "Dictionary" section of `icon.en.mdx` and `icon.ru.mdx` says an unknown name falls through to the next resolver "and then to the font class". The registry tries the sprites of the namespace first. The pages also do not say that a resolver answering for every name, like the URL resolver example, hides every sprite.
3. The URL resolver example maps every name, including the `kbq-*` font names that other components render. Each of those then issues a request and keeps its font class only after the request fails. The pages do not warn about it.
4. `kbqIconsProvider` takes several sprites but provides them as one value without `multi`, so a second call in the same injector replaces the first. The pages and the JSDoc do not say so.
5. The JSDoc of `KbqIconButton` and the accessibility section of the icon page say `aria-disabled` is supplied on a host that is not a native `<button>`. It is written on a native `<button>` as well, and the `disabled` attribute is written on every host.
6. The dev app labels "Approach A" as a sprite from `kbqIconsProvider`, but its `main.ts` registers no sprite. The `kbq:` names there reach the catch-all resolver with the namespace removed.
7. `examples.icon.en.mdx` and `examples.icon.ru.mdx` are "documentation in progress" stubs. `structure.ts` sets `hasExamples: false` for the icon, so they are never shown.
8. The `big` and `fade` inputs of `KbqIconItem` take no boolean-attribute transform, unlike `disabled` and `autoColor`, so a bare `big` attribute does not type-check. The docs examples bind `[big]="true"`.

**Suspected defects (from reading the code, not reproduced)**

1. `iconName` is a public field. Assigned after initialization, it changes only the font class on the next check: no SVG is resolved, the `max-height` of the old name stays, and while an SVG is shown the old SVG stays, because the font class is not rendered then.
2. An icon button disabled from the start is focus-monitored anyway: the effect stops monitoring before the view is initialized, and the view-init hook then starts it without checking `disabled`.
3. A disabled icon button on an `<a href>` stays in the tab order, and Enter follows the link. Only the `tabindex` attribute is removed, and `pointer-events: none` stops only the pointer.
4. A resolver that throws makes `getNamedSvgIcon` throw synchronously, although the class comments say that every failure arrives as an error notification. `KbqIcon` survives only because it defers the call.
5. `getNamedSvgIcon` accepts a name that is itself markup (starts with `<`), but sanitizes it as untrusted text, so this path can never produce an SVG.
6. When `iconSize` turns `undefined` on a name without a size, the inserted SVG keeps the `width` and `height` of the old size, while the host's `max-height` is removed.
7. `kbq-icon-flip-h` applies `scaleY(-1)` and `kbq-icon-flip-v` applies `scaleX(-1)`. The names look swapped, and no page documents these classes.

**Tests whose name and body disagree, or that cannot fail**

- The registry tests "strips `<script>` elements embedded in the SVG", "strips inline event-handler attributes from the SVG root" and "strips event-handler attributes from nested SVG children" assert that registration throws, because the sanitizer drops the `<svg>` itself. Nothing is stripped and kept. `toThrow()` without a message also passes on any error.
- "should handle a click on the button" checks that the test host's own `(click)` listener runs on a native click. The icon button adds nothing to click handling, so the test cannot fail because of it.
- The `hydration` test "should adopt an already-rendered svg instead of duplicating it on a repeat resolution" renders on the client and calls `ngOnChanges` by hand. The constructor path that adopts a server-rendered SVG never runs in any test.
- "does not register same URL twice" probably cannot fail. Without the check, the second registration would join the request still in flight instead of sending its own, so one request would be seen either way.

**Behaviour without a test.** The spec states these from the source:

- the `kbq-empty` class of an icon without a color, and `autoColor` outside a form field or given as a bare attribute;
- an `iconSize` that does not parse being ignored;
- the fallback to the font class after a failed request or markup without `<svg>`, and a pending resolution being dropped on a name change;
- `aria-hidden="true"` and `focusable="false"` on the inserted SVG;
- adopting a server-rendered SVG;
- the lookup order, the details of resolvers (namespace removed, `null` passing the name on, remembered answers, markup answers) and the registry being configured per injector — the URL resolver and the component-level registry are backed only by the e2e screenshots;
- the sprite view box fallbacks and the order of several sprites in one namespace;
- `kbqIconsProvider` and `kbqIconsDictProvider`;
- a fetched icon being parsed once and copied, and `KbqIconOptions`;
- for the icon button: its font class and the missing `max-height`, the `disabled` attribute on a generic host, `pointer-events: none` while disabled, `disabled` set in code, the missing Enter and Space activation, and the focus-origin classes;
- `getHostElement()` of the icon button and the icon item.

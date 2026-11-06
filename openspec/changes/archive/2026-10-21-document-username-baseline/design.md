# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are `packages/components/username/` (component, template, pipes and format functions, constants, types, module, styles where they decide layout, the unit spec with its snapshots, `e2e.ts`, the Playwright spec and its baselines), the `username` section of the locale data and the locale helpers in `packages/components/core/locales`, the `kbq-title` directive the component attaches, the six docs examples under `packages/docs-examples/components/username/`, the `username.{en,ru}.mdx` pages and the API golden file `tools/public_api_guard/components/username.api.md`. The component has no examples tab (`hasExamples: false` in `structure.ts`), so there is no `examples.username.*.mdx`. Every claim was checked against the source before going into the spec. `openspec/specs/` holds only `select`, whose baseline set the pattern this change follows.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the component or the exported functions, and every scenario can be checked by an existing test or by hand.
- One place to diff against when username behaviour changes later, including the two format syntaxes, which are easy to confuse.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: private members, computed signals, the change-detection details and the CSS structure and design tokens beyond the host classes a consumer sets.
- The behaviour of `kbq-title` itself (when a tooltip shows and hides), of `kbq-filter-bar`, `kbqLink` and the highlight pipe used by the examples, and of the locale service.
- Changes to tests, docs or examples.

## Decisions

The general decisions follow the select baseline: one capability at the flat path of the entry point, English, the spec describes what ships with its quirks, only confirmed behaviour goes in, and the contract is public names, selectors, host classes, ARIA, thrown errors and exported constants. Component-specific decisions:

1. **The pipes and functions belong to the `username` capability.** `kbqUsername`, `kbqUsernameCustom`, `kbqFormatUsername`, `kbqFormatUsernameCustom`, `kbqInjectUsernameFormatter()` and `KBQ_PROFILE_MAPPING` share the format rules and the mapping with the component, and the docs page presents them together. A separate `username-format` capability was considered and rejected: a change to the format rules would then need two deltas that must agree.
2. **The two format syntaxes get separate requirements.** The dot syntax of `fullNameFormat` and `kbqUsername` and the case syntax of `kbqUsernameCustom` differ in how they abbreviate, in what they do with other characters and with missing fields, and in whether they warn. Rules shared by both (initials by code point, profiles that are not records) are stated once for both.
3. **Layout is stated as outcomes.** The modes, truncation, styles and right-to-left behaviour are described as what the user sees (the login under the name, an ellipsis, a line of its own), because the Playwright baselines check exactly that. CSS properties are named only where a consumer depends on them: the `display` value that `inherit` takes from the parent.
4. **Tooltips are stated by their text only.** Each part's `kbq-title` content and the modes that attach it are contract; when the tooltip appears is the `title` component's behaviour.
5. **Quirks that ship are in the spec.** Examples:
    - outside compact mode a site without a login is not shown;
    - in compact mode the site is shown and the login is dropped;
    - the case syntax keeps the separators of a missing field (`Carter . .`);
    - `type="inherit"` replaces the layout of the mode;
    - the unmapped-key warning fires once per key for the whole application.

    Each fix belongs in a change of its own, with a `MODIFIED` delta.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/username` updates `openspec/specs/username/spec.md` with a delta, reviewed the same way as the API golden file.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand in the dev app, the e2e app or the docs site before archiving. A mismatch is corrected in the delta, not in the code.
- [A defect gets recorded as intended behaviour] → The `inherit` layout and the case-syntax separators are stated because they follow deterministically from the source, and are listed under Findings so that a later change can decide. Behaviour whose outcome is uncertain stays out of the spec.
- [Layout requirements need the Docker run] → The screenshot baselines are the only test of modes, truncation, styles and right-to-left text; a native Playwright run fails on font rasterization, so tasks.md uses `e2e:docker`.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The JSDoc of `KbqUsernameStyle` says `accented` has "no color theming" and emphasizes "via typography only". The theme sets both parts to the contrast color, so the login loses its secondary color as well.
2. The JSDoc of `kbqBuildUsernameText` says it mirrors the text rendered by `kbq-username`. It keeps a site without a login (`Root M. A. (corp)`), which the component drops outside compact mode, and it keeps the login, which compact mode drops.
3. The overview pages say that `isCompact` shows the name or the login, never both, but not that the site is still appended. With a name, compact mode shows the site of a login it has dropped (`Root M. A. (corp)`), and the tooltip has no login either.
4. The pages describe `kbqUsernameCustom` as copying unmapped characters verbatim but do not say that the separators of a missing field stay, unlike `kbqUsername`, which skips a missing field cleanly.
5. The `username-custom` example provides a `KBQ_PROFILE_MAPPING` identical to the shipped default, so it shows nothing about formatting "a profile of your own shape", which the page says the token is for.
6. These have no place on the pages:
    - the layout of the three modes and the four styles;
    - the tooltips of the parts;
    - the site label for assistive technology and `kbqUsernameLocaleConfigurationProvider()`;
    - the mapping argument of the pipes, `kbqFormatUsername` and `kbqFormatUsernameCustom`;
    - `kbqBuildUsernameText` and its options, which the search and filter-bar examples use without explanation.

**Suspected defects (from reading the code, not reproduced)**

1. `type="inherit"` sets `display: inherit` in a rule with the same specificity as, and placed after, the `stacked` and `text` rules. A `stacked` username with `inherit` takes the parent's `display` and stops stacking. Only `inline` excludes `inherit` explicitly. Outside a flex parent the parts are then inline boxes, so the ellipsis never applies while `kbq-title` is still attached. The e2e table renders `inherit` only with `inline`.
2. Binding `null` to `fullNameFormat`, or `null` as the format of either pipe or of the injected formatter, throws a `TypeError` from `split` or `replaceAll` instead of falling back to the default. The component also throws for `undefined`, which is possible without strict template checks. `undefined` for `mode` or `type` produces the class `kbq-username_undefined` and no layout.
3. The visually hidden site label and the `(corp)` hint seem to have no whitespace between them, so the text content reads "mroot site(corp)", and the label is part of the host's `textContent` for any consumer reading it.
4. The unmapped-key warning names `KbqUsernameCustomPipe` even when it comes from `kbqFormatUsernameCustom` called directly. It is reported once per key for the whole application, so a second wrong mapping elsewhere goes unreported.
5. An element with the `kbq-username-custom-view` attribute, projected without importing `KbqUsernameCustomView`, is still projected by the content selector. The default view is then not suppressed, and both render without any error.

**Tests whose name and body disagree, or that cannot fail**

- "should use default input values" binds every input explicitly, with values equal to the defaults, so it cannot detect a changed default of `mode` or `type`.
- "should format full name using default format and an explicit mapping" (both pipes) passes a mapping that resolves the same fields as the injected default, so it would pass if the mapping argument were ignored.
- "should return empty string if profile is not an object" (both pipes) passes an array, which is an object. The primitive branch has no test.
- "should use custom view instead default if provided" checks only that no primary part exists, not that the custom view is shown.
- "should attach the directive in the modes that truncate" checks only `inline`, not `stacked` or compact mode.
- "should warn once about a format key with no mapped field" depends on module-level state: it passes only because no earlier test in the file warns about `L`.
- "should no longer be resolvable as a root service" covers `KbqUsernamePipe` only.

**Behaviour without a test.** The spec states these from the source:

- rendering nothing without `userInfo` (only `{}` is tested);
- the site not shown without a login outside compact mode;
- the host classes for values of `mode` and `type` other than the defaults (the screenshots show their effect, not the classes);
- `isCompact` as a bare attribute;
- the tooltip text of the login part and of compact mode;
- the attribute form of the custom view, content outside it not being rendered, and the layout of the mode applying to it;
- the separators of a missing field in the case syntax;
- the effect of the mapping argument of the pipes;
- `kbqInjectUsernameFormatter()` outside an injection context;
- `KbqUsernameCustomPipe` not being injectable;
- no warning in production mode;
- `formatLogin` or `formatSite` returning an empty string;
- `siteLabel` following the locale service and an enclosing `kbqLocaleOverrides`;
- the `display` value that `inherit` takes from the parent;
- the exported constants, which only the API golden file guards.

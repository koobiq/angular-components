# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are `packages/components/flag/` (the component and its types, the module, `flag.scss` and `flag-tokens.scss` where they decide the size, the crop and the decorations, the unit spec, `e2e.ts` and the Playwright spec with its two screenshot baselines), the shared corner-shape mixins in `packages/components/core/styles/common/`, the `flag.{en,ru}.mdx` pages, the nine docs examples under `packages/docs-examples/components/flag/`, the dev app `packages/components-dev/flag/` and the API golden file `tools/public_api_guard/components/flag.api.md`. The docs structure sets `hasExamples: false` for the flag, so there is no examples tab and no `examples.flag.*.mdx`. Every claim in the spec was checked against the source. The general approach follows the archived `document-select-baseline` change.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the component, and every scenario can be checked by an existing test, by hand in the dev app, or by a throwaway test case.
- One place to diff against when flag behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: the computed signals behind the ARIA attributes, the structure of the stylesheet, the design token values other than the two custom properties a consumer sets.
- The `country-flag-icons` package and the way the docs examples look flags up in it.
- Changes to tests, docs or examples.

## Decisions

1. **The general decisions of the select baseline apply unchanged**: one capability at the flat path `flag`, written in English, describing what ships with its quirks, containing only behaviour confirmed by a test or read in the source, with public names, selectors, host classes and ARIA attributes counted as contract.
2. **Geometry is contract, color is not.** The flag has almost no behaviour outside CSS: what a consumer relies on is the size it takes in a line of text, the proportions of its box and the way the flag is cropped to that box. These go into the spec, backed by the e2e screenshot. The colors of the shadow and of the placeholder, and the exact scaling of the smoothed corners, stay out: they belong to the design tokens.
3. **Two custom properties count as public API.** `--kbq-flag-aspect-ratio` and `--kbq-flag-border-radius` are named in the docs, in the JSDoc of `aspectRatio` and in the stylized example, and the e2e scenario overrides both from a plain class rule. The other two tokens (`--kbq-flag-shadow-color`, `--kbq-flag-empty-background`) are not documented and are left out.
4. **Angular's sanitizer is stated as behaviour of the `svg` input.** It is Angular's, not the component's, but the docs and the JSDoc make the bypass a condition of using the input, so a consumer relies on the stripping as much as on the slot.
5. **The `aria-hidden` fail-safe is stated as it ships.** A flag without `label` is hidden even when it is not `decorative`, and it hides a name carried by the projected image. The docs present this as deliberate, so it is a requirement, not a finding.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/flag` updates `openspec/specs/flag/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [The geometry requirements rest on a single screenshot] → The e2e scenario packs every shape, ratio and decoration into one image, so a failure shows that something changed but not which requirement. tasks.md checks the sizes by hand in the dev app as well.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them in the dev app or with a throwaway test case before archiving. A mismatch is corrected in the delta, not in the code.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. Neither docs page names the `empty` input. The fallback section asks for "a neutral placeholder" and shows it only through the `flag-fallback` example; a reader of the page alone does not learn that the component draws one.
2. The JSDoc of `empty` says it "renders a neutral placeholder", and the comment in `flag.scss` says the fill is for "when no flag is projected". The class is applied whatever the flag contains: projected content and the `svg` markup still render over the fill. The example avoids this by binding `[empty]` to the absence of a flag.
3. The comment on the size in `flag.scss` says the width is "1.5 × line height" and that the flag can be resized "via font-size / width / height". The height is `1em`, the font size, not the line height. Because the height is fixed, setting only `width` does not keep the proportions: the box becomes that width by `1em` and the flag is cropped to it (from reading the CSS, not reproduced). The docs page does not describe the default size at all.
4. The `flag-aspect-ratio` example is titled "Flags in a select" and shows 3:2 flags in select options. It sits under the paragraph about cropping to any ratio in the Rectangle section and demonstrates neither a custom ratio nor a crop.
5. The docs prose writes ratios as "4:3", while `aspectRatio` needs a CSS `aspect-ratio` value such as `4 / 3`. Nothing warns that the colon form is not valid CSS (see suspected defect 3).

**Suspected defects (from reading the code, not reproduced)**

1. A `label` made only of spaces is truthy, so the host gets `role="img"` with a blank `aria-label`: an image without an accessible name, which axe reports as `role-img-alt`. The empty string is handled; whitespace is not trimmed.
2. The host bindings for `role`, `aria-label` and `aria-hidden` remove those attributes whenever their computed value is `null`, so a consumer's own static `role` or `aria-label` on `<kbq-flag>` is dropped. A flag named with `aria-labelledby` instead of `label` is also hidden by `aria-hidden="true"`, so `label` is the only way to name a flag.
3. An `aspectRatio` (or a class rule for `--kbq-flag-aspect-ratio`) that is not a valid `aspect-ratio` value, such as `4:3`, makes `aspect-ratio` invalid at computed-value time. The box then has no ratio, and a flag passed through `svg`, whose SVG is absolutely positioned, would collapse to zero width.
4. The crop rules match every descendant `img` and `svg` of the flag, not only its direct carrier. A flag whose markup nests an `<svg>` inside its root `<svg>`, or an `<img>` projected inside a wrapper that does not fill the box (a `<picture>`, an inline `<span>`), would be positioned or sized against the wrong box.

**Tests whose name and body disagree, or that cannot fail**

- "should pass axe in each of the three documented shapes" renders the three accessibility forms (labelled, decorative, neither), not the three shapes. No axe test renders a square or circle flag.
- "should leave the aspect ratio to the stylesheet when the input is unset" only asserts that there is no inline declaration. The stylesheet part — the 1:1 of the square modifier its comment mentions — is not asserted; only the e2e screenshot covers it.

**Behaviour without a test.** The spec states these from the source:

- the `kbqFlag` template reference name;
- a projected inline `<svg>` written in the template (the tests project only `<img>`);
- the `kbq-flag__svg` element coming after the projected content (the tests check only that both are present);
- no `kbq-flag__svg` element for an empty string, or after `svg` is cleared;
- a plain string passed to `svg` being stripped by the sanitizer;
- setting `height` on the flag keeping its proportions;
- `--kbq-flag-aspect-ratio` from a class rule on a square or circle flag (the e2e scenario overrides it on a rectangle);
- `empty` keeping the projected content and the `svg` markup;
- the value `"false"` of `decorative` and `empty`;
- a name from the projected image (`alt`, `<title>`) being hidden with the flag;
- the flag not being focusable.

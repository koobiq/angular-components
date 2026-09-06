/**
 * Data for the `flag-inner-html` migration.
 *
 * `KbqFlag` renders `<ng-content />`, so the host element is where projected nodes land. A parent
 * binding `[innerHTML]` on `<kbq-flag>` writes that same element, and the two only coexisted because
 * the component's own view contributed no DOM. The review gave the string form a slot of its own —
 * the `svg` input — and the template now creates a node inside the host, so a host-level
 * `[innerHTML]` write removes it along with anything projected.
 *
 * The rename is mechanical, so this migration rewrites it. Everything else in the review is a
 * behavior change with no call site to point at, and is reported once per project.
 */

/** Import specifier that marks a file as a flag consumer. */
export const FLAG_PACKAGE = '@koobiq/components/flag';

/** Identifier and element shapes that mark a consumer without an import. */
export const FLAG_TYPE = '\\bKbqFlag\\w*\\b|\\bkbq-flag\\b';

/** Opening `<kbq-flag …>` tag, including the self-closing form. Closing tags do not match. */
export const FLAG_OPEN_TAG = /<kbq-flag\b[\s\S]*?>/g;

/** The binding this migration moves off the host element. */
export const INNER_HTML_BINDING = /\[innerHTML\]\s*=/g;

export const REWRITE_MESSAGE =
    '[innerHTML] on <kbq-flag> was rewritten to [svg]. The host element is where projected content ' +
    'lands, so an innerHTML write replaces it; the svg input renders into a slot of its own. Pass it ' +
    'the same SafeHtml — Angular still strips an <svg> that has not been bypassed.';

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  A flag with no `label` is now aria-hidden. The unlabelled, non-decorative flag reached the ' +
        'accessibility tree as a nameless graphic, which the guide already called out as the one case ' +
        'that must not happen. Give a meaningful flag a `label` — including one whose only name came ' +
        'from the projected image (`alt`, an SVG `<title>`), which the default now hides.',
    '  An inline <svg> is cropped instead of letterboxed. `object-fit: cover` is inert on an inline ' +
        '<svg> — it is not a replaced element — so a source whose ratio differed from the shape used to ' +
        'render with transparent bands; `square` and `circle` are the visible cases. The same flag ' +
        'passed as an <img> always cropped, and the two now match.',
    '  --kbq-flag-empty-background resolves to an opaque neutral instead of the translucent disabled ' +
        'state, so the `empty` placeholder no longer takes on the hue of the surface behind it.',
    '  The flag tokens are declared at zero specificity. An override that used to lose to .kbq-flag ' +
        'on source order now wins, so a redundant `!important` or an extra selector can be dropped.'
];

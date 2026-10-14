import { TAG_BODY } from '../../utils/tag-patterns';

/**
 * Data for the `icon-semantics-and-api` migration.
 *
 * The icon review gave the three components the semantics they never had and closed the members that
 * only documented an internal decision:
 *
 * - `<i kbq-icon>` renders `aria-hidden="true"` by default. A meaningful icon opts out with
 *   `aria-hidden="false"` and then supplies its own `role="img"` and `aria-label`.
 * - `kbq-icon-button` on anything but a native `<button>` gets `role="button"` and `aria-disabled`, and
 *   warns in dev mode when it has no accessible name. It does not activate itself from the keyboard.
 * - `KbqIcon.small` is removed — it was published but read by nothing.
 * - `KbqIcon.name`, the string that stood in for an `instanceof`, is replaced by the protected
 *   `appliesMaxHeight` flag.
 * - `KbqIconButton.tabindex` is `number | null` instead of `any`, and `iconName` is `string | undefined`.
 *
 * Warn-only. Whether an icon is decorative and what an icon button should be called are both decisions
 * the schematic cannot make. `small` on an icon button is `v21-upgrade`'s: it rewrites it to `size`.
 */

/** Import specifier that marks a file as an icon consumer. */
export const ICON_PACKAGE = '@koobiq/components/icon';

/** Identifier and attribute shapes that mark a consumer without an import. */
export const ICON_TYPE = String.raw`\bKbqIcon\w*\b|\bkbq-icon(?:-button|-item)?\b`;

export interface WarnPattern {
    /** Owner of the change. The pattern is only evaluated for files that also name it. */
    anchor: string;
    /** The call sites the change reaches. */
    pattern: string;
    message: string;
}

const ICON_OR_ITEM_ATTRIBUTE = String.raw`[\s\[]kbq-icon(?:-item)?(?![\w-])`;

const ICON_BUTTON_ATTRIBUTE = String.raw`[\s\[]kbq-icon-button(?![\w-])`;

/** An opening tag that carries `attribute`, read up to the point the rest of the pattern continues from. */
const tagWith = (attribute: string): string => String.raw`<[a-zA-Z][\w-]*(?=${TAG_BODY}*${attribute})${TAG_BODY}*`;

export const warnPatterns: WarnPattern[] = [
    {
        // A plain icon or an icon item only: `small` on an icon button is rewritten by `v21-upgrade`.
        anchor: ICON_OR_ITEM_ATTRIBUTE,
        pattern: String.raw`${tagWith(ICON_OR_ITEM_ATTRIBUTE)}[\s\[]small[\]\s=/>]`,
        message:
            'KbqIcon.small was removed, and with it the input KbqIconItem inherited. It was published but read ' +
            'by nothing — not by the host block, not by icon.scss, not by _icon-theme.scss — so dropping the ' +
            'binding from a [kbq-icon] or a [kbq-icon-item] changes nothing.'
    },
    {
        // A host the browser does not activate from the keyboard on its own: not a <button>, an <input> or an <a>.
        anchor: ICON_BUTTON_ATTRIBUTE,
        pattern:
            String.raw`<(?!(?:button|input|a)(?![\w-]))[a-zA-Z][\w-]*(?=${TAG_BODY}*${ICON_BUTTON_ATTRIBUTE})` +
            String.raw`(?=${TAG_BODY}*\s\(click\))(?!${TAG_BODY}*\s\(keydown)`,
        message:
            'kbq-icon-button on a host that is not a native <button> is announced as a button now — ' +
            'role="button" and aria-disabled — but it does not activate itself from Enter or Space, and this ' +
            'one handles (click) only. Bind (keydown.enter) and (keydown.space) to the same handler, calling ' +
            'preventDefault() on Space so the page does not scroll, or put the icon button on a <button>.'
    },
    {
        anchor: ICON_BUTTON_ATTRIBUTE,
        pattern: String.raw`${tagWith(ICON_BUTTON_ATTRIBUTE)}[\s\[]tabindex[\]\s=/>]`,
        message:
            'KbqIconButton.tabindex is number | null instead of any. A template binding still takes a number ' +
            'or a numeric string, but a value that does not parse as a number renders no tabindex instead of ' +
            'tabindex="NaN".'
    },
    {
        anchor: String.raw`\bKbqIconButton\b`,
        pattern: String.raw`\.tabindex\s*=(?!=)`,
        message:
            'KbqIconButton.tabindex is number | null instead of any: code that writes anything else to it no ' +
            'longer type-checks.'
    },
    {
        anchor: String.raw`\bKbqIcon\w*\b`,
        // Only the `override` form. `.name` is far too common a property — `file.name`, `error.name`,
        // `control.name` — and the anchor is any KbqIcon identifier in the file, so matching a bare
        // member access reported the marker for code that never had anything to do with it.
        pattern: String.raw`\boverride\s+name\s*(?:=(?!=)|[:;])`,
        message:
            'KbqIcon.name — the protected string that stood in for an instanceof and decided whether the ' +
            'inline max-height is written — is replaced by the protected `appliesMaxHeight` boolean, which ' +
            'a subclass overrides. Nothing outside the hierarchy could read it.'
    }
];

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  <i kbq-icon> and <i kbq-icon-item> are aria-hidden="true" by default. That is right where the icon ' +
        'repeats a label that is already there; an icon that carries meaning on its own needs ' +
        'aria-hidden="false" plus role="img" and an aria-label. kbq-icon-button is not hidden by default.',
    '  kbq-icon-button warns in dev mode when it has neither aria-label nor aria-labelledby: it renders ' +
        'a glyph and has no accessible name at all without one (AXE button-name). On a host that is not a ' +
        'native <button> it adds role="button" and aria-disabled, and leaves Enter and Space to the consumer.',
    '  The --kbq-icon-*-color tokens are no longer declared on .kbq-icon. They are consumed with their ' +
        'design token as the var() fallback instead, so a container can finally re-theme the icons inside ' +
        'it — a declaration on .kbq-icon sat on the element the value is used on and beat everything ' +
        'inherited. Reading one back with getComputedStyle now returns an empty string.',
    '  The SVG resolution no longer dies on the first name that does not resolve, which the default ' +
        'font-icon setup guarantees. A stale <svg> is removed on the fallback path and the inline ' +
        'max-height is cleared as well as set, so an element whose [kbq-icon] changes renders the icon it ' +
        'was asked for.',
    '  KbqIconRegistry looks sprite symbols up by id rather than through a "#" + name selector that a ' +
        'name starting with a digit made invalid.'
];

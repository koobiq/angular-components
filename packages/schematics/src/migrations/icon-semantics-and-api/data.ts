/**
 * Data for the `icon-semantics-and-api` migration.
 *
 * The icon review gave the three components the semantics they never had and closed the members that
 * only documented an internal decision:
 *
 * - `<i kbq-icon>` renders `aria-hidden="true"` by default. A meaningful icon opts out with
 *   `aria-hidden="false"` and then supplies its own `role="img"` and `aria-label`.
 * - `kbq-icon-button` on anything but a native `<button>` gets `role="button"`, `aria-disabled` and
 *   Enter/Space activation, and warns in dev mode when it has no accessible name.
 * - `KbqIconButton` and `KbqIconItem` provide the `KbqIcon` DI token, so a `contentChild(KbqIcon)` in
 *   consumer code starts resolving them.
 * - `KbqIcon.small` is removed — it was published but read by nothing.
 * - `KbqIcon.name`, the string that stood in for an `instanceof`, is replaced by the protected
 *   `appliesMaxHeight` flag.
 * - `KbqIconButton.tabindex` is `number | null` instead of `any`, and `iconName` is `string | undefined`.
 *
 * Warn-only. Whether an icon is decorative, what an icon button should be called and whether a widened
 * content query still wants every match are all decisions the schematic cannot make.
 */

/** Import specifier that marks a file as an icon consumer. */
export const ICON_PACKAGE = '@koobiq/components/icon';

/** Identifier and attribute shapes that mark a consumer without an import. */
export const ICON_TYPE = '\\bKbqIcon\\w*\\b|\\bkbq-icon(?:-button|-item)?\\b';

export interface WarnPattern {
    /** Owner of the change. The pattern is only evaluated for files that also name it. */
    anchor: string;
    /** The call sites the change reaches. */
    pattern: string;
    message: string;
}

export const warnPatterns: WarnPattern[] = [
    {
        // `\b` alone would also match inside `kbq-icon-button`, where `small` is still a valid input.
        anchor: '\\bkbq-icon(?![\\w-])',
        pattern: '\\[?small\\]?\\s*=',
        message:
            'KbqIcon.small was removed. It was published but read by nothing — not by the host block, not ' +
            'by icon.scss, not by _icon-theme.scss — so dropping the binding from a plain [kbq-icon] ' +
            'changes nothing. KbqIconButton.small still exists and is still deprecated in favour of ' +
            '[size]="\'compact\'".'
    },
    {
        anchor: ICON_TYPE,
        pattern:
            '(?:contentChild(?:ren)?|ContentChild(?:ren)?)\\s*(?:<[^>]*>)?\\s*\\(\\s*(?:forwardRef\\(\\s*\\(\\s*\\)\\s*=>\\s*)?KbqIcon\\b',
        message:
            'KbqIconButton and KbqIconItem provide the KbqIcon token now, so this query starts resolving ' +
            'them. Host metadata is inherited and the DI token was not, which is why the query used to ' +
            'walk past an icon button that carries the .kbq-icon class. Narrow the query if it only ever ' +
            'wanted a bare icon.'
    },
    {
        anchor: '\\bkbq-icon-button\\b',
        pattern: '\\(keydown',
        message:
            'kbq-icon-button activates itself from Enter and Space on a host that is not a native <button>. ' +
            'It stands down when the event is already defaultPrevented, so a handler on the same element ' +
            'that calls preventDefault() keeps sole ownership of the key; one that does not will see its ' +
            'own handling and a synthesized click.'
    },
    {
        anchor: '\\bkbq-icon-button\\b',
        pattern: '\\[?tabindex\\]?\\s*=',
        message:
            'KbqIconButton.tabindex is number | null instead of any. A numeric string still works — the ' +
            'input transforms it — but a binding assigning anything else no longer type-checks.'
    },
    {
        anchor: '\\bKbqIcon\\w*\\b',
        pattern: '(?:\\.\\s*|\\boverride\\s+)name\\s*(?:=(?!=)|[;:),\\]}])',
        message:
            'KbqIcon.name — the protected string that stood in for an instanceof and decided whether the ' +
            'inline max-height is written — is replaced by the protected `appliesMaxHeight` boolean, which ' +
            'a subclass overrides. Nothing outside the hierarchy could read it.'
    }
];

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  <i kbq-icon> is aria-hidden="true" by default. That is right where the icon repeats a label that ' +
        'is already there; an icon that carries meaning on its own needs aria-hidden="false" plus ' +
        'role="img" and an aria-label. kbq-icon-button is never hidden.',
    '  kbq-icon-button warns in dev mode when it has neither aria-label nor aria-labelledby: it renders ' +
        'a glyph and has no accessible name at all without one (AXE button-name).',
    '  The --kbq-icon-*-color tokens are no longer declared on .kbq-icon. They are consumed with their ' +
        'design token as the var() fallback instead, so a container can finally re-theme the icons inside ' +
        'it — a declaration on .kbq-icon sat on the element the value is used on and beat everything ' +
        'inherited. Reading one back with getComputedStyle now returns an empty string.',
    '  The SVG resolution stream no longer dies on the first name that does not resolve, which the ' +
        'default font-icon setup guarantees. A stale <svg> is removed on the fallback path and the inline ' +
        'max-height is cleared as well as set, so an element whose [kbq-icon] changes renders the icon it ' +
        'was asked for.',
    '  KbqIconRegistry reports a missing HttpClient through an error notification instead of throwing at ' +
        'the call site, and looks sprite symbols up by id rather than through a "#" + name selector that ' +
        'a name starting with a digit made invalid.'
];

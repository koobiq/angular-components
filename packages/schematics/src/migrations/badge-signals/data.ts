/**
 * Data for the `badge-signals` migration.
 *
 * `KbqBadge` moved its remaining accessor input to a signal and closed the internals of the
 * `KbqBadgeCssStyler` directive that sits on the same host.
 *
 * - `badge.compact`    → `badge.compact()`  (value unchanged — auto-fixed)
 * - `badge.outline`    → `badge.outline()`  (value unchanged — auto-fixed)
 * - `badge.badgeColor` → read-only signal; it now reports the raw color, not `kbq-badge_<color>` (warn)
 * - `badge.iconItem`   → `protected` (warn)
 * - `KbqBadgeCssStyler.icons` / `isIconButton` / `nativeElement` / `updateClassModifierForIcons` → `private` (warn)
 *
 * Template *bindings* (`[compact]`, `[outline]`, `[badgeColor]`) keep working — only programmatic reads and
 * template-reference reads break. `compact` and `outline` also gained `booleanAttribute`, which is a behavior
 * change with no call site to point at: it is reported once per project.
 */

/** Members of `KbqBadge` whose value is unchanged; a read must become a call. Auto-fixed. */
export const SIGNAL_MEMBERS: readonly string[] = ['compact', 'outline'];

/**
 * Signal members that are writable via `.set(...)`. Every `KbqBadge` signal is `input()` (read-only), so this
 * is empty — a programmatic write is left untouched and becomes a compile error the consumer fixes by hand.
 */
export const WRITABLE_MEMBERS: ReadonlySet<string> = new Set<string>();

/** TypeScript type annotation that marks a receiver as a badge. */
export const BADGE_TYPE = 'KbqBadge';

/** TypeScript type annotation that marks a receiver as the badge's CSS styler directive. */
export const STYLER_TYPE = 'KbqBadgeCssStyler';

/** Element selector whose template reference variables (`#ref`) point at a badge. */
export const BADGE_ELEMENT = 'kbq-badge';

/** Import specifier that marks a file as a badge consumer. */
export const BADGE_PACKAGE = '@koobiq/components/badge';

/**
 * `badgeColor` became a read-only `InputSignal` AND changed its value: the getter used to return the CSS class
 * `kbq-badge_<color>`, it now reports the raw color (e.g. `error`). A mechanical `()` append would compile and
 * silently hand back a different string, so this is warned on rather than auto-fixed.
 */
export const VALUE_CHANGED_MEMBERS: readonly string[] = ['badgeColor'];

/** `KbqBadge` members that moved from `public` to `protected`. */
export const PROTECTED_MEMBERS: readonly string[] = ['iconItem'];

/** `KbqBadgeCssStyler` members that moved from `public` to `private`. */
export const STYLER_PRIVATE_MEMBERS: readonly string[] = [
    'icons',
    'isIconButton',
    'nativeElement',
    'updateClassModifierForIcons'
];

export interface WarnPattern {
    /** Owner of the member. The pattern is only evaluated for files that also name it. */
    anchor: string;
    pattern: string;
    message: string;
}

/**
 * File-scoped patterns that can't be auto-fixed reliably — surfaced with file locations (in both `fix` and
 * dry-run mode). Only evaluated for files that reference the badge, so the patterns stay scoped.
 */
export const warnPatterns: WarnPattern[] = [
    {
        anchor: '\\bKbqBadge\\b',
        pattern: '(?:viewChild|ViewChild|contentChild|ContentChild)[^\\n;]*\\bKbqBadge\\b',
        message:
            'A KbqBadge view/content query returns the component instance, whose `compact`/`outline` are now ' +
            'signals — reading them is a double call, e.g. `this.badge().compact()`. Verify query reads manually.'
    },
    {
        anchor: '\\bKbqBadgeCssStyler\\b',
        pattern: '\\bKbqBadgeCssStyler\\b',
        message:
            'KbqBadgeCssStyler is an implementation detail of <kbq-badge> and no longer exposes any member: ' +
            `${STYLER_PRIVATE_MEMBERS.join(', ')} are private. ` +
            'It is still exported and still declared by KbqBadgeModule, so a module import keeps working — but ' +
            'code that read those members has to stop. The icon spacing classes it applies are the contract.'
    }
];

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  `compact` and `outline` are `booleanAttribute` inputs now. A valueless attribute finally means true: ' +
        '<kbq-badge compact> used to pass the empty string, which is falsy, so the badge rendered at its ' +
        'default size. Markup that carried the attribute expecting nothing to happen now renders compact, and ' +
        '[compact]="\'false\'" — a non-empty string, previously truthy — now means false.',
    '  `badgeColor` reports the raw color instead of the `kbq-badge_<color>` class. The class is still on the ' +
        'host element, so styles and screenshots are unaffected; only a programmatic read sees the change.'
];

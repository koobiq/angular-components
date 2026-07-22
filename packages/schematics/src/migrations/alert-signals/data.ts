/**
 * Data for the `alert-signals` migration.
 *
 * `KbqAlert` finished its migration to a signal-based public API. Two members are safe, value-preserving
 * property → signal reads (only the call syntax changed) and are auto-fixed. `alertColor` also changed its
 * *value* semantics and became read-only, and the content-query members became `protected` — those cannot be
 * rewritten safely and are surfaced as warnings.
 *
 * - `alert.compact`     → `alert.compact()`      (value unchanged — auto-fixed)
 * - `alert.alertStyle`  → `alert.alertStyle()`   (value unchanged — auto-fixed)
 * - `alert.alertColor`  → read-only signal; getter now returns the raw color, not `kbq-alert_<color>` (warn)
 * - `alert.icon` / `iconItem` / `button` / `title` / `control` / `closeButton` / `isColored` → `protected` (warn)
 *
 * Template *bindings* (`[compact]`, `[alertStyle]`, `[alertColor]`) keep working — only programmatic reads and
 * template-reference reads break.
 */

/** Members of `KbqAlert` whose value is unchanged; a read must become a call. Auto-fixed. */
export const SIGNAL_MEMBERS: readonly string[] = ['compact', 'alertStyle'];

/**
 * Signal members that are writable via `.set(...)`. `KbqAlert.compact`/`alertStyle` are `input()` (read-only),
 * so this is empty — a programmatic write is left untouched and covered by the warnings.
 */
export const WRITABLE_MEMBERS: ReadonlySet<string> = new Set<string>();

/** TypeScript type annotation that marks a receiver as an alert. */
export const ALERT_TYPE = 'KbqAlert';

/** Element selector whose template reference variables (`#ref`) point at an alert. */
export const ALERT_ELEMENT = 'kbq-alert';

/**
 * `alertColor` became a read-only `InputSignal` AND changed its value: the getter used to return the CSS class
 * `kbq-alert_<color>`, it now returns the raw color (e.g. `error`). Because a mechanical `()` append would
 * silently change the value, this is warned on rather than auto-fixed.
 */
export const VALUE_CHANGED_MEMBERS: readonly string[] = ['alertColor'];

/** Members that moved from `public` to `protected` and can no longer be read from outside the component. */
export const PROTECTED_MEMBERS: readonly string[] = [
    'icon',
    'iconItem',
    'button',
    'title',
    'control',
    'closeButton',
    'isColored'
];

export interface WarnPattern {
    pattern: string;
    message: string;
}

/**
 * File-scoped patterns that can't be auto-fixed reliably — surfaced with file locations (in both `fix` and
 * dry-run mode). Only evaluated for files that reference the alert, so the patterns stay scoped.
 */
export const warnPatterns: WarnPattern[] = [
    {
        pattern: '(?:viewChild|ViewChild|contentChild|ContentChild)[^\\n;]*\\bKbqAlert\\b',
        message:
            'A KbqAlert view/content query returns the component instance, whose `compact`/`alertStyle` are now ' +
            'signals — reading them is a double call, e.g. `this.alert().compact()`. Verify query reads manually.'
    },
    {
        pattern: '\\bKbqAlertModule\\b',
        message:
            'KbqAlertModule no longer re-exports A11yModule / PlatformModule. If you relied on them transitively ' +
            '(e.g. cdkTrapFocus), import @angular/cdk/a11y or @angular/cdk/platform directly. Prefer importing the ' +
            'standalone KbqAlert and its directives over the NgModule.'
    }
];

/**
 * Data for the `read-state-dwell-handlers` migration.
 *
 * `KbqReadStateDirective` no longer tracks the pointer only, so its handlers are named after what they
 * measure rather than after the event that used to call them. Both new names keep working with no
 * argument — the pointer channel is their default — so the rename is a safe, value-preserving rewrite.
 *
 * - `readState.mouseenterHandler()` → `readState.startDwell()`
 * - `readState.mouseleaveHandler()` → `readState.endDwell()`
 * - `readState.timestamp` → still there, but read-only and `number | undefined` (warn)
 */

/** TypeScript type annotation, and `inject()` argument, that marks a receiver as the directive. */
export const DIRECTIVE_TYPE = 'KbqReadStateDirective';

/** Renamed methods, old name → new name. Both are callable with no argument, as before. */
export const RENAMES: ReadonlyMap<string, string> = new Map([
    ['mouseenterHandler', 'startDwell'],
    ['mouseleaveHandler', 'endDwell']
]);

/** Members that changed shape rather than name, so they are reported instead of rewritten. */
export const WARN_MEMBERS: readonly string[] = ['timestamp'];

export interface WarnPattern {
    pattern: string;
    message: string;
}

/** Message emitted for a receiver-scoped read of one of {@link WARN_MEMBERS}. */
export const TIMESTAMP_MESSAGE =
    'KbqReadStateDirective.timestamp is a read-only getter now, and `number | undefined` rather than `number`: it ' +
    'reports the start of the earliest dwell still in progress and is `undefined` while the host is neither ' +
    'hovered nor focused. Writing to it is no longer possible — call startDwell()/endDwell() instead.';

/**
 * File-scoped patterns for the change no call site can point at. Only evaluated for files that name
 * the directive.
 */
export const warnPatterns: WarnPattern[] = [
    {
        pattern: 'hostDirectives[^\\]]*\\bKbqReadStateDirective\\b',
        message:
            'KbqReadStateDirective now measures a keyboard dwell (`focusin`/`focusout`) alongside the pointer one, ' +
            'and reports the host as read once both channels have left it. A host that keeps focus for longer than ' +
            '`timeToRead` is therefore marked read without a pointer ever touching it, and a pointer leaving no ' +
            'longer ends a dwell that focus is still holding open.'
    }
];

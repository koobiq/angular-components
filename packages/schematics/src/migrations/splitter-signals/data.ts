/**
 * Data for the `splitter-signals` migration.
 *
 * Every input on the splitter and its gutter was an accessor with coercion in the setter, which is why the
 * automated signal migration skipped all of them.
 *
 * - `hideGutters` / `direction` / `disabled` / `useGhost` / `gutterSize` on the splitter → calls (auto-fixed)
 * - `direction` / `order` / `size` / `isVertical` / `dragged` on the gutter → calls (auto-fixed)
 * - `isDragging` / `isVertical` → signals (auto-fixed)
 * - `resizing` → removed; it was dead, always `false` (warn)
 * - `elementRef` / `changeDetectorRef` / `areas` / `areaRefs` / `gutters` / `ghost` → closed (warn)
 *
 * `KbqGutterGhostDirective` kept its plain properties: the splitter drives them imperatively during a drag,
 * outside the Angular zone, and nothing ever bound them — they were `@Input()` in name only.
 */

/** Members whose value is unchanged; a read must become a call. Auto-fixed. */
export const SIGNAL_MEMBERS: readonly string[] = [
    'hideGutters',
    'direction',
    'disabled',
    'useGhost',
    'gutterSize',
    'isDragging',
    'isVertical',
    'order',
    'size',
    'dragged'
];

/**
 * Signal members that are writable via `.set(...)`. `dragged` on the gutter is the one writable signal;
 * everything else is an `input()` or a read-only `computed`.
 */
export const WRITABLE_MEMBERS: ReadonlySet<string> = new Set<string>(['dragged']);

/** Every type whose members this migration rewrites. */
export const RECEIVER_TYPES: readonly string[] = ['KbqSplitterComponent', 'KbqGutterDirective'];

/** Element selector whose template reference variables (`#ref`) point at a splitter. */
export const SPLITTER_ELEMENT = 'kbq-splitter';

/** Import specifier that marks a file as a splitter consumer. */
export const SPLITTER_PACKAGE = '@koobiq/components/splitter';

/** Members that left the public surface and can no longer be reached from outside. */
export const PROTECTED_MEMBERS: readonly string[] = [
    'resizing',
    'elementRef',
    'changeDetectorRef',
    'areas',
    'areaRefs',
    'gutters',
    'ghost'
];

/** Appended to the protected-members warning. */
export const PROTECTED_HINT =
    '`resizing` was dead — nothing ever set it, so it always reported false; read `isDragging()` instead. ' +
    'The rest is the layout bookkeeping: bind the inputs and listen to `gutterPositionChange` / `sizeChange`.';

export interface WarnPattern {
    /** Owner of the member. The pattern is only evaluated for files that also name it. */
    anchor: string;
    pattern: string;
    message: string;
}

const SPLITTER_ANCHOR = '\\bKbqSplitterComponent\\b';

export const warnPatterns: WarnPattern[] = [
    {
        anchor: '\\bKbqGutterGhostDirective\\b',
        pattern: '\\bKbqGutterGhostDirective\\b',
        message:
            'KbqGutterGhostDirective no longer declares inputs. Its `visible`, `x`, `y`, `direction` and `size` ' +
            'were `@Input()` in name only — the splitter renders <kbq-gutter-ghost> with no bindings and drives ' +
            'them imperatively during a drag. They are plain properties now, so a template binding on them ' +
            'stops compiling; there was never a supported way to place the ghost yourself.'
    },
    {
        anchor: SPLITTER_ANCHOR,
        pattern: '(?:viewChild|ViewChild|contentChild|ContentChild)[^\\n;]*\\bKbqSplitterComponent\\b',
        message:
            'A KbqSplitterComponent view/content query returns the component instance, whose inputs are now ' +
            'signals — reading one is a double call, e.g. `this.splitter().disabled()`. Verify query reads ' +
            'manually.'
    }
];

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  `hideGutters`, `disabled` and `useGhost` are `booleanAttribute` inputs, and `gutterSize` is a ' +
        'numeric one. A valueless attribute means true now, where `coerceBooleanProperty` treated the empty ' +
        'string as false.',
    '  A `gutterSize` that is not a positive number falls back to the default 6 instead of keeping whatever ' +
        'the previous value happened to be. The old setter read its own getter, so an invalid value silently ' +
        'preserved the last valid one.',
    '  The gutter lays itself out reactively instead of once in ngOnInit, so changing `direction` after init ' +
        'now re-applies the layout — and clears the dimension the other direction owns, which used to stay ' +
        'behind as a stale width or height.',
    '  A splitter area unsubscribes from `gutterPositionChange` when it is destroyed. An area removed from a ' +
        'long-lived splitter used to keep emitting `sizeChange` for every later drag.'
];

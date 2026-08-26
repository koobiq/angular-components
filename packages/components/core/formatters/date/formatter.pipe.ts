import { ChangeDetectorRef, effect, inject, Pipe, PipeTransform } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DurationUnit } from '@koobiq/date-adapter';
import { DateTimeOptions } from '@koobiq/date-formatter';
import { DateAdapter, KbqDateTimezoneService, KbqTimezoneLike } from '../../datetime';
import { KBQ_LOCALE_SERVICE } from '../../locales';
import { DateFormatter } from './formatter';

/**
 * Identity comparison with a one-level element-wise fallback for arrays, so an input rebuilt on every
 * change detection cycle — a `[from, to]` tuple returned from a getter or a `computed()`, a `units`
 * array built in a method — still hits the cache of the impure pipes below. Array literals written
 * directly in a template are already memoized by Angular (`ɵɵpureFunction`); this covers the rest.
 *
 * Compares array elements by reference, like the `a === b` fallback it wraps — it has no notion of two
 * dates being "equal". Mutating a date already passed to a pipe in place (`Date#setHours`, a Moment
 * instance updated without cloning, …) keeps the same reference, so a `[from, to]` tuple rebuilt around
 * that mutated instance still reads as unchanged and the cached, now-stale string is returned. Replace
 * pipe inputs instead of mutating them — the same requirement Angular's OnPush change detection already
 * places on any object bound to an OnPush view.
 */
const shallowEqual = (a: unknown, b: unknown): boolean => {
    if (a === b) return true;
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;

    return a.every((item, index) => item === b[index]);
};

/**
 * Deserializes a pipe input into a date, treating a missing value and an unparseable one alike as
 * "no date" — `DateAdapter.deserialize()` returns `null` for the former but a truthy *invalid* date
 * for the latter, so a plain truthiness check is not enough.
 */
const toValidDate = <D>(adapter: DateAdapter<D>, value: unknown): D | null => {
    const date = adapter.deserialize(value);

    return date != null && adapter.isValid(date) ? date : null;
};

/**
 * A `[from, to]` tuple with both bounds required; `null` when either is missing or invalid.
 *
 * Takes the tuple itself as possibly missing, not just its bounds: a pipe input that has not been
 * populated yet is `null`/`undefined` rather than `[null, null]`, and destructuring that throws.
 */
const toClosedRange = <D>(adapter: DateAdapter<D>, value: D[] | string[] | null | undefined): [D, D] | null => {
    const [from, to] = value ?? [];
    const startDate = toValidDate(adapter, from);
    const endDate = toValidDate(adapter, to);

    return startDate && endDate ? [startDate, endDate] : null;
};

/**
 * A `[from, to]` tuple where one bound may be open; `null` only when neither bound is a valid date.
 *
 * The range formatters switch to the opened-range template on their own when a bound is missing, but
 * throw when both are — and a throwing pipe aborts the rendering of the whole view.
 */
const toOpenedRange = <D>(
    adapter: DateAdapter<D>,
    value: D[] | string[] | null | undefined
): [D | null, D | null] | null => {
    const [from, to] = value ?? [];
    const startDate = toValidDate(adapter, from);
    const endDate = toValidDate(adapter, to);

    return startDate || endDate ? [startDate, endDate] : null;
};

/**
 * A `[from, to]` tuple the duration formatters accept: both bounds required and chronologically
 * ordered. `DateFormatter.duration*` throws on anything else.
 */
const toDurationRange = <D>(adapter: DateAdapter<D>, value: D[] | string[] | null | undefined): [D, D] | null => {
    const range = toClosedRange(adapter, value);

    return range && adapter.compareDateTime(range[0], range[1]) <= 0 ? range : null;
};

export class BaseFormatterPipe<D> {
    protected readonly adapter: DateAdapter<D> = inject(DateAdapter<D>);
    protected readonly formatter: DateFormatter<D> = inject(DateFormatter<D>);
}

/**
 * Base class for impure date-formatter pipes that recompute their result whenever the active locale
 * changes via `KbqLocaleService`, or the active time zone via `KbqDateTimezoneService`.
 *
 * The base class owns:
 * - a subscription to `KbqLocaleService.changes` and an `effect` on the active time zone, each of which
 *   invalidates the cache and marks the host for check (the same approach the built-in `AsyncPipe` uses);
 * - caching by `(value, args, localeId, timezone)`, so the impure `transform()` only does
 *   real work when an input, the active locale or the active time zone actually changed — see
 *   `shallowEqual` for how the comparison works and its limits.
 *
 * Subclasses implement `format()`, which receives the raw pipe input(s) — a
 * single value for absolute/relative pipes, or a `[from, to]` tuple for range
 * pipes — deserializes via `this.adapter` and calls the matching
 * `DateFormatter` method.
 *
 * @docs-private
 */
export abstract class BaseLocaleAwareFormatterPipe<
    D,
    Value = D | string | null | undefined,
    Args extends unknown[] = unknown[]
> extends BaseFormatterPipe<D> {
    private readonly changeDetectorRef = inject(ChangeDetectorRef);
    private readonly localeService = inject(KBQ_LOCALE_SERVICE, { optional: true });
    private readonly timezoneService = inject(KbqDateTimezoneService);

    private cachedValue: Value | null = null;
    private cachedArgs: Args = [] as unknown as Args;
    private cachedLocaleId: string | null = null;
    private cachedTimezone: KbqTimezoneLike | null = null;
    private cachedResult = '';
    private hasCache = false;

    constructor() {
        super();

        this.localeService?.changes.pipe(takeUntilDestroyed()).subscribe(() => {
            this.hasCache = false;
            this.changeDetectorRef.markForCheck();
        });

        // Only wakes an OnPush host up; the cache is invalidated by comparing the zone in `transform()`,
        // so the run this effect makes on creation costs nothing.
        effect(() => {
            this.timezoneService.timezone();

            this.changeDetectorRef.markForCheck();
        });
    }

    transform(value: Value, ...args: Args): string {
        const currentLocaleId = this.localeService?.id ?? null;
        const currentTimezone = this.timezoneService.timezone();

        if (
            this.hasCache &&
            shallowEqual(value, this.cachedValue) &&
            currentLocaleId === this.cachedLocaleId &&
            currentTimezone === this.cachedTimezone &&
            this.argsEqual(args)
        ) {
            return this.cachedResult;
        }

        this.cachedResult = this.format(value, ...args);
        this.cachedValue = value;
        this.cachedArgs = args;
        this.cachedLocaleId = currentLocaleId;
        this.cachedTimezone = currentTimezone;
        this.hasCache = true;

        return this.cachedResult;
    }

    protected abstract format(value: Value, ...args: Args): string;

    private argsEqual(args: Args): boolean {
        if (args.length !== this.cachedArgs.length) return false;

        for (let i = 0; i < args.length; i++) {
            if (!shallowEqual(args[i], this.cachedArgs[i])) return false;
        }

        return true;
    }
}

@Pipe({
    name: 'absoluteLongDate'
})
export class AbsoluteDateFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform(value: D | string | null | undefined, currYear?: boolean): string {
        const date = toValidDate(this.adapter, value);

        return date ? this.formatter.absoluteLongDate(date, currYear) : '';
    }
}

@Pipe({
    name: 'absoluteLongDateImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class AbsoluteDateFormatterImpurePipe<D> extends AbsoluteDateFormatterPipe<D> {
    transform(value: D | string | null | undefined, currYear?: boolean): string {
        return super.transform(value, currYear);
    }
}

@Pipe({
    name: 'absoluteLongDateTime'
})
export class AbsoluteDateTimeFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform(value: D | string | null | undefined, options?: DateTimeOptions): string {
        const date = toValidDate(this.adapter, value);

        return date ? this.formatter.absoluteLongDateTime(date, options) : '';
    }
}

@Pipe({
    name: 'absoluteLongDateTimeImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class AbsoluteDateTimeFormatterImpurePipe<D> extends AbsoluteDateTimeFormatterPipe<D> {
    transform(value: D | string | null | undefined, options?: DateTimeOptions): string {
        return super.transform(value, options);
    }
}

@Pipe({
    name: 'absoluteShortDate'
})
export class AbsoluteDateShortFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform(value: D | string | null | undefined, currYear?: boolean): string {
        const date = toValidDate(this.adapter, value);

        return date ? this.formatter.absoluteShortDate(date, currYear) : '';
    }
}

@Pipe({
    name: 'absoluteShortDateImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class AbsoluteDateShortFormatterImpurePipe<D> extends AbsoluteDateShortFormatterPipe<D> {
    transform(value: D | string | null | undefined, currYear?: boolean): string {
        return super.transform(value, currYear);
    }
}

@Pipe({
    name: 'absoluteShortDateTime'
})
export class AbsoluteShortDateTimeFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform(value: D | string | null | undefined, options?: DateTimeOptions): string {
        const date = toValidDate(this.adapter, value);

        return date ? this.formatter.absoluteShortDateTime(date, options) : '';
    }
}

@Pipe({
    name: 'absoluteShortDateTimeImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class AbsoluteShortDateTimeFormatterImpurePipe<D> extends AbsoluteShortDateTimeFormatterPipe<D> {
    transform(value: D | string | null | undefined, options?: DateTimeOptions): string {
        return super.transform(value, options);
    }
}

@Pipe({
    name: 'relativeLongDate'
})
export class RelativeDateFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform(value: D | string | null | undefined): string {
        const date = toValidDate(this.adapter, value);

        return date ? this.formatter.relativeLongDate(date) : '';
    }
}

@Pipe({
    name: 'relativeLongDateImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class RelativeDateFormatterImpurePipe<D> extends RelativeDateFormatterPipe<D> {
    transform(value: D | string | null | undefined): string {
        return super.transform(value);
    }
}

@Pipe({
    name: 'relativeLongDateTime'
})
export class RelativeDateTimeFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform(value: D | string | null | undefined, options?: DateTimeOptions): string {
        const date = toValidDate(this.adapter, value);

        return date ? this.formatter.relativeLongDateTime(date, options) : '';
    }
}

@Pipe({
    name: 'relativeLongDateTimeImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class RelativeDateTimeFormatterImpurePipe<D> extends RelativeDateTimeFormatterPipe<D> {
    transform(value: D | string | null | undefined, options?: DateTimeOptions): string {
        return super.transform(value, options);
    }
}

@Pipe({
    name: 'relativeShortDate'
})
export class RelativeShortDateFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform(value: D | string | null | undefined): string {
        const date = toValidDate(this.adapter, value);

        return date ? this.formatter.relativeShortDate(date) : '';
    }
}

@Pipe({
    name: 'relativeShortDateImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class RelativeShortDateFormatterImpurePipe<D> extends RelativeShortDateFormatterPipe<D> {
    transform(value: D | string | null | undefined): string {
        return super.transform(value);
    }
}

@Pipe({
    name: 'relativeShortDateTime'
})
export class RelativeShortDateTimeFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform(value: D | string | null | undefined, options?: DateTimeOptions): string {
        const date = toValidDate(this.adapter, value);

        return date ? this.formatter.relativeShortDateTime(date, options) : '';
    }
}

@Pipe({
    name: 'relativeShortDateTimeImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class RelativeShortDateTimeFormatterImpurePipe<D> extends RelativeShortDateTimeFormatterPipe<D> {
    transform(value: D | string | null | undefined, options?: DateTimeOptions): string {
        return super.transform(value, options);
    }
}

@Pipe({
    name: 'rangeLongDate'
})
export class RangeDateFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform(value: D[] | string[] | null | undefined): string {
        const range = toOpenedRange(this.adapter, value);

        if (!range) return '';

        return this.formatter.rangeLongDate(range[0], range[1]);
    }
}

@Pipe({
    name: 'rangeLongDateImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class RangeDateFormatterImpurePipe<D> extends RangeDateFormatterPipe<D> {
    transform(value: D[] | string[] | null | undefined): string {
        return super.transform(value);
    }
}

@Pipe({
    name: 'rangeShortDate'
})
export class RangeShortDateFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform(value: D[] | string[] | null | undefined): string {
        const range = toOpenedRange(this.adapter, value);

        if (!range) return '';

        return this.formatter.rangeShortDate(range[0], range[1] ?? undefined);
    }
}

@Pipe({
    name: 'rangeShortDateImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class RangeShortDateFormatterImpurePipe<D> extends RangeShortDateFormatterPipe<D> {
    transform(value: D[] | string[] | null | undefined): string {
        return super.transform(value);
    }
}

@Pipe({
    name: 'rangeLongDateTime'
})
export class RangeDateTimeFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform(value: D[] | string[] | null | undefined, options?: DateTimeOptions): string {
        const range = toOpenedRange(this.adapter, value);

        if (!range) return '';

        return this.formatter.rangeLongDateTime(range[0], range[1] ?? undefined, options);
    }
}

@Pipe({
    name: 'rangeLongDateTimeImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class RangeDateTimeFormatterImpurePipe<D> extends RangeDateTimeFormatterPipe<D> {
    transform(value: D[] | string[] | null | undefined, options?: DateTimeOptions): string {
        return super.transform(value, options);
    }
}

@Pipe({
    name: 'rangeMiddleDateTime'
})
export class RangeMiddleDateTimeFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform(value: D[] | string[] | null | undefined, options?: DateTimeOptions): string {
        // Unlike the other range formats, the middle one has no opened-range template — both bounds required.
        const range = toClosedRange(this.adapter, value);

        if (!range) return '';

        return this.formatter.rangeMiddleDateTime(range[0], range[1], options);
    }
}

@Pipe({
    name: 'rangeMiddleDateTimeImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class RangeMiddleDateTimeFormatterImpurePipe<D> extends RangeMiddleDateTimeFormatterPipe<D> {
    transform(value: D[] | string[] | null | undefined, options?: DateTimeOptions): string {
        return super.transform(value, options);
    }
}

@Pipe({
    name: 'rangeShortDateTime'
})
export class RangeShortDateTimeFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform(value: D[] | string[] | null | undefined, options?: DateTimeOptions): string {
        const range = toOpenedRange(this.adapter, value);

        if (!range) return '';

        return this.formatter.rangeShortDateTime(range[0], range[1], options);
    }
}

@Pipe({
    name: 'rangeShortDateTimeImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class RangeShortDateTimeFormatterImpurePipe<D> extends RangeShortDateTimeFormatterPipe<D> {
    transform(value: D[] | string[] | null | undefined, options?: DateTimeOptions): string {
        return super.transform(value, options);
    }
}

@Pipe({
    name: 'durationShortest'
})
export class DurationShortestFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform(value: D[] | string[] | null | undefined, options?: DateTimeOptions): string {
        const range = toDurationRange(this.adapter, value);

        if (!range) return '';

        return this.formatter.durationShortest(range[0], range[1], options?.seconds, options?.milliseconds);
    }
}

@Pipe({
    name: 'durationShortestImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class DurationShortestFormatterImpurePipe<D> extends DurationShortestFormatterPipe<D> {
    transform(value: D[] | string[] | null | undefined, options?: DateTimeOptions): string {
        return super.transform(value, options);
    }
}

@Pipe({
    name: 'durationLong'
})
export class DurationLongFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform(value: D[] | string[] | null | undefined, units?: DurationUnit[], fraction?: boolean): string {
        const range = toDurationRange(this.adapter, value);

        if (!range) return '';

        return this.formatter.durationLong(range[0], range[1], units, fraction);
    }
}

@Pipe({
    name: 'durationLongImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class DurationLongFormatterImpurePipe<D> extends DurationLongFormatterPipe<D> {
    transform(value: D[] | string[] | null | undefined, units?: DurationUnit[], fraction?: boolean): string {
        return super.transform(value, units, fraction);
    }
}

@Pipe({
    name: 'durationShort'
})
export class DurationShortFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform(value: D[] | string[] | null | undefined, units?: DurationUnit[], fraction?: boolean): string {
        const range = toDurationRange(this.adapter, value);

        if (!range) return '';

        return this.formatter.durationShort(range[0], range[1], units, fraction);
    }
}

@Pipe({
    name: 'durationShortImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class DurationShortFormatterImpurePipe<D> extends DurationShortFormatterPipe<D> {
    transform(value: D[] | string[] | null | undefined, units?: DurationUnit[], fraction?: boolean): string {
        return super.transform(value, units, fraction);
    }
}

// Impure pipes that recompute on `KbqLocaleService` locale changes and on `KbqDateTimezoneService` time
// zone changes (see `BaseLocaleAwareFormatterPipe`). Prefer these `kbq`-prefixed pipes when either can
// change at runtime; the pure pipes above are kept for static usages and backward compatibility.

@Pipe({
    name: 'kbqAbsoluteLongDate',
    pure: false
})
export class KbqAbsoluteLongDatePipe<D>
    extends BaseLocaleAwareFormatterPipe<D, D | string | null | undefined, [currYear?: boolean]>
    implements PipeTransform
{
    override transform(value: D | string | null | undefined, currYear?: boolean): string {
        return super.transform(value, currYear);
    }

    protected format(value: D | string | null | undefined, currYear?: boolean): string {
        const date = toValidDate(this.adapter, value);

        return date ? this.formatter.absoluteLongDate(date, currYear) : '';
    }
}

@Pipe({
    name: 'kbqAbsoluteShortDate',
    pure: false
})
export class KbqAbsoluteShortDatePipe<D>
    extends BaseLocaleAwareFormatterPipe<D, D | string | null | undefined, [currYear?: boolean]>
    implements PipeTransform
{
    override transform(value: D | string | null | undefined, currYear?: boolean): string {
        return super.transform(value, currYear);
    }

    protected format(value: D | string | null | undefined, currYear?: boolean): string {
        const date = toValidDate(this.adapter, value);

        return date ? this.formatter.absoluteShortDate(date, currYear) : '';
    }
}

@Pipe({
    name: 'kbqAbsoluteLongDateTime',
    pure: false
})
export class KbqAbsoluteLongDateTimePipe<D>
    extends BaseLocaleAwareFormatterPipe<D, D | string | null | undefined, [options?: DateTimeOptions]>
    implements PipeTransform
{
    override transform(value: D | string | null | undefined, options?: DateTimeOptions): string {
        return super.transform(value, options);
    }

    protected format(value: D | string | null | undefined, options?: DateTimeOptions): string {
        const date = toValidDate(this.adapter, value);

        return date ? this.formatter.absoluteLongDateTime(date, options) : '';
    }
}

@Pipe({
    name: 'kbqAbsoluteShortDateTime',
    pure: false
})
export class KbqAbsoluteShortDateTimePipe<D>
    extends BaseLocaleAwareFormatterPipe<D, D | string | null | undefined, [options?: DateTimeOptions]>
    implements PipeTransform
{
    override transform(value: D | string | null | undefined, options?: DateTimeOptions): string {
        return super.transform(value, options);
    }

    protected format(value: D | string | null | undefined, options?: DateTimeOptions): string {
        const date = toValidDate(this.adapter, value);

        return date ? this.formatter.absoluteShortDateTime(date, options) : '';
    }
}

@Pipe({
    name: 'kbqRelativeLongDate',
    pure: false
})
export class KbqRelativeLongDatePipe<D>
    extends BaseLocaleAwareFormatterPipe<D, D | string | null | undefined, []>
    implements PipeTransform
{
    override transform(value: D | string | null | undefined): string {
        return super.transform(value);
    }

    protected format(value: D | string | null | undefined): string {
        const date = toValidDate(this.adapter, value);

        return date ? this.formatter.relativeLongDate(date) : '';
    }
}

@Pipe({
    name: 'kbqRelativeShortDate',
    pure: false
})
export class KbqRelativeShortDatePipe<D>
    extends BaseLocaleAwareFormatterPipe<D, D | string | null | undefined, []>
    implements PipeTransform
{
    override transform(value: D | string | null | undefined): string {
        return super.transform(value);
    }

    protected format(value: D | string | null | undefined): string {
        const date = toValidDate(this.adapter, value);

        return date ? this.formatter.relativeShortDate(date) : '';
    }
}

@Pipe({
    name: 'kbqRelativeLongDateTime',
    pure: false
})
export class KbqRelativeLongDateTimePipe<D>
    extends BaseLocaleAwareFormatterPipe<D, D | string | null | undefined, [options?: DateTimeOptions]>
    implements PipeTransform
{
    override transform(value: D | string | null | undefined, options?: DateTimeOptions): string {
        return super.transform(value, options);
    }

    protected format(value: D | string | null | undefined, options?: DateTimeOptions): string {
        const date = toValidDate(this.adapter, value);

        return date ? this.formatter.relativeLongDateTime(date, options) : '';
    }
}

@Pipe({
    name: 'kbqRelativeShortDateTime',
    pure: false
})
export class KbqRelativeShortDateTimePipe<D>
    extends BaseLocaleAwareFormatterPipe<D, D | string | null | undefined, [options?: DateTimeOptions]>
    implements PipeTransform
{
    override transform(value: D | string | null | undefined, options?: DateTimeOptions): string {
        return super.transform(value, options);
    }

    protected format(value: D | string | null | undefined, options?: DateTimeOptions): string {
        const date = toValidDate(this.adapter, value);

        return date ? this.formatter.relativeShortDateTime(date, options) : '';
    }
}

@Pipe({
    name: 'kbqRangeLongDate',
    pure: false
})
export class KbqRangeLongDatePipe<D>
    extends BaseLocaleAwareFormatterPipe<D, D[] | string[] | null | undefined, []>
    implements PipeTransform
{
    override transform(value: D[] | string[] | null | undefined): string {
        return super.transform(value);
    }

    protected format(value: D[] | string[] | null | undefined): string {
        const range = toOpenedRange(this.adapter, value);

        if (!range) return '';

        return this.formatter.rangeLongDate(range[0], range[1]);
    }
}

@Pipe({
    name: 'kbqRangeShortDate',
    pure: false
})
export class KbqRangeShortDatePipe<D>
    extends BaseLocaleAwareFormatterPipe<D, D[] | string[] | null | undefined, []>
    implements PipeTransform
{
    override transform(value: D[] | string[] | null | undefined): string {
        return super.transform(value);
    }

    protected format(value: D[] | string[] | null | undefined): string {
        const range = toOpenedRange(this.adapter, value);

        if (!range) return '';

        return this.formatter.rangeShortDate(range[0], range[1] ?? undefined);
    }
}

@Pipe({
    name: 'kbqRangeLongDateTime',
    pure: false
})
export class KbqRangeLongDateTimePipe<D>
    extends BaseLocaleAwareFormatterPipe<D, D[] | string[] | null | undefined, [options?: DateTimeOptions]>
    implements PipeTransform
{
    override transform(value: D[] | string[] | null | undefined, options?: DateTimeOptions): string {
        return super.transform(value, options);
    }

    protected format(value: D[] | string[] | null | undefined, options?: DateTimeOptions): string {
        const range = toOpenedRange(this.adapter, value);

        if (!range) return '';

        return this.formatter.rangeLongDateTime(range[0], range[1] ?? undefined, options);
    }
}

@Pipe({
    name: 'kbqRangeMiddleDateTime',
    pure: false
})
export class KbqRangeMiddleDateTimePipe<D>
    extends BaseLocaleAwareFormatterPipe<D, D[] | string[] | null | undefined, [options?: DateTimeOptions]>
    implements PipeTransform
{
    override transform(value: D[] | string[] | null | undefined, options?: DateTimeOptions): string {
        return super.transform(value, options);
    }

    protected format(value: D[] | string[] | null | undefined, options?: DateTimeOptions): string {
        // Unlike the other range formats, the middle one has no opened-range template — both bounds required.
        const range = toClosedRange(this.adapter, value);

        if (!range) return '';

        return this.formatter.rangeMiddleDateTime(range[0], range[1], options);
    }
}

@Pipe({
    name: 'kbqRangeShortDateTime',
    pure: false
})
export class KbqRangeShortDateTimePipe<D>
    extends BaseLocaleAwareFormatterPipe<D, D[] | string[] | null | undefined, [options?: DateTimeOptions]>
    implements PipeTransform
{
    override transform(value: D[] | string[] | null | undefined, options?: DateTimeOptions): string {
        return super.transform(value, options);
    }

    protected format(value: D[] | string[] | null | undefined, options?: DateTimeOptions): string {
        const range = toOpenedRange(this.adapter, value);

        if (!range) return '';

        return this.formatter.rangeShortDateTime(range[0], range[1], options);
    }
}

/**
 * Formats the duration between two dates as a digital-clock value, e.g. `48:02:25`.
 *
 * Takes a `[from, to]` tuple, like the range pipes. `options.seconds` defaults to `true` and
 * `options.milliseconds` to `false`; `options.currYear` is not used by this format.
 *
 * Renders an empty string when the tuple itself or one of its bounds is missing or invalid, or when
 * `from` is later than `to`.
 *
 * @example
 * ```html
 * {{ [startedAt, finishedAt] | kbqDurationShortest }}
 * {{ [startedAt, finishedAt] | kbqDurationShortest: { seconds: false } }}
 * ```
 */
@Pipe({
    name: 'kbqDurationShortest',
    pure: false
})
export class KbqDurationShortestPipe<D>
    extends BaseLocaleAwareFormatterPipe<D, D[] | string[] | null | undefined, [options?: DateTimeOptions]>
    implements PipeTransform
{
    override transform(value: D[] | string[] | null | undefined, options?: DateTimeOptions): string {
        return super.transform(value, options);
    }

    protected format(value: D[] | string[] | null | undefined, options?: DateTimeOptions): string {
        const range = toDurationRange(this.adapter, value);

        if (!range) return '';

        return this.formatter.durationShortest(range[0], range[1], options?.seconds, options?.milliseconds);
    }
}

/**
 * Formats the duration between two dates in the long text format, e.g. `2 дня и 4 часа`.
 *
 * Takes a `[from, to]` tuple, like the range pipes. `units` restricts the units to show (the
 * formatter picks them automatically when omitted), `fraction` adds a fractional part for years
 * and months.
 *
 * Renders an empty string when the tuple itself or one of its bounds is missing or invalid, or when
 * `from` is later than `to`.
 *
 * @example
 * ```html
 * {{ [startedAt, finishedAt] | kbqDurationLong }}
 * {{ [startedAt, finishedAt] | kbqDurationLong: ['hours', 'minutes'] }}
 * {{ [startedAt, finishedAt] | kbqDurationLong: ['years'] : true }}
 * ```
 */
@Pipe({
    name: 'kbqDurationLong',
    pure: false
})
export class KbqDurationLongPipe<D>
    extends BaseLocaleAwareFormatterPipe<
        D,
        D[] | string[] | null | undefined,
        [units?: DurationUnit[], fraction?: boolean]
    >
    implements PipeTransform
{
    override transform(value: D[] | string[] | null | undefined, units?: DurationUnit[], fraction?: boolean): string {
        return super.transform(value, units, fraction);
    }

    protected format(value: D[] | string[] | null | undefined, units?: DurationUnit[], fraction?: boolean): string {
        const range = toDurationRange(this.adapter, value);

        if (!range) return '';

        return this.formatter.durationLong(range[0], range[1], units, fraction);
    }
}

/**
 * Formats the duration between two dates in the short text format, e.g. `2 д 4 ч`.
 *
 * Takes a `[from, to]` tuple, like the range pipes. `units` restricts the units to show (the
 * formatter picks them automatically when omitted), `fraction` adds a fractional part for years
 * and months.
 *
 * Renders an empty string when the tuple itself or one of its bounds is missing or invalid, or when
 * `from` is later than `to`.
 *
 * @example
 * ```html
 * {{ [startedAt, finishedAt] | kbqDurationShort }}
 * {{ [startedAt, finishedAt] | kbqDurationShort: ['seconds', 'milliseconds'] }}
 * ```
 */
@Pipe({
    name: 'kbqDurationShort',
    pure: false
})
export class KbqDurationShortPipe<D>
    extends BaseLocaleAwareFormatterPipe<
        D,
        D[] | string[] | null | undefined,
        [units?: DurationUnit[], fraction?: boolean]
    >
    implements PipeTransform
{
    override transform(value: D[] | string[] | null | undefined, units?: DurationUnit[], fraction?: boolean): string {
        return super.transform(value, units, fraction);
    }

    protected format(value: D[] | string[] | null | undefined, units?: DurationUnit[], fraction?: boolean): string {
        const range = toDurationRange(this.adapter, value);

        if (!range) return '';

        return this.formatter.durationShort(range[0], range[1], units, fraction);
    }
}

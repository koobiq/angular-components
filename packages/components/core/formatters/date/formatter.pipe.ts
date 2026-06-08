import { ChangeDetectorRef, inject, Pipe, PipeTransform } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DateTimeOptions } from '@koobiq/date-formatter';
import { DateAdapter } from '../../datetime';
import { KBQ_LOCALE_SERVICE } from '../../locales';
import { DateFormatter } from './formatter';

export class BaseFormatterPipe<D> {
    protected readonly adapter: DateAdapter<D> = inject(DateAdapter<D>);
    protected readonly formatter: DateFormatter<D> = inject(DateFormatter<D>);
}

/**
 * Base class for impure date-formatter pipes that recompute their result
 * whenever the active locale changes via `KbqLocaleService`.
 *
 * The base class owns:
 * - a subscription to `KbqLocaleService.changes` that invalidates the cache and
 *   marks the host for check (the same approach the built-in `AsyncPipe` uses);
 * - caching by `(value, args, localeId)`, so the impure `transform()` only does
 *   real work when an input or the active locale actually changed.
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
    Value = D | string,
    Args extends unknown[] = unknown[]
> extends BaseFormatterPipe<D> {
    private readonly changeDetectorRef = inject(ChangeDetectorRef);
    private readonly localeService = inject(KBQ_LOCALE_SERVICE, { optional: true });

    private cachedValue: Value | null = null;
    private cachedArgs: Args = [] as unknown as Args;
    private cachedLocaleId: string | null = null;
    private cachedResult = '';
    private hasCache = false;

    constructor() {
        super();

        this.localeService?.changes.pipe(takeUntilDestroyed()).subscribe(() => {
            this.hasCache = false;
            this.changeDetectorRef.markForCheck();
        });
    }

    transform(value: Value, ...args: Args): string {
        const currentLocaleId = this.localeService?.id ?? null;

        if (
            this.hasCache &&
            value === this.cachedValue &&
            currentLocaleId === this.cachedLocaleId &&
            this.argsEqual(args)
        ) {
            return this.cachedResult;
        }

        this.cachedResult = this.format(value, ...args);
        this.cachedValue = value;
        this.cachedArgs = args;
        this.cachedLocaleId = currentLocaleId;
        this.hasCache = true;

        return this.cachedResult;
    }

    protected abstract format(value: Value, ...args: Args): string;

    private argsEqual(args: Args): boolean {
        if (args.length !== this.cachedArgs.length) return false;

        for (let i = 0; i < args.length; i++) {
            if (args[i] !== this.cachedArgs[i]) return false;
        }

        return true;
    }
}

@Pipe({
    name: 'absoluteLongDate'
})
export class AbsoluteDateFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform(value: D | string, currYear?: boolean): string {
        const date = this.adapter.deserialize(value);

        return date ? this.formatter.absoluteLongDate(date, currYear) : '';
    }
}

@Pipe({
    name: 'absoluteLongDateImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class AbsoluteDateFormatterImpurePipe<D> extends AbsoluteDateFormatterPipe<D> {
    transform(value: string | D, currYear?: boolean): string {
        return super.transform(value, currYear);
    }
}

@Pipe({
    name: 'absoluteLongDateTime'
})
export class AbsoluteDateTimeFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform(value: D | string, options?: DateTimeOptions): string {
        const date = this.adapter.deserialize(value);

        return date ? this.formatter.absoluteLongDateTime(date, options) : '';
    }
}

@Pipe({
    name: 'absoluteLongDateTimeImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class AbsoluteDateTimeFormatterImpurePipe<D> extends AbsoluteDateTimeFormatterPipe<D> {
    transform(value: string | D, options?: DateTimeOptions): string {
        return super.transform(value, options);
    }
}

@Pipe({
    name: 'absoluteShortDate'
})
export class AbsoluteDateShortFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform(value: D | string, currYear?: boolean): string {
        const date = this.adapter.deserialize(value);

        return date ? this.formatter.absoluteShortDate(date, currYear) : '';
    }
}

@Pipe({
    name: 'absoluteShortDateImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class AbsoluteDateShortFormatterImpurePipe<D> extends AbsoluteDateShortFormatterPipe<D> {
    transform(value: string | D, currYear?: boolean): string {
        return super.transform(value, currYear);
    }
}

@Pipe({
    name: 'absoluteShortDateTime'
})
export class AbsoluteShortDateTimeFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform(value: D | string, options?: DateTimeOptions): string {
        const date = this.adapter.deserialize(value);

        return date ? this.formatter.absoluteShortDateTime(date, options) : '';
    }
}

@Pipe({
    name: 'absoluteShortDateTimeImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class AbsoluteShortDateTimeFormatterImpurePipe<D> extends AbsoluteShortDateTimeFormatterPipe<D> {
    transform(value: string | D, options?: DateTimeOptions): string {
        return super.transform(value, options);
    }
}

@Pipe({
    name: 'relativeLongDate'
})
export class RelativeDateFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform(value: D | string): string {
        const date = this.adapter.deserialize(value);

        return date ? this.formatter.relativeLongDate(date) : '';
    }
}

@Pipe({
    name: 'relativeLongDateImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class RelativeDateFormatterImpurePipe<D> extends RelativeDateFormatterPipe<D> {
    transform(value: string | D): string {
        return super.transform(value);
    }
}

@Pipe({
    name: 'relativeLongDateTime'
})
export class RelativeDateTimeFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform(value: D | string, options?: DateTimeOptions): string {
        const date = this.adapter.deserialize(value);

        return date ? this.formatter.relativeLongDateTime(date, options) : '';
    }
}

@Pipe({
    name: 'relativeLongDateTimeImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class RelativeDateTimeFormatterImpurePipe<D> extends RelativeDateTimeFormatterPipe<D> {
    transform(value: string | D, options?: DateTimeOptions): string {
        return super.transform(value, options);
    }
}

@Pipe({
    name: 'relativeShortDate'
})
export class RelativeShortDateFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform(value: D | string): string {
        const date = this.adapter.deserialize(value);

        return date ? this.formatter.relativeShortDate(date) : '';
    }
}

@Pipe({
    name: 'relativeShortDateImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class RelativeShortDateFormatterImpurePipe<D> extends RelativeShortDateFormatterPipe<D> {
    transform(value: string | D): string {
        return super.transform(value);
    }
}

@Pipe({
    name: 'relativeShortDateTime'
})
export class RelativeShortDateTimeFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform(value: D | string, options?: DateTimeOptions): string {
        const date = this.adapter.deserialize(value);

        return date ? this.formatter.relativeShortDateTime(date, options) : '';
    }
}

@Pipe({
    name: 'relativeShortDateTimeImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class RelativeShortDateTimeFormatterImpurePipe<D> extends RelativeShortDateTimeFormatterPipe<D> {
    transform(value: string | D, options?: DateTimeOptions): string {
        return super.transform(value, options);
    }
}

@Pipe({
    name: 'rangeLongDate'
})
export class RangeDateFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform([value1, value2]: D[] | string[]): string {
        const date1 = this.adapter.deserialize(value1);
        const date2 = this.adapter.deserialize(value2);

        return this.formatter.rangeLongDate(date1 as D, date2 as D);
    }
}

@Pipe({
    name: 'rangeLongDateImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class RangeDateFormatterImpurePipe<D> extends RangeDateFormatterPipe<D> {
    transform([value1, value2]: D[] | string[]): string {
        return super.transform([value1, value2] as D[] | string[]);
    }
}

@Pipe({
    name: 'rangeShortDate'
})
export class RangeShortDateFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform([value1, value2]: D[] | string[]): string {
        const date1 = this.adapter.deserialize(value1);
        const date2 = this.adapter.deserialize(value2);

        return this.formatter.rangeShortDate(date1 as D, date2 as D);
    }
}

@Pipe({
    name: 'rangeShortDateImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class RangeShortDateFormatterImpurePipe<D> extends RangeShortDateFormatterPipe<D> {
    transform([value1, value2]: D[] | string[]): string {
        return super.transform([value1, value2] as D[] | string[]);
    }
}

@Pipe({
    name: 'rangeLongDateTime'
})
export class RangeDateTimeFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform([value1, value2]: D[] | string[], options?: DateTimeOptions): string {
        const date1 = this.adapter.deserialize(value1);
        const date2 = this.adapter.deserialize(value2);

        return this.formatter.rangeLongDateTime(date1 as D, date2 as D, options);
    }
}

@Pipe({
    name: 'rangeLongDateTimeImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class RangeDateTimeFormatterImpurePipe<D> extends RangeDateTimeFormatterPipe<D> {
    transform([value1, value2]: D[] | string[], options?: DateTimeOptions): string {
        return super.transform([value1, value2] as D[] | string[], options);
    }
}

@Pipe({
    name: 'rangeMiddleDateTime'
})
export class RangeMiddleDateTimeFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform([value1, value2]: D[] | string[], options?: DateTimeOptions): string {
        const date1 = this.adapter.deserialize(value1);
        const date2 = this.adapter.deserialize(value2);

        return this.formatter.rangeMiddleDateTime(date1 as D, date2 as D, options);
    }
}

@Pipe({
    name: 'rangeMiddleDateTimeImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class RangeMiddleDateTimeFormatterImpurePipe<D> extends RangeMiddleDateTimeFormatterPipe<D> {
    transform([value1, value2]: D[] | string[], options?: DateTimeOptions): string {
        return super.transform([value1, value2] as D[] | string[], options);
    }
}

@Pipe({
    name: 'rangeShortDateTime'
})
export class RangeShortDateTimeFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform([value1, value2]: D[] | string[], options?: DateTimeOptions): string {
        const date1 = this.adapter.deserialize(value1);
        const date2 = this.adapter.deserialize(value2);

        return this.formatter.rangeShortDateTime(date1 as D, date2 as D, options);
    }
}

@Pipe({
    name: 'rangeShortDateTimeImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class RangeShortDateTimeFormatterImpurePipe<D> extends RangeShortDateTimeFormatterPipe<D> {
    transform([value1, value2]: D[] | string[], options?: DateTimeOptions): string {
        return super.transform([value1, value2] as D[] | string[], options);
    }
}

// Impure pipes that recompute on `KbqLocaleService` locale changes (see `BaseLocaleAwareFormatterPipe`).
// Prefer these `kbq`-prefixed pipes when the locale can change at runtime; the pure pipes above are
// kept for static usages and backward compatibility.

@Pipe({
    name: 'kbqAbsoluteLongDate',
    pure: false
})
export class KbqAbsoluteLongDatePipe<D>
    extends BaseLocaleAwareFormatterPipe<D, D | string, [currYear?: boolean]>
    implements PipeTransform
{
    override transform(value: D | string, currYear?: boolean): string {
        return super.transform(value, currYear);
    }

    protected format(value: D | string, currYear?: boolean): string {
        const date = this.adapter.deserialize(value);

        return date ? this.formatter.absoluteLongDate(date, currYear) : '';
    }
}

@Pipe({
    name: 'kbqAbsoluteShortDate',
    pure: false
})
export class KbqAbsoluteShortDatePipe<D>
    extends BaseLocaleAwareFormatterPipe<D, D | string, [currYear?: boolean]>
    implements PipeTransform
{
    override transform(value: D | string, currYear?: boolean): string {
        return super.transform(value, currYear);
    }

    protected format(value: D | string, currYear?: boolean): string {
        const date = this.adapter.deserialize(value);

        return date ? this.formatter.absoluteShortDate(date, currYear) : '';
    }
}

@Pipe({
    name: 'kbqAbsoluteLongDateTime',
    pure: false
})
export class KbqAbsoluteLongDateTimePipe<D>
    extends BaseLocaleAwareFormatterPipe<D, D | string, [options?: DateTimeOptions]>
    implements PipeTransform
{
    override transform(value: D | string, options?: DateTimeOptions): string {
        return super.transform(value, options);
    }

    protected format(value: D | string, options?: DateTimeOptions): string {
        const date = this.adapter.deserialize(value);

        return date ? this.formatter.absoluteLongDateTime(date, options) : '';
    }
}

@Pipe({
    name: 'kbqAbsoluteShortDateTime',
    pure: false
})
export class KbqAbsoluteShortDateTimePipe<D>
    extends BaseLocaleAwareFormatterPipe<D, D | string, [options?: DateTimeOptions]>
    implements PipeTransform
{
    override transform(value: D | string, options?: DateTimeOptions): string {
        return super.transform(value, options);
    }

    protected format(value: D | string, options?: DateTimeOptions): string {
        const date = this.adapter.deserialize(value);

        return date ? this.formatter.absoluteShortDateTime(date, options) : '';
    }
}

@Pipe({
    name: 'kbqRelativeLongDate',
    pure: false
})
export class KbqRelativeLongDatePipe<D>
    extends BaseLocaleAwareFormatterPipe<D, D | string, []>
    implements PipeTransform
{
    override transform(value: D | string): string {
        return super.transform(value);
    }

    protected format(value: D | string): string {
        const date = this.adapter.deserialize(value);

        return date ? this.formatter.relativeLongDate(date) : '';
    }
}

@Pipe({
    name: 'kbqRelativeShortDate',
    pure: false
})
export class KbqRelativeShortDatePipe<D>
    extends BaseLocaleAwareFormatterPipe<D, D | string, []>
    implements PipeTransform
{
    override transform(value: D | string): string {
        return super.transform(value);
    }

    protected format(value: D | string): string {
        const date = this.adapter.deserialize(value);

        return date ? this.formatter.relativeShortDate(date) : '';
    }
}

@Pipe({
    name: 'kbqRelativeLongDateTime',
    pure: false
})
export class KbqRelativeLongDateTimePipe<D>
    extends BaseLocaleAwareFormatterPipe<D, D | string, [options?: DateTimeOptions]>
    implements PipeTransform
{
    override transform(value: D | string, options?: DateTimeOptions): string {
        return super.transform(value, options);
    }

    protected format(value: D | string, options?: DateTimeOptions): string {
        const date = this.adapter.deserialize(value);

        return date ? this.formatter.relativeLongDateTime(date, options) : '';
    }
}

@Pipe({
    name: 'kbqRelativeShortDateTime',
    pure: false
})
export class KbqRelativeShortDateTimePipe<D>
    extends BaseLocaleAwareFormatterPipe<D, D | string, [options?: DateTimeOptions]>
    implements PipeTransform
{
    override transform(value: D | string, options?: DateTimeOptions): string {
        return super.transform(value, options);
    }

    protected format(value: D | string, options?: DateTimeOptions): string {
        const date = this.adapter.deserialize(value);

        return date ? this.formatter.relativeShortDateTime(date, options) : '';
    }
}

@Pipe({
    name: 'kbqRangeLongDate',
    pure: false
})
export class KbqRangeLongDatePipe<D>
    extends BaseLocaleAwareFormatterPipe<D, D[] | string[], []>
    implements PipeTransform
{
    override transform(value: D[] | string[]): string {
        return super.transform(value);
    }

    protected format([value1, value2]: D[] | string[]): string {
        const date1 = this.adapter.deserialize(value1);
        const date2 = this.adapter.deserialize(value2);

        return this.formatter.rangeLongDate(date1 as D, date2 as D);
    }
}

@Pipe({
    name: 'kbqRangeShortDate',
    pure: false
})
export class KbqRangeShortDatePipe<D>
    extends BaseLocaleAwareFormatterPipe<D, D[] | string[], []>
    implements PipeTransform
{
    override transform(value: D[] | string[]): string {
        return super.transform(value);
    }

    protected format([value1, value2]: D[] | string[]): string {
        const date1 = this.adapter.deserialize(value1);
        const date2 = this.adapter.deserialize(value2);

        return this.formatter.rangeShortDate(date1 as D, date2 as D);
    }
}

@Pipe({
    name: 'kbqRangeLongDateTime',
    pure: false
})
export class KbqRangeLongDateTimePipe<D>
    extends BaseLocaleAwareFormatterPipe<D, D[] | string[], [options?: DateTimeOptions]>
    implements PipeTransform
{
    override transform(value: D[] | string[], options?: DateTimeOptions): string {
        return super.transform(value, options);
    }

    protected format([value1, value2]: D[] | string[], options?: DateTimeOptions): string {
        const date1 = this.adapter.deserialize(value1);
        const date2 = this.adapter.deserialize(value2);

        return this.formatter.rangeLongDateTime(date1 as D, date2 as D, options);
    }
}

@Pipe({
    name: 'kbqRangeMiddleDateTime',
    pure: false
})
export class KbqRangeMiddleDateTimePipe<D>
    extends BaseLocaleAwareFormatterPipe<D, D[] | string[], [options?: DateTimeOptions]>
    implements PipeTransform
{
    override transform(value: D[] | string[], options?: DateTimeOptions): string {
        return super.transform(value, options);
    }

    protected format([value1, value2]: D[] | string[], options?: DateTimeOptions): string {
        const date1 = this.adapter.deserialize(value1);
        const date2 = this.adapter.deserialize(value2);

        return this.formatter.rangeMiddleDateTime(date1 as D, date2 as D, options);
    }
}

@Pipe({
    name: 'kbqRangeShortDateTime',
    pure: false
})
export class KbqRangeShortDateTimePipe<D>
    extends BaseLocaleAwareFormatterPipe<D, D[] | string[], [options?: DateTimeOptions]>
    implements PipeTransform
{
    override transform(value: D[] | string[], options?: DateTimeOptions): string {
        return super.transform(value, options);
    }

    protected format([value1, value2]: D[] | string[], options?: DateTimeOptions): string {
        const date1 = this.adapter.deserialize(value1);
        const date2 = this.adapter.deserialize(value2);

        return this.formatter.rangeShortDateTime(date1 as D, date2 as D, options);
    }
}

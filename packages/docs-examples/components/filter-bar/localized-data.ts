import { computed, inject, Signal } from '@angular/core';
import { DateAdapter, DateFormatter, kbqInjectLocaleService } from '@koobiq/components/core';

/**
 * A relative period offered by the `date` / `datetime` pipes, expressed as one negative duration
 * unit. The label is derived from it, so the examples carry no translated period names at all.
 */
export interface ExamplePeriod {
    unit: 'hours' | 'days' | 'years';
    amount: number;
}

/**
 * Value shape the `date` / `datetime` pipes read: `name` is what the chip and the period list show,
 * `start` is the offset applied to `today()` when the period is resolved to an actual range.
 */
export interface ExamplePeriodValue {
    name: string;
    start: Record<string, number>;
    end: null;
}

/** Periods offered by the `date` pipe in these examples. */
const DATE_PERIODS: ExamplePeriod[] = [
    { unit: 'days', amount: -1 },
    { unit: 'days', amount: -3 },
    { unit: 'days', amount: -7 },
    { unit: 'days', amount: -30 },
    { unit: 'days', amount: -90 },
    { unit: 'years', amount: -1 }
];

/** Periods offered by the `datetime` pipe in these examples. */
const DATETIME_PERIODS: ExamplePeriod[] = [
    { unit: 'hours', amount: -1 },
    { unit: 'hours', amount: -3 },
    { unit: 'hours', amount: -24 },
    { unit: 'days', amount: -3 },
    { unit: 'days', amount: -7 },
    { unit: 'days', amount: -30 },
    { unit: 'days', amount: -90 },
    { unit: 'years', amount: -1 }
];

/** Period lists whose labels follow the active locale. Call from an injection context. */
export interface LocalizedPeriods {
    date: Signal<ExamplePeriodValue[]>;
    datetime: Signal<ExamplePeriodValue[]>;
    /** The entry of `list` standing for `period`, for a pipe that starts with a period already selected. */
    pick: (list: ExamplePeriodValue[], period: ExamplePeriod) => ExamplePeriodValue;
}

/**
 * Builds the period lists of the `date` / `datetime` pipes with labels taken from the active locale.
 *
 * The filter bar translates its own strings but never the data it is handed, so labels like
 * "Last 24 hours" are the application's to produce. Rather than keeping a translation table, they are
 * formatted out of the period itself with `DateFormatter.duration()` and the duration templates of the
 * active locale — the same ones `kbq-time-range` renders its preset list with — which covers every
 * shipped locale and gets the plural forms right.
 *
 * Requires `DateAdapter` (from a date module such as `LuxonDateModule`) and `DateFormatter`; a component
 * that scopes its own locale must scope both next to it, or the labels resolve in a different locale
 * than the rest of the bar.
 */
export const injectLocalizedPeriods = (): LocalizedPeriods => {
    const adapter = inject(DateAdapter);
    const formatter = inject(DateFormatter);
    const localeService = kbqInjectLocaleService({ optional: true });

    // `getParams` reads the service's `data` signal, so this recomputes on `setLocale()` by itself.
    const template = computed(() => localeService?.getParams('timeRange').durationTemplate.option);

    const toValue = ({ unit, amount }: ExamplePeriod): ExamplePeriodValue => {
        const start = { [unit]: amount };
        const end = adapter.today();
        const option = template();

        return {
            name: option
                ? formatter.duration(adapter.addCalendarUnits(end, start), end, [unit], false, option)
                : formatter.durationLong(adapter.addCalendarUnits(end, start), end, [unit]),
            start,
            end: null
        };
    };

    const date = computed(() => DATE_PERIODS.map(toValue));
    const datetime = computed(() => DATETIME_PERIODS.map(toValue));

    return {
        date,
        datetime,
        // The period list highlights the selected option by comparing names, so a pipe's initial value
        // has to be the entry of the list it stands for, not a separately built object.
        pick: (list, { unit, amount }) =>
            list.find((value) => value.start[unit] === amount) ?? toValue({ unit, amount })
    };
};

/**
 * Picks the entry matching the active locale, falling back to `default`.
 *
 * For text the examples own — a pipe's name, a label in the page around the bar — that has no
 * counterpart in the library's locale data.
 */
export const injectLocalizedText = <T>(data: Record<string | 'default', T>): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

import { computed, inject, Signal, untracked } from '@angular/core';
import {
    DateAdapter,
    DateFormatter,
    kbqInjectLocaleConfiguration,
    kbqInjectLocaleService
} from '@koobiq/components/core';
import { KBQ_TIME_RANGE_LOCALE_CONFIGURATION } from '@koobiq/components/time-range';

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
    /** The value of one period, for a pipe that starts with a period already selected. */
    pick: (period: ExamplePeriod) => ExamplePeriodValue;
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
    const timeRange = kbqInjectLocaleConfiguration('timeRange', KBQ_TIME_RANGE_LOCALE_CONFIGURATION);

    // The active locale is the only thing a label depends on. `adapter.today()` reads the timezone
    // signal, which would otherwise rebuild every list — and every filter derived from it — on a
    // timezone change that cannot alter a single string. One reference instant per list also keeps
    // the whole list anchored to the same moment.
    const toValues = (periods: ExamplePeriod[]): ExamplePeriodValue[] => {
        const option = timeRange().durationTemplate.option;

        return untracked(() => {
            const end = adapter.today();

            return periods.map(({ unit, amount }) => {
                const start = { [unit]: amount };

                return {
                    name: formatter.duration(adapter.addCalendarUnits(end, start), end, [unit], false, option),
                    start,
                    end: null
                };
            });
        });
    };

    return {
        date: computed(() => toValues(DATE_PERIODS)),
        datetime: computed(() => toValues(DATETIME_PERIODS)),
        // The period list highlights the selected option by comparing names, and a period always renders
        // the same name, so building the value here matches the entry of the list it stands for.
        pick: (period) => toValues([period])[0]
    };
};

/**
 * Picks the entry matching the active locale, falling back to `default`.
 *
 * For text the examples own — a pipe's name, a label in the page around the bar — that has no
 * counterpart in the library's locale data. Only the locales the record lists are translated; every
 * other one gets `default`.
 */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

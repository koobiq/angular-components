import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { DateAdapter, DateFormatter } from '@koobiq/components/core';
import {
    createMissingDateImplError,
    defaultTimeRangeTypes,
    KBQ_CUSTOM_TIME_RANGE_TYPES,
    KBQ_DEFAULT_TIME_RANGE_TYPES
} from './constants';
import {
    KbqCustomTimeRangeType,
    KbqRange,
    KbqRangeValue,
    KbqTimeRangeRange,
    KbqTimeRangeTranslationType,
    KbqTimeRangeType,
    KbqTimeRangeUnits
} from './types';

/** The owning component's bound inputs, read live rather than copied. @docs-private */
interface KbqTimeRangeBoundsSource<T> {
    min: Signal<T | null | undefined>;
    max: Signal<T | null | undefined>;
}

@Injectable()
export class KbqTimeRangeService<T> {
    // Optional so the constructor can name the missing provider instead of letting DI throw a bare
    // `NullInjectorError`. Neither is optional in practice - the guards below reject a missing one.
    readonly dateAdapter = inject<DateAdapter<T>>(DateAdapter, { optional: true })!;
    readonly dateFormatter = inject<DateFormatter<T>>(DateFormatter, { optional: true })!;

    readonly providedDefaultTimeRangeTypes =
        inject(KBQ_DEFAULT_TIME_RANGE_TYPES, { optional: true }) || defaultTimeRangeTypes;

    readonly customTimeRangeTypes = inject(KBQ_CUSTOM_TIME_RANGE_TYPES, { optional: true });

    readonly DEFAULT_RANGE_TYPE: KbqTimeRangeType = 'lastHour';

    private readonly boundsSource = signal<KbqTimeRangeBoundsSource<T>>({
        min: signal(null),
        max: signal(null)
    });

    /**
     * Bounds of the owning component, so that every default and every check reads one pair. Both are
     * exact instants rather than whole days: a `maxDate` that should admit its own day has to carry the
     * end of that day.
     */
    readonly minDate = computed(() => this.boundsSource().min() ?? null);
    /** @see minDate */
    readonly maxDate = computed(() => this.boundsSource().max() ?? null);

    readonly timeRangeConfig: Record<KbqTimeRangeType, Omit<KbqCustomTimeRangeType, 'type'>> = {
        lastMinute: { units: { minutes: -1 }, translationType: 'minutes' },
        last5Minutes: { units: { minutes: -5 }, translationType: 'minutes' },
        last15Minutes: { units: { minutes: -15 }, translationType: 'minutes' },
        last30Minutes: { units: { minutes: -30 }, translationType: 'minutes' },

        lastHour: { units: { hours: -1 }, translationType: 'hours' },
        last24Hours: { units: { hours: -24 }, translationType: 'hours' },

        last3Days: { units: { days: -3 }, translationType: 'days' },
        last7Days: { units: { days: -7 }, translationType: 'days' },
        last14Days: { units: { days: -14 }, translationType: 'days' },
        last30Days: { units: { days: -30 }, translationType: 'days' },

        last3Months: { units: { months: -3 }, translationType: 'months' },
        last12Months: { units: { months: -12 }, translationType: 'months' },

        allTime: { units: {}, translationType: 'other' },
        currentQuarter: { units: {}, translationType: 'other' },
        currentYear: { units: {}, translationType: 'other' },
        range: { units: {}, translationType: 'other' }
    };

    constructor() {
        if (!this.dateAdapter) {
            throw createMissingDateImplError('KbqTimeRange', 'DateAdapter');
        }

        if (!this.dateFormatter) {
            throw createMissingDateImplError('KbqTimeRange', 'DateFormatter');
        }

        this.customTimeRangeTypes
            ?.filter(({ type }) => {
                return !this.timeRangeConfig[type];
            })
            .forEach((type) => this.add(type));
    }

    static range = (dateTimeISOString: string): KbqRange => ({
        startDateTime: dateTimeISOString
    });

    add({ type, ...customTimeRangeConfig }: KbqCustomTimeRangeType): void {
        this.timeRangeConfig[type] = customTimeRangeConfig;
    }

    /**
     * Hands the owning component's own bound inputs over, rather than a copy of their values: a signal
     * input reads as its initial value until the first change detection, so a mirror would leave every
     * default computed in a constructor clamped against no bounds at all.
     */
    bindBounds(min: Signal<T | null | undefined>, max: Signal<T | null | undefined>): void {
        this.boundsSource.set({ min, max });
    }

    getTimeRangeTypeUnits(type: KbqTimeRangeType): KbqTimeRangeUnits {
        return this.timeRangeConfig[type].units;
    }

    getTimeRangeUnitByType(type: KbqTimeRangeType): KbqTimeRangeTranslationType {
        return this.timeRangeConfig[type].translationType;
    }

    /**
     * "Yesterday to today", pulled inside {@link minDate}/{@link maxDate} when they are set - otherwise
     * the editor opens on a range it would itself report as out of bounds.
     *
     * Milliseconds are dropped from "today" *before* clamping, so a clamped end lands exactly on its
     * bound rather than a fraction of a second below it.
     */
    getDefaultRangeValue(): Required<KbqRangeValue<T>> {
        const today = this.omitMilliseconds(this.dateAdapter.today());
        // `from` is derived from the clamped `to`, so the one-day window survives bounds that lie
        // entirely in the past - clamping both ends independently would collapse it onto `maxDate`.
        const to = this.clampToBounds(today);
        const from = this.clampToBounds(this.dateAdapter.addCalendarUnits(to, { days: -1 }));

        return { fromTime: from, fromDate: from, toTime: to, toDate: to };
    }

    getTimeRangeDefaultValue(
        rangeValue: KbqRangeValue<T>,
        availableTimeRangeTypes: KbqTimeRangeType[] = []
    ): KbqTimeRangeRange {
        const defaultType =
            availableTimeRangeTypes[0] ?? this.providedDefaultTimeRangeTypes[0] ?? this.DEFAULT_RANGE_TYPE;

        return {
            ...this.calculateTimeRange(defaultType, rangeValue || this.getDefaultRangeValue()),
            type: defaultType
        };
    }

    calculateTimeRange(type?: KbqTimeRangeType, rangeValue?: KbqRangeValue<T>): KbqRange {
        if (!type) {
            return {};
        }

        if (type === 'range') {
            const checkedRangeValue = rangeValue || this.getDefaultRangeValue();

            return {
                startDateTime:
                    checkedRangeValue.fromDate && checkedRangeValue.fromTime
                        ? this.dateAdapter.toIso8601(
                              this.combineDateAndTime(checkedRangeValue.fromDate, checkedRangeValue.fromTime)
                          )
                        : '',
                endDateTime:
                    checkedRangeValue.toDate && checkedRangeValue.toTime
                        ? this.dateAdapter.toIso8601(
                              this.combineDateAndTime(checkedRangeValue.toDate, checkedRangeValue.toTime)
                          )
                        : ''
            };
        }

        switch (this.getTimeRangeUnitByType(type)) {
            case 'other': {
                switch (type) {
                    case 'currentQuarter':
                        return KbqTimeRangeService.range(
                            this.dateAdapter.toIso8601(this.dateAdapter.startOf(this.dateAdapter.today(), 'quarter'))
                        );
                    case 'currentYear':
                        return KbqTimeRangeService.range(
                            this.dateAdapter.toIso8601(this.dateAdapter.startOf(this.dateAdapter.today(), 'year'))
                        );
                    case 'allTime':
                    default: {
                        return this.timeRangeConfig[type].range ?? {};
                    }
                }
            }
            default: {
                return this.lastUnitsRange(this.getTimeRangeTypeUnits(type));
            }
        }
    }

    combineDateAndTime(date: T, time: T): T {
        return this.dateAdapter!.createDateTime(
            this.dateAdapter.getYear(date),
            this.dateAdapter.getMonth(date),
            this.dateAdapter.getDate(date),
            this.dateAdapter.getHours(time),
            this.dateAdapter.getMinutes(time),
            this.dateAdapter.getSeconds(time),
            this.dateAdapter.getMilliseconds(time)
        );
    }

    lastUnitsRange = (unitsInfo: KbqTimeRangeUnits): KbqRange =>
        KbqTimeRangeService.range(
            this.dateAdapter.toIso8601(this.dateAdapter.addCalendarUnits(this.dateAdapter.today(), unitsInfo))
        );

    checkAndCorrectTimeRangeValue(
        value: KbqTimeRangeRange | null | undefined,
        availableTimeRangeTypes: KbqTimeRangeType[],
        rangeValue: KbqRangeValue<T>
    ): KbqTimeRangeRange {
        let result =
            value && (!availableTimeRangeTypes.length || availableTimeRangeTypes.includes(value.type))
                ? value
                : this.getTimeRangeDefaultValue(rangeValue, availableTimeRangeTypes);

        if (!result.startDateTime || (result.type === 'range' && (!result.startDateTime || !result.endDateTime))) {
            result = {
                ...this.calculateTimeRange(result.type, rangeValue),
                type: result.type
            };
        }

        return result;
    }

    /** Which bound, if any, an instant falls outside of. */
    private checkBounds(dateTime: T): 'min' | 'max' | null {
        const minDate = this.minDate();
        const maxDate = this.maxDate();

        if (minDate && this.dateAdapter.compareDateTime(dateTime, minDate) < 0) return 'min';

        if (maxDate && this.dateAdapter.compareDateTime(dateTime, maxDate) > 0) return 'max';

        return null;
    }

    /**
     * `DateAdapter.clampDate` compares whole days only, while a border is rejected by its time as well -
     * a value clamped to the day would still land outside the bounds.
     */
    private clampToBounds(date: T): T {
        switch (this.checkBounds(date)) {
            case 'min':
                return this.minDate()!;
            case 'max':
                return this.maxDate()!;
            default:
                return date;
        }
    }

    omitMilliseconds(date: T): T {
        return this.dateAdapter.createDateTime(
            this.dateAdapter.getYear(date),
            this.dateAdapter.getMonth(date),
            this.dateAdapter.getDate(date),
            this.dateAdapter.getHours(date),
            this.dateAdapter.getMinutes(date),
            this.dateAdapter.getSeconds(date),
            0
        );
    }
}

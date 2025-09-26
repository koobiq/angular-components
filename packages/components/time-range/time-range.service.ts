import { inject, Injectable } from '@angular/core';
import { DateAdapter, DateFormatter } from '@koobiq/components/core';
import { createMissingDateImplError, KBQ_DEFAULT_TIME_RANGE_TYPES } from './constants';
import {
    KbqRange,
    KbqRangeValue,
    KbqTimeRangeRange,
    KbqTimeRangeTranslateTypeMap,
    KbqTimeRangeTranslationType,
    KbqTimeRangeType,
    KbqTimeRangeUnits
} from './types';

@Injectable()
export class KbqTimeRangeService<T> {
    readonly dateAdapter = inject<DateAdapter<T>>(DateAdapter);
    readonly dateFormatter = inject<DateFormatter<T>>(DateFormatter);
    protected readonly providedDefaultTimeRangeTypes = inject(KBQ_DEFAULT_TIME_RANGE_TYPES, { optional: true });

    protected defaultTimeRangeTypes: KbqTimeRangeType[] = [
        'lastHour',
        'last24Hours',
        'last3Days',
        'last7Days',
        'last14Days',
        'currentQuarter',
        'currentYear',
        'allTime',
        'range'
    ];

    protected readonly DEFAULT_RANGE_TYPE: KbqTimeRangeType = 'lastHour';

    static readonly timeRangeMap: Record<KbqTimeRangeType, KbqTimeRangeUnits> = {
        // minutes
        lastMinute: { minutes: 1 },
        last5Minutes: { minutes: 5 },
        last15Minutes: { minutes: 15 },
        last30Minutes: { minutes: 30 },

        // hours
        lastHour: { hours: 1 },
        last24Hours: { hours: 24 },

        // days
        last3Days: { days: 3 },
        last7Days: { days: 7 },
        last14Days: { days: 14 },
        last30Days: { days: 30 },

        // months
        last3Months: { months: 3 },
        last12Months: { months: 12 },
        allTime: {},
        currentQuarter: {},
        currentYear: {},
        range: {}
    };

    static readonly timeRangeTranslationMap: KbqTimeRangeTranslateTypeMap = {
        // minutes
        lastMinute: 'minutes',
        last5Minutes: 'minutes',
        last15Minutes: 'minutes',
        last30Minutes: 'minutes',
        // hours
        lastHour: 'hours',
        last24Hours: 'hours',
        // days
        last3Days: 'days',
        last7Days: 'days',
        last14Days: 'days',
        last30Days: 'days',
        // months
        last3Months: 'months',
        last12Months: 'months',
        // other
        allTime: 'other',
        currentYear: 'other',
        currentQuarter: 'other',
        range: 'other'
    };

    get resolvedTimeRangeTypes(): KbqTimeRangeType[] {
        return this.providedDefaultTimeRangeTypes || this.defaultTimeRangeTypes;
    }

    constructor() {
        if (!this.dateAdapter) {
            throw createMissingDateImplError('KbqTimeRange', 'DateAdapter');
        }
    }

    getTimeRangeTypeUnits(type: KbqTimeRangeType): KbqTimeRangeUnits {
        return KbqTimeRangeService.timeRangeMap[type];
    }

    getTimeRangeUnitByType(type: KbqTimeRangeType): KbqTimeRangeTranslationType {
        return KbqTimeRangeService.timeRangeTranslationMap[type];
    }

    getDefaultRangeValue(): Required<KbqRangeValue<T>> {
        const from = this.dateAdapter!.addCalendarDays(this.dateAdapter!.today(), -1);
        const to = this.dateAdapter!.today();

        return {
            fromTime: from,
            fromDate: from,
            toTime: to,
            toDate: to
        };
    }

    getTimeRangeDefaultValue(
        rangeValue: KbqRangeValue<T>,
        availableTimeRangeTypes: KbqTimeRangeType[] = []
    ): KbqTimeRangeRange {
        const defaultType = availableTimeRangeTypes[0] ?? this.defaultTimeRangeTypes[0] ?? this.DEFAULT_RANGE_TYPE;

        return {
            ...this.calculateTimeRange(defaultType, rangeValue || this.getDefaultRangeValue()),
            type: defaultType
        };
    }

    calculateTimeRange(type: KbqTimeRangeType | undefined, rangeValue?: KbqRangeValue<T>): KbqRange {
        if (!type) {
            return {
                startDateTime: undefined,
                endDateTime: undefined
            };
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

        switch (type) {
            case 'lastMinute':
                return this.lastMinutesRange(1);
            case 'last5Minutes':
                return this.lastMinutesRange(5);
            case 'last15Minutes':
                return this.lastMinutesRange(15);
            case 'last30Minutes':
                return this.lastMinutesRange(30);
            case 'lastHour':
                return this.lastHoursRange(1);
            case 'last24Hours':
                return this.lastHoursRange(24);
            case 'last3Days':
                return this.lastDaysRange(3);
            case 'last7Days':
                return this.lastDaysRange(7);
            case 'last14Days':
                return this.lastDaysRange(14);
            case 'last30Days':
                return this.lastDaysRange(30);
            case 'last3Months':
                return this.lastMonthsRange(3);
            case 'last12Months':
                return this.lastMonthsRange(12);
            case 'currentQuarter':
                return {
                    startDateTime: this.dateAdapter.toIso8601(
                        this.dateAdapter.startOf(this.dateAdapter.today(), 'quarter')
                    )
                };
            case 'currentYear':
                return {
                    startDateTime: this.dateAdapter.toIso8601(
                        this.dateAdapter.startOf(this.dateAdapter.today(), 'year')
                    )
                };
            case 'allTime':
            default:
                return {
                    startDateTime: undefined,
                    endDateTime: undefined
                };
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

    fromISO = (date: string) => this.dateAdapter.deserialize(date);

    lastMinutesRange = (minutes: number): KbqRange => {
        const date = this.dateAdapter!.today();

        return {
            startDateTime: this.dateAdapter.toIso8601(
                this.dateAdapter!.createDateTime(
                    this.dateAdapter.getYear(date),
                    this.dateAdapter.getMonth(date),
                    this.dateAdapter.getDate(date),
                    this.dateAdapter.getHours(date),
                    this.dateAdapter.getMinutes(date) - minutes,
                    0,
                    0
                )
            )
        };
    };

    lastHoursRange = (hours: number): KbqRange => {
        const date = this.dateAdapter!.today();

        return {
            startDateTime: this.dateAdapter.toIso8601(
                this.dateAdapter!.createDateTime(
                    this.dateAdapter.getYear(date),
                    this.dateAdapter.getMonth(date),
                    this.dateAdapter.getDate(date),
                    this.dateAdapter.getHours(date) - hours,
                    this.dateAdapter.getMinutes(date),
                    0,
                    0
                )
            )
        };
    };

    lastDaysRange = (days: number): KbqRange => ({
        startDateTime: this.dateAdapter.toIso8601(this.dateAdapter!.addCalendarDays(this.dateAdapter!.today(), -days))
    });

    lastMonthsRange = (months: number): KbqRange => ({
        startDateTime: this.dateAdapter.toIso8601(
            this.dateAdapter?.addCalendarMonths(this.dateAdapter!.today(), -months)
        )
    });

    checkAndCorrectTimeRangeValue(
        value: KbqTimeRangeRange | undefined,
        availableTimeRangeTypes: KbqTimeRangeType[],
        rangeValue: KbqRangeValue<T>
    ): KbqTimeRangeRange {
        let result =
            value && availableTimeRangeTypes.includes(value.type)
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
}

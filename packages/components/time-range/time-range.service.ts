import { inject, Injectable } from '@angular/core';
import { DateAdapter, DateFormatter } from '@koobiq/components/core';
import { createMissingDateImplError, KBQ_DEFAULT_TIME_RANGE_TYPES } from './constants';
import { KbqRange, KbqRangeValue, KbqTimeRange, KbqTimeRangeType, KbqTimeRangeUnits } from './types';

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

    protected readonly timeRangeMap: Record<
        Exclude<KbqTimeRangeType, 'allTime' | 'currentQuarter' | 'currentYear' | 'range'>,
        KbqTimeRangeUnits
    > = {
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
        last12Months: { months: 12 }
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
        return this.timeRangeMap[type];
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
    ): KbqTimeRange {
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

        const checkedRangeValue = rangeValue || this.getDefaultRangeValue();

        if (type === 'range') {
            return {
                startDateTime:
                    checkedRangeValue.fromDate && checkedRangeValue.fromTime
                        ? this.toISO(this.combineDateAndTime(checkedRangeValue.fromDate, checkedRangeValue.fromTime))
                        : '',
                endDateTime:
                    checkedRangeValue.toDate && checkedRangeValue.toTime
                        ? this.toISO(this.combineDateAndTime(checkedRangeValue.toDate, checkedRangeValue.toTime))
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
                return this.lastDaysRange(2);
            case 'last7Days':
                return this.lastDaysRange(6);
            case 'last14Days':
                return this.lastDaysRange(13);
            case 'last30Days':
                return this.lastDaysRange(29);
            case 'last3Months':
                return this.lastMonthsRange(3);
            case 'last12Months':
                return this.lastMonthsRange(12);
            case 'currentQuarter':
                // @TODO
                return {
                    startDateTime: undefined,
                    endDateTime: undefined
                };
            case 'currentYear':
                return { startDateTime: this.toISO(this.startOfYear()) };
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
            0
        );
    }

    toISO = (date: T): string => this.dateAdapter!.toIso8601(date);
    fromISO = (date: string) => this.dateAdapter.deserialize(date);

    startOfYear(): T {
        const date = this.dateAdapter!.today();

        return this.dateAdapter!.createDate(this.dateAdapter.getYear(date), 0, 1);
    }

    lastMinutesRange = (minutes: number): KbqRange => {
        const date = this.dateAdapter!.today();

        return {
            startDateTime: this.toISO(
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
            startDateTime: this.toISO(
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
        startDateTime: this.toISO(this.dateAdapter!.addCalendarDays(this.dateAdapter!.today(), -days))
    });

    lastMonthsRange = (months: number): KbqRange => ({
        startDateTime: this.toISO(this.dateAdapter?.addCalendarMonths(this.dateAdapter!.today(), -months))
    });

    checkAndCorrectTimeRangeValue(
        value: KbqTimeRange | undefined,
        availableTimeRangeTypes: KbqTimeRangeType[],
        rangeValue: KbqRangeValue<T>
    ): KbqTimeRange {
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

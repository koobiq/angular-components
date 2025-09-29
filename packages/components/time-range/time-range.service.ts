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

    readonly providedDefaultTimeRangeTypes =
        inject(KBQ_DEFAULT_TIME_RANGE_TYPES, { optional: true }) || this.defaultTimeRangeTypes;

    static readonly DEFAULT_RANGE_TYPE: KbqTimeRangeType = 'lastHour';

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

    constructor() {
        if (!this.dateAdapter) {
            throw createMissingDateImplError('KbqTimeRange', 'DateAdapter');
        }
    }

    static range = (dateTimeISOString: string): KbqRange => ({
        startDateTime: dateTimeISOString
    });

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
        const defaultType =
            availableTimeRangeTypes[0] ??
            this.providedDefaultTimeRangeTypes[0] ??
            KbqTimeRangeService.DEFAULT_RANGE_TYPE;

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

        switch (this.getTimeRangeUnitByType(type)) {
            case 'seconds': {
                return this.lastSecondsRange(this.getTimeRangeTypeUnits(type).seconds!);
            }
            case 'minutes': {
                return this.lastMinutesRange(this.getTimeRangeTypeUnits(type).minutes!);
            }
            case 'hours': {
                return this.lastHoursRange(this.getTimeRangeTypeUnits(type).hours!);
            }
            case 'days': {
                return this.lastDaysRange(this.getTimeRangeTypeUnits(type).days!);
            }
            // @TODO: implement weeks range after date adapter update
            case 'months': {
                return this.lastMonthsRange(this.getTimeRangeTypeUnits(type).months!);
            }
            case 'other':
            default: {
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
                    default:
                        return {
                            startDateTime: undefined,
                            endDateTime: undefined
                        };
                }
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

    lastSecondsRange = (seconds: number): KbqRange => {
        const date = this.dateAdapter!.today();

        return KbqTimeRangeService.range(
            this.dateAdapter.toIso8601(
                this.dateAdapter!.createDateTime(
                    this.dateAdapter.getYear(date),
                    this.dateAdapter.getMonth(date),
                    this.dateAdapter.getDate(date),
                    this.dateAdapter.getHours(date),
                    this.dateAdapter.getMinutes(date),
                    this.dateAdapter.getSeconds(date) - seconds,
                    0
                )
            )
        );
    };

    lastMinutesRange = (minutes: number): KbqRange => {
        const date = this.dateAdapter!.today();

        return KbqTimeRangeService.range(
            this.dateAdapter.toIso8601(
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
        );
    };

    lastHoursRange = (hours: number): KbqRange => {
        const date = this.dateAdapter!.today();

        return KbqTimeRangeService.range(
            this.dateAdapter.toIso8601(
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
        );
    };

    lastDaysRange = (days: number): KbqRange =>
        KbqTimeRangeService.range(
            this.dateAdapter.toIso8601(this.dateAdapter!.addCalendarDays(this.dateAdapter!.today(), -days))
        );

    lastMonthsRange = (months: number): KbqRange =>
        KbqTimeRangeService.range(
            this.dateAdapter.toIso8601(this.dateAdapter?.addCalendarMonths(this.dateAdapter!.today(), -months))
        );

    checkAndCorrectTimeRangeValue(
        value: KbqTimeRangeRange | undefined,
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
}

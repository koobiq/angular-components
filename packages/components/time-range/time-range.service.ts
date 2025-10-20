import { inject, Injectable } from '@angular/core';
import { DateAdapter, DateFormatter } from '@koobiq/components/core';
import { createMissingDateImplError, KBQ_CUSTOM_TIME_RANGE_TYPES, KBQ_DEFAULT_TIME_RANGE_TYPES } from './constants';
import {
    KbqCustomTimeRangeType,
    KbqRange,
    KbqRangeValue,
    KbqTimeRangeRange,
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

    readonly customTimeRangeTypes = inject(KBQ_CUSTOM_TIME_RANGE_TYPES, { optional: true });

    static readonly DEFAULT_RANGE_TYPE: KbqTimeRangeType = 'lastHour';

    static readonly timeRangeConfig: Record<KbqTimeRangeType, Omit<KbqCustomTimeRangeType, 'type'>> = {
        lastMinute: { units: { minutes: 1 }, translationType: 'minutes' },
        last5Minutes: { units: { minutes: 5 }, translationType: 'minutes' },
        last15Minutes: { units: { minutes: 15 }, translationType: 'minutes' },
        last30Minutes: { units: { minutes: 30 }, translationType: 'minutes' },

        lastHour: { units: { hours: 1 }, translationType: 'hours' },
        last24Hours: { units: { hours: 24 }, translationType: 'hours' },

        last3Days: { units: { days: 3 }, translationType: 'days' },
        last7Days: { units: { days: 7 }, translationType: 'days' },
        last14Days: { units: { days: 14 }, translationType: 'days' },
        last30Days: { units: { days: 30 }, translationType: 'days' },

        last3Months: { units: { months: 3 }, translationType: 'months' },
        last12Months: { units: { months: 12 }, translationType: 'months' },

        allTime: { units: {}, translationType: 'other' },
        currentQuarter: { units: {}, translationType: 'other' },
        currentYear: { units: {}, translationType: 'other' },
        range: { units: {}, translationType: 'other' }
    };

    constructor() {
        if (!this.dateAdapter) {
            throw createMissingDateImplError('KbqTimeRange', 'DateAdapter');
        }

        if (this.customTimeRangeTypes) {
            for (const type of this.customTimeRangeTypes) {
                if (KbqTimeRangeService.timeRangeConfig[type.type]) continue;

                this.add(type);
            }
        }
    }

    static range = (dateTimeISOString: string): KbqRange => ({
        startDateTime: dateTimeISOString
    });

    add({ type, units, translationType }: KbqCustomTimeRangeType): void {
        KbqTimeRangeService.timeRangeConfig[type] = { units, translationType };
    }

    getTimeRangeTypeUnits(type: KbqTimeRangeType): KbqTimeRangeUnits {
        return KbqTimeRangeService.timeRangeConfig[type].units;
    }

    getTimeRangeUnitByType(type: KbqTimeRangeType): KbqTimeRangeTranslationType {
        return KbqTimeRangeService.timeRangeConfig[type].translationType;
    }

    getDefaultRangeValue(): Required<KbqRangeValue<T>> {
        const from = this.dateAdapter!.addCalendarDays(this.dateAdapter!.today(), -1);
        const to = this.dateAdapter!.today();

        return {
            fromTime: this.omitMilliseconds(from),
            fromDate: this.omitMilliseconds(from),
            toTime: this.omitMilliseconds(to),
            toDate: this.omitMilliseconds(to)
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
            case 'weeks': {
                return this.lastWeeksRange(this.getTimeRangeTypeUnits(type).weeks!);
            }
            // @TODO: implement weeks range after date adapter update (#DS-4226)
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

    lastWeeksRange = (weeks: number): KbqRange =>
        KbqTimeRangeService.range(
            this.dateAdapter.toIso8601(this.dateAdapter?.addCalendarDays(this.dateAdapter!.today(), -(weeks * 7)))
        );

    lastMonthsRange = (months: number): KbqRange =>
        KbqTimeRangeService.range(
            this.dateAdapter.toIso8601(this.dateAdapter?.addCalendarMonths(this.dateAdapter!.today(), -months))
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

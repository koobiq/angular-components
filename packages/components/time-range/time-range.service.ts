import { inject, Injectable } from '@angular/core';
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

@Injectable()
export class KbqTimeRangeService<T> {
    readonly dateAdapter = inject<DateAdapter<T>>(DateAdapter);
    readonly dateFormatter = inject<DateFormatter<T>>(DateFormatter);

    readonly providedDefaultTimeRangeTypes =
        inject(KBQ_DEFAULT_TIME_RANGE_TYPES, { optional: true }) || defaultTimeRangeTypes;

    readonly customTimeRangeTypes = inject(KBQ_CUSTOM_TIME_RANGE_TYPES, { optional: true });

    readonly DEFAULT_RANGE_TYPE: KbqTimeRangeType = 'lastHour';

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

    getTimeRangeTypeUnits(type: KbqTimeRangeType): KbqTimeRangeUnits {
        return this.timeRangeConfig[type].units;
    }

    getTimeRangeUnitByType(type: KbqTimeRangeType): KbqTimeRangeTranslationType {
        return this.timeRangeConfig[type].translationType;
    }

    getDefaultRangeValue(): Required<KbqRangeValue<T>> {
        const from = this.dateAdapter!.addCalendarUnits(this.dateAdapter!.today(), { days: -1 });
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

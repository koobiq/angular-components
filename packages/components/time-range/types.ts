import { DurationUnit } from '@koobiq/date-adapter';

export interface KbqRangeValue<T> {
    fromTime?: T;
    fromDate?: T;
    toTime?: T;
    toDate?: T;
}

export interface KbqRange {
    startDateTime?: string;
    endDateTime?: string;
}

export interface KbqTimeRangeRange extends KbqRange {
    type: KbqTimeRangeType;
}

/**
 * Default accepted “time‑range” identifiers.
 */
export type KbqTimeRangeType =
    | 'lastMinute'
    | 'last5Minutes'
    | 'last15Minutes'
    | 'last30Minutes'
    | 'lastHour'
    | 'last24Hours'
    | 'last3Days'
    | 'last7Days'
    | 'last14Days'
    | 'last30Days'
    | 'last3Months'
    | 'last12Months'
    | 'allTime'
    | 'currentQuarter'
    | 'currentYear'
    | 'range';

export type KbqTimeRangeTranslationType = Extract<DurationUnit, 'minutes' | 'hours' | 'days' | 'months'> | 'other';

export interface KbqTimeRangeUnits {
    minutes?: number;
    hours?: number;
    days?: number;
    months?: number;
}

export type KbqTimeRangeTitleContext = KbqTimeRangeRange & KbqTimeRangeUnits;
export type KbqTimeRangeCustomizableTitleContext = KbqTimeRangeTitleContext & {
    $implicit: KbqTimeRangeTitleContext;
};

export type KbqTimeRangeTranslateTypeMap = Record<KbqTimeRangeType, KbqTimeRangeTranslationType>;

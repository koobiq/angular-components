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

export interface KbqTimeRange extends KbqRange {
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

export interface KbqTimeRangeUnits {
    minutes?: number;
    hours?: number;
    days?: number;
    months?: number;
}

export type KbqTimeRangeTitleContext = KbqTimeRange & KbqTimeRangeUnits;
export type KbqTimeRangeCustomizableTitleContext = KbqTimeRangeTitleContext & {
    $implicit: KbqTimeRangeTitleContext;
};

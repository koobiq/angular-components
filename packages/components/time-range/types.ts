import { KbqPopoverTrigger } from '@koobiq/components/popover';
import { DurationUnit } from '@koobiq/date-adapter';

export interface KbqRangeValue<T> {
    fromTime?: T;
    fromDate?: T;
    toTime?: T;
    toDate?: T;
}

export type KbqRange = {
    startDateTime?: string;
    endDateTime?: string;
};

export type KbqTimeRangeRange = KbqRange & KbqTimeRangeTypeContext;

export type KbqTimeRangeTypeContext = {
    type: KbqTimeRangeType;
};

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

export type KbqTimeRangeTranslationType =
    | Extract<DurationUnit, 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months'>
    | 'other';

export interface KbqTimeRangeUnits {
    seconds?: number;
    minutes?: number;
    hours?: number;
    days?: number;
    weeks?: number;
    months?: number;
}

export type KbqTimeRangeTitleContext = KbqTimeRangeRange & KbqTimeRangeUnits;
export type KbqTimeRangeCustomizableTitleContext = Partial<KbqTimeRangeTitleContext> & {
    $implicit: Partial<KbqTimeRangeTitleContext> & { formattedDate: string; popover: KbqPopoverTrigger };
} & { formattedDate: string; popover: KbqPopoverTrigger };

export type KbqTimeRangeTranslateTypeMap = Record<KbqTimeRangeType, KbqTimeRangeTranslationType>;
export type KbqTimeRangeOptionContext = KbqTimeRangeTypeContext &
    KbqTimeRangeUnits & { translationType: KbqTimeRangeTranslationType };

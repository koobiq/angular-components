import { KbqPopoverTrigger } from '@koobiq/components/popover';
import { DurationObjectUnits, DurationUnit } from '@koobiq/date-adapter';

/**
 * Represents a time range with optional start and end date-time values.
 * Used as a form value when range in popover change.
 */
export interface KbqRangeValue<T> {
    fromTime?: T;
    fromDate?: T;
    toTime?: T;
    toDate?: T;
}

/**
 * Represents a time range with optional start and end date-time values.
 * Used as a range value by default.
 */
export type KbqRange = {
    startDateTime?: string;
    endDateTime?: string;
};

/** Range type selected */
export type KbqTimeRangeTypeContext = {
    type: KbqTimeRangeType;
};

/**
 * Main range information.
 * Used for a popover date range selection, when selected type is range,
 * and for trigger information calculation.
 */
export type KbqTimeRangeRange = KbqRange & KbqTimeRangeTypeContext;

/** Default accepted “time‑range” identifiers. */
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

/** Property representing duration output unit */
export type KbqTimeRangeTranslationType = Exclude<DurationUnit, 'quarters' | 'milliseconds'> | 'other';

/**
 * Configuration for a custom time range with duration metadata.
 * Defines a time range with its identifier, duration units, and optional fixed date range.
 */
export interface KbqTimeRangeUnits extends DurationObjectUnits {}

export type KbqCustomTimeRangeType = {
    /** time range identifier. Used as config key */
    type: KbqTimeRangeType | string;
    /** Duration metadata */
    units: KbqTimeRangeUnits;
    /** Property representing duration output unit */
    translationType: KbqTimeRangeTranslationType;
    /** Custom range of start/end date-times */
    range?: KbqRange;
};

/** Context for a time range trigger, combining range info and type. */
export type KbqTimeRangeTitleContext = KbqTimeRangeRange & KbqTimeRangeUnits;
/** Context for a time range trigger customization, combining meta information. */
export type KbqTimeRangeCustomizableTitleContext = Partial<KbqTimeRangeTitleContext> & {
    $implicit: Partial<KbqTimeRangeTitleContext> & { formattedDate: string; popover: KbqPopoverTrigger };
} & { formattedDate: string; popover: KbqPopoverTrigger };

/** @docs-private */
export type KbqTimeRangeTranslateTypeMap = Record<KbqTimeRangeType, KbqTimeRangeTranslationType>;
/** Context for a time range option customization, combining meta information. */
export type KbqTimeRangeOptionContext = KbqTimeRangeTypeContext &
    KbqTimeRangeUnits & { translationType: KbqTimeRangeTranslationType; formattedValue: string };

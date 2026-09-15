import { coerceNumberProperty } from '@angular/cdk/coercion';
import { inject, Injectable, InjectionToken, Pipe, PipeTransform, Provider } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    KBQ_DEFAULT_LOCALE_ID,
    KBQ_LOCALE_ID,
    KBQ_LOCALE_SERVICE,
    KbqFormattersLocaleConfiguration,
    kbqInjectLocaleConfiguration,
    kbqLocaleConfigurationOverrideProvider,
    KbqLocaleService,
    KbqNumberFormatOptions,
    KbqNumberRoundingLocaleConfiguration,
    ruRUFormattersData
} from '../../locales';
import { KbqDeepPartial } from '../../utils';

export const KBQ_NUMBER_FORMATTER_OPTIONS = new InjectionToken<ParsedDigitsInfo>('KbqNumberFormatterOptions');

/**
 * Localization configuration provider for the number formatting rules — the decimal separators the
 * pipes apply on top of `Intl.NumberFormat`, and the abbreviations `kbqRoundNumber` renders.
 *
 * Supplies the defaults only: the active locale wins over it, and
 * {@link kbqFormattersLocaleConfigurationProvider} wins over both.
 */
export const KBQ_FORMATTERS_LOCALE_CONFIGURATION = new InjectionToken<KbqFormattersLocaleConfiguration>(
    'KbqFormattersLocaleConfiguration',
    { factory: () => ruRUFormattersData.formatters }
);

/**
 * Utility provider. Only the rules you pass are overridden; the rest keep following the active locale.
 *
 * @see KBQ_FORMATTERS_LOCALE_CONFIGURATION
 */
export const kbqFormattersLocaleConfigurationProvider = (
    configuration: KbqDeepPartial<KbqFormattersLocaleConfiguration>
): Provider => kbqLocaleConfigurationOverrideProvider('formatters', configuration);

/**
 * Decimal formatting rules of `locale`, or `undefined` to leave `Intl.NumberFormat` alone.
 *
 * Only the active locale carries the consumer overrides, so an explicitly passed one is answered from the
 * raw locale data — and an id that was never registered has no entry at all, which is why the lookup is
 * guarded and not just the service. Without a locale service there is no active locale to speak of: the
 * token still resolves to its `ru-RU` factory default, and applying that to whatever `KBQ_LOCALE_ID` says
 * would rewrite the group separator of an app that never opted into localization.
 */
const decimalFor = (
    formatters: KbqFormattersLocaleConfiguration,
    localeService: KbqLocaleService | null,
    activeLocale: string | null,
    locale: string
): KbqNumberFormatOptions | undefined =>
    localeService && locale === (activeLocale || KBQ_DEFAULT_LOCALE_ID)
        ? formatters.number.decimal
        : localeService?.locales[locale]?.formatters.number.decimal;

export const KBQ_NUMBER_FORMATTER_DEFAULT_OPTIONS: ParsedDigitsInfo = {
    useGrouping: true,
    minimumIntegerDigits: 1,
    minimumFractionDigits: 0,
    maximumFractionDigits: 3
};

/** Formats a number value according to locale and formatting options */
export function formatNumberWithLocale(
    value: unknown,
    formatter: Intl.NumberFormat,
    options?: KbqNumberFormatOptions
): string {
    const num = strToNumber(value);

    if (!options?.viewGroupSeparator) return formatter.format(num);

    const numberFormatParts = formatter.formatToParts(num);

    for (const numberFormatPart of numberFormatParts) {
        if (numberFormatPart.type === 'group') {
            numberFormatPart.value = options.viewGroupSeparator;
        }
    }

    return numberFormatParts.map(({ value }) => value).join('');
}

/**
 * Special contract between `KbqDecimalPipe` and `KbqTableNumberPipe`,
 * so they can be interchangeable in the cases of usage
 */
export interface KbqNumericPipe {
    transform(value: unknown, digitsInfo?: string, locale?: string): string | null;
}

function isEmpty(value: any): boolean {
    return value == null || value === '' || value !== value;
}

function strToNumber(value: unknown): number {
    const coerced = coerceNumberProperty(value, null);

    if (coerced === null) {
        throw new Error(`${value} is not a number`);
    }

    return coerced;
}

export const NUMBER_FORMAT_REGEXP = /^(\d+)?\.((\d+)(-(\d+))?(-(true|false))?)?$/;

const minIntGroupPosition = 1;
const minFractionGroupPosition = 3;
const maxFractionGroupPosition = 5;
const useGroupingPosition = 7;

type RoundDecimalOptions = KbqNumberRoundingLocaleConfiguration & {
    /** Label for the ten-thousand unit. */
    tenThousand?: string;
    /** Label for the one-hundred-millions unit. */
    oneHundredMillions?: string;
    rtl?: boolean;
};

const ROUNDING_UNITS = {
    thousand: 1e3,
    tenThousand: 10 * 1e3,
    million: 1e6,
    oneHundredMillions: 100 * 1e6,
    billion: 1e9,
    trillion: 1e12
};

/** Rounding units that carry a localized label in `KbqNumberRoundingLocaleConfiguration`. */
type RoundingUnit = keyof RoundDecimalOptions & keyof typeof ROUNDING_UNITS;

const intervalsConfig = {
    supportedLanguages: ['ru-RU', 'en-US', 'es-LA', 'pt-BR'],
    intervals: [
        { startRange: 1, endRange: ROUNDING_UNITS.thousand },
        { startRange: ROUNDING_UNITS.thousand, endRange: ROUNDING_UNITS.tenThousand, precision: 1 },
        { startRange: ROUNDING_UNITS.tenThousand, endRange: ROUNDING_UNITS.million },
        { startRange: ROUNDING_UNITS.million, endRange: ROUNDING_UNITS.million * 10, precision: 1 },
        { startRange: ROUNDING_UNITS.million * 10, endRange: ROUNDING_UNITS.billion }
    ]
};

class ParsedDigitsInfo {
    useGrouping: boolean;
    minimumIntegerDigits: number;
    minimumFractionDigits: number;
    maximumFractionDigits: number;
}

const defaultValueForGroupingInRULocale: number = 10000;

function parseDigitsInfo(digitsInfo: string): ParsedDigitsInfo {
    const parts = digitsInfo.match(NUMBER_FORMAT_REGEXP);

    if (parts === null) {
        throw new Error(`${digitsInfo} is not a valid digit info`);
    }

    const minIntPart = parts[minIntGroupPosition];
    const minFractionPart = parts[minFractionGroupPosition];
    const maxFractionPart = parts[maxFractionGroupPosition];
    const useGroupingPart = parts[useGroupingPosition];

    const result = new ParsedDigitsInfo();

    if (minIntPart != null) {
        result.minimumIntegerDigits = parseInt(minIntPart);
    }

    if (minFractionPart != null) {
        result.minimumFractionDigits = parseInt(minFractionPart);
    }

    if (maxFractionPart != null) {
        result.maximumFractionDigits = parseInt(maxFractionPart);
    } else if (minFractionPart != null && result.minimumFractionDigits > result.maximumFractionDigits) {
        result.maximumFractionDigits = result.minimumFractionDigits;
    }

    if (useGroupingPart != null) {
        result.useGrouping = useGroupingPart === 'true';
    }

    return result;
}

@Injectable({ providedIn: 'root' })
@Pipe({
    name: 'kbqNumber',
    pure: false
})
export class KbqDecimalPipe implements KbqNumericPipe, PipeTransform {
    private id = inject(KBQ_LOCALE_ID, { optional: true });
    private localeService = inject<KbqLocaleService>(KBQ_LOCALE_SERVICE, { optional: true });
    private readonly options = inject<ParsedDigitsInfo>(KBQ_NUMBER_FORMATTER_OPTIONS, { optional: true })!;
    private readonly formatters = kbqInjectLocaleConfiguration('formatters', KBQ_FORMATTERS_LOCALE_CONFIGURATION);

    constructor() {
        this.options = this.options || KBQ_NUMBER_FORMATTER_DEFAULT_OPTIONS;

        this.localeService?.changes.pipe(takeUntilDestroyed()).subscribe((newId: string) => (this.id = newId));
    }

    /**
     * @param value The number to be formatted.
     * @param digitsInfo Decimal representation options, specified by a string
     * in the following format:<br>
     * <code>{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}</code>.
     *   - `minIntegerDigits`: The minimum number of integer digits before the decimal point.
     * Default is `1`.
     *   - `minFractionDigits`: The minimum number of digits after the decimal point.
     * Default is `0`.
     *   - `maxFractionDigits`: The maximum number of digits after the decimal point.
     * Default is `3`.
     * @param locale A locale code for the locale format rules to use.
     * When not supplied, uses the value of `KBQ_LOCALE_ID`, which is `ru` by default.
     */
    transform(value: any, digitsInfo?: string, locale?: string): string | null {
        if (isEmpty(value)) {
            return null;
        }

        const currentLocale = locale || this.id || KBQ_DEFAULT_LOCALE_ID;

        let parsedDigitsInfo: ParsedDigitsInfo | undefined;

        if (digitsInfo) {
            parsedDigitsInfo = parseDigitsInfo(digitsInfo);
        }

        const options: Intl.NumberFormatOptions = {
            ...this.options,
            ...parsedDigitsInfo
        };

        if (this.isSpecialFormatForRULocale(currentLocale, value, parsedDigitsInfo?.useGrouping)) {
            options.useGrouping = false;
        }

        try {
            const formatter = new Intl.NumberFormat(currentLocale, options);

            return formatNumberWithLocale(
                value,
                formatter,
                decimalFor(this.formatters(), this.localeService, this.id, currentLocale)
            );
        } catch (error: any) {
            throw Error(`InvalidPipeArgument: KbqDecimalPipe for pipe '${JSON.stringify(error.message)}'`);
        }
    }

    isSpecialFormatForRULocale(locale: string, value: number, grouping?: boolean): boolean {
        return (
            ['ru', 'ru-RU'].includes(locale) &&
            grouping === undefined &&
            Math.abs(value) < defaultValueForGroupingInRULocale
        );
    }
}

@Injectable({ providedIn: 'root' })
@Pipe({
    name: 'kbqTableNumber',
    pure: false
})
export class KbqTableNumberPipe implements KbqNumericPipe, PipeTransform {
    private id = inject(KBQ_LOCALE_ID, { optional: true });
    private localeService = inject<KbqLocaleService>(KBQ_LOCALE_SERVICE, { optional: true });
    private readonly options = inject<ParsedDigitsInfo>(KBQ_NUMBER_FORMATTER_OPTIONS, { optional: true })!;
    private readonly formatters = kbqInjectLocaleConfiguration('formatters', KBQ_FORMATTERS_LOCALE_CONFIGURATION);

    constructor() {
        this.options = this.options || KBQ_NUMBER_FORMATTER_DEFAULT_OPTIONS;

        this.localeService?.changes.pipe(takeUntilDestroyed()).subscribe((newId: string) => (this.id = newId));
    }

    /**
     * @param value The number to be formatted.
     * @param digitsInfo Decimal representation options, specified by a string
     * in the following format:<br>
     * <code>{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}</code>.
     *   - `minIntegerDigits`: The minimum number of integer digits before the decimal point.
     * Default is `1`.
     *   - `minFractionDigits`: The minimum number of digits after the decimal point.
     * Default is `0`.
     *   - `maxFractionDigits`: The maximum number of digits after the decimal point.
     * Default is `3`.
     * @param locale A locale code for the locale format rules to use.
     * When not supplied, uses the value of `KBQ_LOCALE_ID`, which is `ru` by default.
     */
    transform(value: any, digitsInfo?: string, locale?: string): string | null {
        if (isEmpty(value)) {
            return null;
        }

        const currentLocale = locale || this.id || KBQ_DEFAULT_LOCALE_ID;

        let parsedDigitsInfo: ParsedDigitsInfo | undefined;

        if (digitsInfo) {
            parsedDigitsInfo = parseDigitsInfo(digitsInfo);
        }

        const options: Intl.NumberFormatOptions = {
            ...this.options,
            ...parsedDigitsInfo
        };

        try {
            const formatter = new Intl.NumberFormat(currentLocale, options);

            return formatNumberWithLocale(
                value,
                formatter,
                decimalFor(this.formatters(), this.localeService, this.id, currentLocale)
            );
        } catch (error: any) {
            throw Error(`InvalidPipeArgument: KbqTableNumberPipe for pipe '${JSON.stringify(error.message)}'`);
        }
    }
}

export function isWithin(startRange: number, endRange: number, valueToCheck: number): boolean {
    return startRange <= valueToCheck && valueToCheck < endRange;
}

@Injectable({ providedIn: 'root' })
@Pipe({
    name: 'kbqRoundNumber',
    pure: false
})
export class KbqRoundDecimalPipe implements PipeTransform {
    private id = inject(KBQ_LOCALE_ID, { optional: true });
    private localeService = inject<KbqLocaleService>(KBQ_LOCALE_SERVICE, { optional: true });
    roundingOptions: RoundDecimalOptions;
    private readonly formatters = kbqInjectLocaleConfiguration('formatters', KBQ_FORMATTERS_LOCALE_CONFIGURATION);

    constructor() {
        this.localeService?.changes.pipe(takeUntilDestroyed()).subscribe((newId: string) => (this.id = newId));
    }

    // @TODO: update returned type to string | null. Breaking change
    transform(value: any, locale?: string): any {
        if (isEmpty(value)) {
            return null;
        }

        const currentLocale: string = locale || this.id || KBQ_DEFAULT_LOCALE_ID;

        // Only the active locale carries the consumer overrides; an explicitly passed locale is a request
        // for that locale's own rules, and one that was never registered has no entry at all.
        this.roundingOptions =
            currentLocale === (this.id || KBQ_DEFAULT_LOCALE_ID)
                ? this.formatters().number.rounding
                : (this.localeService?.locales[currentLocale]?.formatters.number.rounding ??
                  ruRUFormattersData.formatters.number.rounding);

        try {
            const num = strToNumber(value);
            const unit = this.calculateUnit(num);

            if (!unit) {
                return Intl.NumberFormat.call(this, currentLocale, { useGrouping: false }).format(num);
            }

            let parts: { num?: number; fraction?: number } = {};

            if (intervalsConfig.supportedLanguages.includes(currentLocale)) {
                intervalsConfig.intervals.find(({ startRange, endRange, precision }) => {
                    const within = isWithin(startRange, endRange, num);

                    if (within) {
                        if (precision) {
                            parts =
                                unit === 'thousand'
                                    ? this.calculatePartsForThousands(num)
                                    : {
                                          num: Math.trunc(num / ROUNDING_UNITS[unit]),
                                          fraction: this.calculateDecimal(num, ROUNDING_UNITS[unit])
                                      };
                        } else {
                            parts = { num: Math.round(num / ROUNDING_UNITS[unit]) };
                        }
                    }

                    return within;
                });
            }

            parts = parts.num
                ? parts
                : {
                      num: Math.trunc(num / ROUNDING_UNITS[unit]),
                      fraction: this.calculateDecimal(num, ROUNDING_UNITS[unit])
                  };
            Object.keys(parts).forEach((key) => {
                parts[key] = Intl.NumberFormat.call(this, currentLocale, { useGrouping: false }).format(parts[key]);
            });

            const calculatedValue = parts.fraction
                ? `${parts.num}${this.roundingOptions.groupSeparator}${parts.fraction}`
                : `${parts.num}`;

            return `${calculatedValue}${this.roundingOptions.separator}${this.roundingOptions[unit]}`;
        } catch (error: any) {
            throw Error(`InvalidPipeArgument: KbqRoundDecimalPipe for pipe '${JSON.stringify(error.message)}'`);
        }
    }

    private calculateDecimal(num: number, divider: number) {
        return Math.round(((num / divider) % 1) * 10);
    }

    /**
     * 2 * 1000 is a number in the interval of [1500...2500)
     *
     * 2,0 * 1000 is a number in the interval of [1950...2050)
     */
    private calculatePartsForThousands(num: number) {
        const dividedValue = num / ROUNDING_UNITS.thousand;
        const div = Math.round(dividedValue) * ROUNDING_UNITS.thousand;
        const fifty = 50;

        return isWithin(div - fifty, div + fifty, num)
            ? { num: Math.round(dividedValue), fraction: 0 }
            : { num: Math.round(dividedValue) };
    }

    private calculateUnit(num: number): RoundingUnit | undefined {
        let currentUnit: RoundingUnit | undefined;
        const localizedOptions = Object.keys(this.roundingOptions);

        (Object.keys(ROUNDING_UNITS) as RoundingUnit[]).every((key) => {
            if (!localizedOptions.includes(key)) {
                return true;
            }

            if (num / ROUNDING_UNITS[key] >= 1) {
                currentUnit = key;

                return true;
            }

            return false;
        });

        return currentUnit;
    }
}

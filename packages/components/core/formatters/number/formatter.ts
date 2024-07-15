/* tslint:disable:naming-convention */
import { Inject, Injectable, InjectionToken, Optional, Pipe, PipeTransform } from '@angular/core';
import { KBQ_DEFAULT_LOCALE_ID, KBQ_LOCALE_ID, KBQ_LOCALE_SERVICE, KbqLocaleService } from '../../locales';

export const KBQ_NUMBER_FORMATTER_OPTIONS = new InjectionToken<string>('KbqNumberFormatterOptions');

export const KBQ_NUMBER_FORMATTER_DEFAULT_OPTIONS: ParsedDigitsInfo = {
    useGrouping: true,
    minimumIntegerDigits: 1,
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
};

function isEmpty(value: any): boolean {
    return value == null || value === '' || value !== value;
}

function strToNumber(value: number | string): number {
    if (typeof value === 'string' && !isNaN(Number(value) - parseFloat(value))) {
        return Number(value);
    }

    if (typeof value !== 'number') {
        throw new Error(`${value} is not a number`);
    }

    return value;
}

export const NUMBER_FORMAT_REGEXP = /^(\d+)?\.((\d+)(-(\d+))?(-(true|false))?)?$/;

const minIntGroupPosition = 1;
const minFractionGroupPosition = 3;
const maxFractionGroupPosition = 5;
const useGroupingPosition = 7;

interface NumberFormatOptions {
    useGrouping: boolean;

    minimumIntegerDigits: number;
    minimumFractionDigits: number;
    maximumFractionDigits: number;
    minimumSignificantDigits: number;
    maximumSignificantDigits: number;

    localeMatcher?: string;
    style?: string;

    currency?: string;
    currencyDisplay?: string;
}

interface RoundDecimalOptions {
    separator: string;
    groupSeparator: string;
    thousands?: string;
    tenThousand?: string;
    million?: string;
    oneHundredMillions?: string;
    billion?: string;
    trillion: string;
    rtl?: boolean;
}

// tslint:disable:no-magic-numbers
const ROUNDING_UNITS = {
    thousand: 1e3,
    tenThousand: 10 * 1e3,
    million: 1e6,
    oneHundredMillions: 100 * 1e6,
    billion: 1e9,
    trillion: 1e12,
};

const intervalsConfig = {
    supportedLanguages: ['ru-RU', 'en-US', 'es-LA', 'pt-BR', 'fa-IR'],
    intervals: [
        { startRange: 1, endRange: ROUNDING_UNITS.thousand },
        { startRange: ROUNDING_UNITS.thousand, endRange: ROUNDING_UNITS.tenThousand, precision: 1 },
        { startRange: ROUNDING_UNITS.tenThousand, endRange: ROUNDING_UNITS.million },
        { startRange: ROUNDING_UNITS.million, endRange: ROUNDING_UNITS.million * 10, precision: 1 },
        { startRange: ROUNDING_UNITS.million * 10, endRange: ROUNDING_UNITS.billion },
    ],
};
// tslint:enable:no-magic-numbers

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
@Pipe({ name: 'kbqNumber', pure: false })
export class KbqDecimalPipe implements PipeTransform {
    constructor(
        @Optional() @Inject(KBQ_LOCALE_ID) private id: string,
        @Optional() @Inject(KBQ_LOCALE_SERVICE) private localeService: KbqLocaleService,
        @Optional() @Inject(KBQ_NUMBER_FORMATTER_OPTIONS) private readonly options: ParsedDigitsInfo,
    ) {
        this.options = this.options || KBQ_NUMBER_FORMATTER_DEFAULT_OPTIONS;

        this.localeService?.changes.subscribe((newId: string) => (this.id = newId));
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

        let parsedDigitsInfo;

        if (digitsInfo) {
            parsedDigitsInfo = parseDigitsInfo(digitsInfo);
        }

        const options: NumberFormatOptions = {
            ...this.options,
            ...parsedDigitsInfo,
        };

        if (this.isSpecialFormatForRULocale(currentLocale, value, parsedDigitsInfo?.useGrouping)) {
            options.useGrouping = false;
        }

        try {
            const num = strToNumber(value);

            /* Guideline requires for group separator to be `space`, as in 'ru-RU' locale.
             * But by default in es-LA locale is used `comma`.
             * To reduce data manipulation, 'ru-RU' locale is used. */
            if (currentLocale === 'es-LA') {
                return Intl.NumberFormat.call(this, 'ru-RU', options).format(num);
            }

            return Intl.NumberFormat.call(this, currentLocale, options).format(num);
        } catch (error: any) {
            throw Error(`InvalidPipeArgument: KbqDecimalPipe for pipe '${JSON.stringify(error.message)}'`);
        }
    }

    isSpecialFormatForRULocale(locale: string, value: number, grouping?: boolean): boolean {
        return ['ru', 'ru-RU'].includes(locale) && grouping === undefined && value < defaultValueForGroupingInRULocale;
    }
}

@Injectable({ providedIn: 'root' })
@Pipe({ name: 'kbqTableNumber', pure: false })
export class KbqTableNumberPipe implements PipeTransform {
    constructor(
        @Optional() @Inject(KBQ_LOCALE_ID) private id: string,
        @Optional() @Inject(KBQ_LOCALE_SERVICE) private localeService: KbqLocaleService,
        @Optional() @Inject(KBQ_NUMBER_FORMATTER_OPTIONS) private readonly options: ParsedDigitsInfo,
    ) {
        this.options = this.options || KBQ_NUMBER_FORMATTER_DEFAULT_OPTIONS;

        this.localeService?.changes.subscribe((newId: string) => (this.id = newId));
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

        let parsedDigitsInfo;

        if (digitsInfo) {
            parsedDigitsInfo = parseDigitsInfo(digitsInfo);
        }

        const options: NumberFormatOptions = {
            ...this.options,
            ...parsedDigitsInfo,
        };

        try {
            const num = strToNumber(value);

            /* Guideline requires for group separator to be `space`, as in 'ru-RU' locale.
             * But by default in es-LA locale is used `comma`.
             * To reduce data manipulation, 'ru-RU' locale is used. */
            if (currentLocale === 'es-LA') {
                return Intl.NumberFormat.call(this, 'ru-RU', options).format(num);
            }

            return Intl.NumberFormat.call(this, currentLocale, options).format(num);
        } catch (error: any) {
            throw Error(`InvalidPipeArgument: KbqTableNumberPipe for pipe '${JSON.stringify(error.message)}'`);
        }
    }
}

export function isWithin(startRange: number, endRange: number, valueToCheck: number): boolean {
    return startRange <= valueToCheck && valueToCheck < endRange;
}

@Injectable({ providedIn: 'root' })
@Pipe({ name: 'kbqRoundNumber', pure: false })
export class KbqRoundDecimalPipe implements PipeTransform {
    roundingOptions: RoundDecimalOptions;

    constructor(
        @Optional() @Inject(KBQ_LOCALE_ID) private id: string,
        @Optional() @Inject(KBQ_LOCALE_SERVICE) private localeService: KbqLocaleService,
    ) {
        this.localeService?.changes.subscribe((newId: string) => (this.id = newId));
    }

    transform(value: any, locale?: string): any {
        if (isEmpty(value)) {
            return null;
        }

        const currentLocale: string = locale || this.id || KBQ_DEFAULT_LOCALE_ID;
        this.roundingOptions = this.localeService.locales[currentLocale].formatters.number.rounding;

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
                                          fraction: this.calculateDecimal(num, ROUNDING_UNITS[unit]),
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
                      fraction: this.calculateDecimal(num, ROUNDING_UNITS[unit]),
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
        /* tslint:disable-next-line:no-magic-numbers */
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

    private calculateUnit(num: number): string | undefined {
        let currentUnit: string | undefined;
        const localizedOptions = Object.keys(this.roundingOptions);

        Object.keys(ROUNDING_UNITS).every((key) => {
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

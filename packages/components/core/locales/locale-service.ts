import { DOCUMENT } from '@angular/common';
import { Inject, inject, Injectable, InjectionToken, Optional, Provider } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { enUSLocaleData } from './en-US';
import { esLALocaleData } from './es-LA';
import {
    enUSFormattersData,
    esLAFormattersData,
    ptBRFormattersData,
    ruRUFormattersData,
    tkTMFormattersData
} from './formatters';
import { ptBRLocaleData } from './pt-BR';
import { ruRULocaleData } from './ru-RU';
import { tkTMLocaleData } from './tk-TM';

export const KBQ_LOCALE_ID = new InjectionToken<string>('KbqLocaleId');

export const KBQ_DEFAULT_LOCALE_ID = 'ru-RU';

export function KBQ_DEFAULT_LOCALE_DATA_FACTORY() {
    return {
        items: [
            { id: 'en-US', name: 'English' },
            { id: 'es-LA', name: 'Español' },
            { id: 'pt-BR', name: 'Português' },
            { id: 'ru-RU', name: 'Русский' },
            { id: 'tk-TM', name: 'Türkmen' }
        ],
        'en-US': { ...enUSLocaleData, ...enUSFormattersData },
        'es-LA': { ...esLALocaleData, ...esLAFormattersData },
        'pt-BR': { ...ptBRLocaleData, ...ptBRFormattersData },
        'ru-RU': { ...ruRULocaleData, ...ruRUFormattersData },
        'tk-TM': { ...tkTMLocaleData, ...tkTMFormattersData }
    };
}
export const KBQ_LOCALE_DATA = new InjectionToken<any>('KBQ_LOCALE_DATA', {
    providedIn: 'root',
    factory: KBQ_DEFAULT_LOCALE_DATA_FACTORY
});

export const KBQ_LOCALE_SERVICE = new InjectionToken<KbqLocaleService>('KBQ_LOCALE_SERVICE');

/**
 * Attribute name to be used to set the locale in the html element.
 *
 * @default 'lang'
 *
 * @docs-private
 */
export const KBQ_LOCALE_SERVICE_LANG_ATTR_NAME = new InjectionToken<string>('KBQ_LOCALE_SERVICE_LANG_ATTR_NAME', {
    factory: () => 'lang'
});

/**
 * Utility provider to configure the attribute name to be used to set the locale in the html element.
 *
 * @see KBQ_LOCALE_SERVICE_LANG_ATTR_NAME
 *
 * @docs-private
 */
export const kbqLocaleServiceLangAttrNameProvider = (attrName: string): Provider => ({
    provide: KBQ_LOCALE_SERVICE_LANG_ATTR_NAME,
    useValue: attrName
});

@Injectable({ providedIn: 'root' })
export class KbqLocaleService {
    readonly changes: BehaviorSubject<string>;
    readonly locales: any = {};

    private readonly document = inject(DOCUMENT);

    id: string;
    current;

    private readonly langAttrName = inject(KBQ_LOCALE_SERVICE_LANG_ATTR_NAME);

    constructor(@Optional() @Inject(KBQ_LOCALE_ID) id: string, @Optional() @Inject(KBQ_LOCALE_DATA) localeData) {
        this.locales = localeData;

        this.id = id || KBQ_DEFAULT_LOCALE_ID;
        this.current = this.locales[this.id];

        this.changes = new BehaviorSubject(this.id);
    }

    setLocale(id: string) {
        this.id = id;
        this.current = this.locales[this.id];

        this.document.documentElement.setAttribute(this.langAttrName, this.id);

        this.changes.next(this.id);
    }

    addLocale(id: string, localeData) {
        this.id = id;
        this.changes.next(this.id);

        this.locales[this.id] = localeData;
    }

    getParams(componentName: string) {
        return this.current[componentName];
    }
}

// todo code below need refactor or delete in DS-3603
export function numberByParts(
    value: string,
    fractionSeparator: string,
    groupSeparator: string
): { integer: string; fraction: string } {
    const result = { integer: '', fraction: '' };

    const isNegative = value.startsWith('-');
    const numberByParts = value.split(fractionSeparator).filter(Boolean);

    if (numberByParts.length > 1) {
        result.fraction = numberByParts.pop() || '';
        result.integer = numberByParts
            .join()
            .replace(groupSeparator, '')
            .replace(fractionSeparator, '')
            .replace(/\D/g, '');
    } else {
        result.integer = numberByParts.join().replace(groupSeparator[0], '').replace(/\D/g, '');
    }

    if (isNegative) result.integer = `-${result.integer}`;

    return result;
}

/**
 * Function that returns a string representation of a number without localized separators
 */
export function normalizeNumber(
    value: string | null | undefined,
    customConfig: { groupSeparator: string[]; fractionSeparator: string }
): string {
    if (value === null || value === undefined) return '';

    const { groupSeparator, fractionSeparator } = customConfig;
    const groupSeparatorRegexp = new RegExp(`[${groupSeparator.join('')}]`, 'g');
    const fractionSeparatorRegexp = new RegExp(`\\${fractionSeparator}`, 'g');

    return value.toString().replace(groupSeparatorRegexp, '').replace(fractionSeparatorRegexp, '.');
}

/**
 * Function that parse string and return a number. The string can be in any locale.
 */
export function checkAndNormalizeLocalizedNumber(num: string | null | undefined, locale?: string): number | null {
    if (num === null || num === undefined) return null;

    const locales = KBQ_DEFAULT_LOCALE_DATA_FACTORY();

    if (locale && locales[locale]) {
        const config = locales[locale].input.number;
        let normalized: number;

        if (!/\d/g.test(num)) return +num;

        const { groupSeparator, fractionSeparator } = config;
        const { integer, fraction } = numberByParts(num, fractionSeparator, groupSeparator.join(''));

        const fractionSeparatorRegexp = new RegExp(`\\${fractionSeparator}`, 'g');

        if (fraction) {
            normalized = +[integer, fraction].join('.');
        } else {
            normalized = +integer.replace(fractionSeparatorRegexp, '.');
        }

        if (!Number.isNaN(normalized)) {
            return normalized;
        }
    }

    /* if some locale input config satisfies pasted number, try to normalise with selected locale config */
    let numberOutput: number | null = null;

    for (const config of locales.items.map(({ id }) => locales[id].input.number)) {
        const normalized = +normalizeNumber(num, config);

        if (!Number.isNaN(normalized)) {
            numberOutput = normalized;
            break;
        }
    }

    return numberOutput;
}

// todo code above need refactor or delete in DS-3603

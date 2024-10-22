import { DOCUMENT } from '@angular/common';
import { Inject, inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { enUSLocaleData } from './en-US';
import { esLALocaleData } from './es-LA';
import { faIRLocaleData } from './fa-IR';
import {
    enUSFormattersData,
    esLAFormattersData,
    faIRFormattersData,
    ptBRFormattersData,
    ruRUFormattersData,
    zhCNFormattersData
} from './formatters';
import { ptBRLocaleData } from './pt-BR';
import { ruRULocaleData } from './ru-RU';
import { zhCNLocaleData } from './zh-CN';

export const KBQ_LOCALE_ID = new InjectionToken<string>('KbqLocaleId');

export const KBQ_DEFAULT_LOCALE_ID = 'ru-RU';

export function KBQ_DEFAULT_LOCALE_DATA_FACTORY() {
    return {
        items: [
            { id: 'en-US', name: 'English' },
            { id: 'zh-CN', name: '简体中文' },
            { id: 'es-LA', name: 'Español' },
            { id: 'pt-BR', name: 'Português' },
            { id: 'ru-RU', name: 'Русский' },
            { id: 'fa-IR', name: 'فارسی' }
        ],
        'en-US': { ...enUSLocaleData, ...enUSFormattersData },
        'zh-CN': { ...zhCNLocaleData, ...zhCNFormattersData },
        'es-LA': { ...esLALocaleData, ...esLAFormattersData },
        'pt-BR': { ...ptBRLocaleData, ...ptBRFormattersData },
        'ru-RU': { ...ruRULocaleData, ...ruRUFormattersData },
        'fa-IR': { ...faIRLocaleData, ...faIRFormattersData }
    };
}
export const KBQ_LOCALE_DATA = new InjectionToken<any>('KBQ_LOCALE_DATA', {
    providedIn: 'root',
    factory: KBQ_DEFAULT_LOCALE_DATA_FACTORY
});

export const KBQ_LOCALE_SERVICE = new InjectionToken<KbqLocaleService>('KBQ_LOCALE_SERVICE');

@Injectable({ providedIn: 'root' })
export class KbqLocaleService {
    readonly changes: BehaviorSubject<string>;
    readonly locales: any = {};

    private readonly document = inject(DOCUMENT);

    id: string;
    current;

    constructor(@Optional() @Inject(KBQ_LOCALE_ID) id: string, @Optional() @Inject(KBQ_LOCALE_DATA) localeData) {
        this.locales = localeData;

        this.id = id || KBQ_DEFAULT_LOCALE_ID;
        this.current = this.locales[this.id];

        this.changes = new BehaviorSubject(this.id);
    }

    setLocale(id: string) {
        this.id = id;
        this.current = this.locales[this.id];

        this.document.documentElement.lang = this.id;

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
export function checkAndNormalizeLocalizedNumber(num: string | null | undefined): number | null {
    if (num === null || num === undefined) return null;

    /* if some locale input config satisfies pasted number, try to normalise with selected locale config */
    let numberOutput: number | null = null;

    const locales = KBQ_DEFAULT_LOCALE_DATA_FACTORY();

    for (const config of locales.items.map(({ id }) => locales[id].input.number)) {
        const normalized = +normalizeNumber(num, config);

        if (!Number.isNaN(normalized)) {
            numberOutput = normalized;
            break;
        }
    }

    return numberOutput;
}

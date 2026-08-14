import { DOCUMENT } from '@angular/common';
import { computed, inject, Injectable, InjectionToken, Provider, Signal, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { kbqDeepMerge } from '../utils';
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
import {
    KbqLocaleData,
    KbqLocaleDataInput,
    KbqLocaleDataMap,
    KbqLocaleIdLike,
    KbqLocaleItem,
    KbqLocaleSection,
    KbqNumberInputLocaleConfiguration,
    KbqPartialLocaleData
} from './types';

export const KBQ_LOCALE_ID = new InjectionToken<KbqLocaleIdLike>('KbqLocaleId');

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
export const KBQ_LOCALE_DATA = new InjectionToken<KbqLocaleDataInput>('KBQ_LOCALE_DATA', {
    providedIn: 'root',
    factory: KBQ_DEFAULT_LOCALE_DATA_FACTORY
});

/**
 * Assembles the locale registry.
 *
 * `items` is not a locale, yet it has always shared this object with them — which no index signature can
 * express. {@link KbqLocaleDataMap} resolves that in favour of readers (`locales[id]` stays
 * `KbqLocaleData`), and this is the single place that has to assert the shape when building it.
 */
const asLocaleDataMap = (locales: Record<string, KbqLocaleData>, items: KbqLocaleItem[]): KbqLocaleDataMap =>
    Object.assign(locales, { items }) as KbqLocaleDataMap;

const { items: shippedLocaleItems, ...shippedLocales } = KBQ_DEFAULT_LOCALE_DATA_FACTORY();

/**
 * The locales shipped with the library, used as the merge base for consumer-supplied locale data: a
 * partial locale is completed from the shipped locale of the same id, or from {@link KBQ_DEFAULT_LOCALE_ID}
 * when the id is new.
 */
const SHIPPED_LOCALE_DATA = asLocaleDataMap(shippedLocales, shippedLocaleItems);

/** Completes one locale from the shipped locale of the same id, falling back to the default locale. */
const resolveLocaleData = (id: KbqLocaleIdLike, data: KbqPartialLocaleData | undefined): KbqLocaleData =>
    kbqDeepMerge(SHIPPED_LOCALE_DATA[id] ?? SHIPPED_LOCALE_DATA[KBQ_DEFAULT_LOCALE_ID], data);

const resolveLocaleDataMap = (input: KbqLocaleDataInput | null): KbqLocaleDataMap => {
    const source = input ?? SHIPPED_LOCALE_DATA;
    const items = source.items ?? SHIPPED_LOCALE_DATA.items;
    const locales: Record<string, KbqLocaleData> = {};

    // Every shipped locale and every offered `items` entry is registered, not just the ids the input
    // happens to patch: a partial input leaves `items` at the full shipped list, and a locale a picker
    // can activate must have data behind it — `setLocale` would otherwise leave `data()` undefined.
    const ids = new Set([...Object.keys(SHIPPED_LOCALE_DATA), ...Object.keys(source), ...items.map(({ id }) => id)]);

    for (const id of ids) {
        if (id === 'items') continue;

        locales[id] = resolveLocaleData(id, source[id] as KbqPartialLocaleData);
    }

    return asLocaleDataMap(locales, items);
};

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
    /**
     * Emits the active locale id on every change.
     *
     * Prefer the {@link localeId} signal in new code — a signal read from a template registers on the
     * reading view, which an observable subscribed in one component cannot do for its children.
     */
    readonly changes: BehaviorSubject<string>;

    /** Every registered locale keyed by id, plus the `items` list used to render locale pickers. */
    readonly locales: KbqLocaleDataMap;

    /** Active locale id. */
    readonly localeId: Signal<KbqLocaleIdLike>;

    /** Locale data of the active locale. Always complete — see {@link addLocale}. */
    readonly data: Signal<KbqLocaleData>;

    /** Registered locales, for rendering a locale picker. */
    readonly items: Signal<KbqLocaleItem[]>;

    private readonly document = inject(DOCUMENT);

    /** @deprecated Use the {@link localeId} signal. */
    get id(): string {
        return this._localeId();
    }

    set id(value: string) {
        this._localeId.set(value);
    }

    /** @deprecated Use the {@link data} signal. */
    get current(): KbqLocaleData {
        return this._data();
    }

    set current(value: KbqLocaleData) {
        this._data.set(value);
    }

    private readonly _localeId = signal<KbqLocaleIdLike>(KBQ_DEFAULT_LOCALE_ID);
    private readonly _data = signal<KbqLocaleData>(SHIPPED_LOCALE_DATA[KBQ_DEFAULT_LOCALE_ID]);
    private readonly _items = signal<KbqLocaleItem[]>(SHIPPED_LOCALE_DATA.items);

    private readonly langAttrName = inject(KBQ_LOCALE_SERVICE_LANG_ATTR_NAME);

    constructor() {
        const id = inject(KBQ_LOCALE_ID, { optional: true });
        const localeData = inject(KBQ_LOCALE_DATA, { optional: true });

        this.locales = resolveLocaleDataMap(localeData);

        this.localeId = this._localeId.asReadonly();
        this.data = this._data.asReadonly();
        this.items = this._items.asReadonly();

        this._localeId.set(id || KBQ_DEFAULT_LOCALE_ID);
        this._data.set(this.locales[this._localeId()]);
        this._items.set(this.locales.items);

        this.changes = new BehaviorSubject(this._localeId());
    }

    /**
     * Activates a locale.
     *
     * An id that was never registered is registered on the fly, completed from the shipped locale of that
     * id or from the default locale: {@link data} promises a complete locale, and code reading
     * `locales[id]` directly would otherwise be handed `undefined`.
     */
    setLocale(id: KbqLocaleIdLike) {
        this.locales[id] ??= resolveLocaleData(id, undefined);

        this._localeId.set(id);
        this._data.set(this.locales[id]);

        this.document.documentElement.setAttribute(this.langAttrName, id);

        this.changes.next(id);
    }

    /**
     * Registers a locale and activates it.
     *
     * The data may be partial: every section — and every key within a section — is optional, and whatever
     * is omitted is completed from the shipped locale of the same id, or from the default locale when the
     * id is new. That is what lets {@link getParams} promise a complete section for any registered locale.
     */
    addLocale(id: KbqLocaleIdLike, localeData: KbqPartialLocaleData) {
        this.locales[id] = resolveLocaleData(id, localeData);

        this.setLocale(id);
    }

    /**
     * Localized strings of one section of the active locale.
     *
     * Passing a known {@link KbqLocaleSection} resolves the precise configuration type; any other string
     * falls back to `any`, so dynamically-built section names keep working.
     */
    getParams<K extends KbqLocaleSection>(section: K): KbqLocaleData[K];
    getParams(section: string): any;
    getParams(section: string) {
        return this._data()?.[section] ?? SHIPPED_LOCALE_DATA[KBQ_DEFAULT_LOCALE_ID][section];
    }

    /** Reactive counterpart of {@link getParams}: re-emits whenever the locale changes. */
    params<K extends KbqLocaleSection>(section: K): Signal<KbqLocaleData[K]> {
        return computed(() => this.getParams(section));
    }
}

// todo code below need refactor or delete in DS-3603
/** @docs-private */
export const KBQ_DEFAULT_PRECISION_SEPARATOR = '.';

/** @docs-private */
export function numberByParts(
    value: string,
    customConfig: Pick<KbqNumberInputLocaleConfiguration, 'fractionSeparator' | 'groupSeparator'>
): { integer: string; fraction: string } {
    const { groupSeparator, fractionSeparator } = customConfig;
    const result = { integer: '', fraction: '' };
    let parsedValue = value;

    // normalize only when '.', ',' are used as fractionSeparators
    if (groupSeparator.includes(' ') && fractionSeparator === ',') {
        parsedValue = parsedValue.replace(/\./g, ',');
    }

    const isNegative = parsedValue.startsWith('-');
    const numberByParts = parsedValue.split(fractionSeparator).filter(Boolean);

    if (numberByParts.length > 1) {
        result.fraction = numberByParts.pop() || '';
        result.integer = numberByParts
            .join()
            .replace(groupSeparator.join(''), '')
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
    customConfig: Pick<KbqNumberInputLocaleConfiguration, 'fractionSeparator' | 'groupSeparator'>
): string {
    if (value === null || value === undefined) return '';

    const { groupSeparator, fractionSeparator } = customConfig;
    const groupSeparatorRegexp = new RegExp(`[${groupSeparator.join('')}]`, 'g');
    const fractionSeparatorRegexp = new RegExp(`\\${fractionSeparator}`, 'g');

    return value
        .toString()
        .replace(groupSeparatorRegexp, '')
        .replace(fractionSeparatorRegexp, KBQ_DEFAULT_PRECISION_SEPARATOR);
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

        const { integer, fraction } = numberByParts(num, config);

        if (fraction) {
            normalized = +[integer, fraction].join('.');
        } else {
            normalized = +normalizeNumber(integer, config);
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

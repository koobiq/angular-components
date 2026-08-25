import { DOCUMENT } from '@angular/common';
import { computed, inject, Injectable, InjectionToken, InjectOptions, Provider, Signal, signal } from '@angular/core';
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
        this._data.set(this.register(this._localeId()));
        this._items.set(this.locales.items);

        this.changes = new BehaviorSubject(this._localeId());
    }

    /** Activates a locale. */
    setLocale(id: KbqLocaleIdLike) {
        this._localeId.set(id);
        this._data.set(this.register(id));

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

    /**
     * Registers `id` unless the registry already holds it, and returns its complete data.
     *
     * Both the constructor and {@link setLocale} activate a locale, and either can be handed an id the
     * registry does not know — `KBQ_LOCALE_ID` accepts any string. {@link data} promises a complete locale,
     * and code reading `locales[id]` directly would otherwise be handed `undefined`.
     */
    private register(id: KbqLocaleIdLike): KbqLocaleData {
        return (this.locales[id] ??= resolveLocaleData(id, undefined));
    }
}

/**
 * Utility provider for the locale to activate.
 *
 * Belongs in the same `providers` array as {@link kbqLocaleServiceProvider}: the id is read once, by the
 * `KbqLocaleService` constructor, out of the injector that created the service. Use `setLocale()` to change
 * the locale afterwards.
 *
 * @see KBQ_LOCALE_ID
 */
export const kbqLocaleIDProvider = (localeId: KbqLocaleIdLike): Provider => ({
    provide: KBQ_LOCALE_ID,
    useValue: localeId
});

/**
 * Utility provider for the locale service. `KBQ_LOCALE_SERVICE` has no factory, so nothing is localized
 * until an application provides it.
 *
 * Provides the service next to the token rather than aliasing the class through `useClass`, which builds a
 * *second* instance: the one the components read then has nothing to do with the one `inject(KbqLocaleService)`
 * hands out, and `setLocale()` called on the latter moves nothing that is rendered.
 *
 * On a component it scopes the locale to that subtree — put {@link kbqLocaleIDProvider} in the same array to
 * pick the locale of that scope.
 *
 * @see KBQ_LOCALE_SERVICE
 */
export const kbqLocaleServiceProvider = (): Provider => [
    KbqLocaleService,
    { provide: KBQ_LOCALE_SERVICE, useExisting: KbqLocaleService }
];

/**
 * Reads the locale service the application provided.
 *
 * Resolves `KBQ_LOCALE_SERVICE`, not the class: the token is what the components read, and an application
 * is free to provide something else under it. Pass `{ optional: true }` for code that has to keep working
 * without a locale service — which is how every component of this library reads it.
 *
 * @see KBQ_LOCALE_SERVICE
 */
export function kbqInjectLocaleService(options?: InjectOptions & { optional?: false }): KbqLocaleService;
export function kbqInjectLocaleService(options: InjectOptions): KbqLocaleService | null;
export function kbqInjectLocaleService(options?: InjectOptions): KbqLocaleService | null {
    return inject(KBQ_LOCALE_SERVICE, options ?? {});
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

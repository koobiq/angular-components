import { TestBed } from '@angular/core/testing';
import { enUSLocaleData } from './en-US';
import { esLALocaleData } from './es-LA';
import { enUSFormattersData, ruRUFormattersData } from './formatters';
import {
    checkAndNormalizeLocalizedNumber,
    KBQ_DEFAULT_LOCALE_ID,
    KBQ_LOCALE_DATA,
    KBQ_LOCALE_ID,
    KbqLocaleService,
    kbqLocaleServiceLangAttrNameProvider,
    normalizeNumber,
    numberByParts
} from './locale-service';
import { ptBRLocaleData } from './pt-BR';
import { ruRULocaleData } from './ru-RU';
import { tkTMLocaleData } from './tk-TM';

const createService = (providers: unknown[] = []): KbqLocaleService => {
    TestBed.configureTestingModule({ providers: [KbqLocaleService, ...(providers as [])] });

    return TestBed.inject(KbqLocaleService);
};

describe('KbqLocaleService', () => {
    describe('active locale', () => {
        it('should fall back to the default locale when KBQ_LOCALE_ID is not provided', () => {
            const service = createService();

            expect(service.localeId()).toBe(KBQ_DEFAULT_LOCALE_ID);
            expect(service.data()).toBe(service.locales[KBQ_DEFAULT_LOCALE_ID]);
        });

        it('should use the locale provided through KBQ_LOCALE_ID', () => {
            const service = createService([{ provide: KBQ_LOCALE_ID, useValue: 'en-US' }]);

            expect(service.localeId()).toBe('en-US');
            expect(service.getParams('a11y').close).toBe(enUSLocaleData.a11y.close);
        });

        it('should change the lang attribute of the html element', () => {
            const locale = 'ru-RU';

            createService().setLocale(locale);

            expect(document.documentElement.lang).toBe(locale);
        });

        it('should use the attribute name configured through KBQ_LOCALE_SERVICE_LANG_ATTR_NAME', () => {
            const service = createService([kbqLocaleServiceLangAttrNameProvider('examples-lang')]);

            service.setLocale('en-US');

            expect(document.documentElement.getAttribute('examples-lang')).toBe('en-US');
        });

        it('should move the signals, the deprecated fields and the changes stream together', () => {
            const service = createService();
            const emitted: string[] = [];

            service.changes.subscribe((id) => emitted.push(id));
            service.setLocale('en-US');

            expect(service.localeId()).toBe('en-US');
            expect(service.id).toBe('en-US');
            expect(service.current).toBe(service.data());
            expect(service.data()).toBe(service.locales['en-US']);
            expect(emitted).toEqual([KBQ_DEFAULT_LOCALE_ID, 'en-US']);
        });

        it('should expose the registered locales for a locale picker', () => {
            const service = createService();

            expect(service.items()).toBe(service.locales.items);
            expect(service.items().map(({ id }) => id)).toContain(KBQ_DEFAULT_LOCALE_ID);
        });
    });

    describe('getParams', () => {
        it('should return the section of the active locale', () => {
            const service = createService();

            expect(service.getParams('select')).toBe(ruRULocaleData.select);

            service.setLocale('en-US');

            expect(service.getParams('select')).toBe(enUSLocaleData.select);
        });

        it('should fall back to the default locale for a section the active data does not carry', () => {
            const service = createService();

            // Only reachable by writing `current` directly, which the deprecated setter still allows.
            service.current = {} as never;

            expect(service.getParams('a11y')).toBe(ruRULocaleData.a11y);
        });
    });

    describe('addLocale', () => {
        it('should register and activate the locale', () => {
            const service = createService();

            service.addLocale('custom', { select: { selectAll: 'Everything' } });

            expect(service.localeId()).toBe('custom');
            expect(service.data()).toBe(service.locales.custom);
            expect(service.getParams('select').selectAll).toBe('Everything');
        });

        it('should complete a partial locale from the default locale', () => {
            const service = createService();

            service.addLocale('custom', { select: { selectAll: 'Everything' } });

            // The overridden section keeps the keys it did not mention...
            expect(service.getParams('select').hiddenItemsText).toBe(ruRULocaleData.select.hiddenItemsText);
            // ...and every untouched section stays referentially identical to the shipped data, which is
            // what lets consumers keep comparing sections by reference.
            expect(service.getParams('a11y')).toBe(ruRULocaleData.a11y);
            expect(service.getParams('codeBlock')).toBe(ruRULocaleData.codeBlock);
        });

        it('should complete a partial override of a shipped locale from that same locale', () => {
            const service = createService();

            service.addLocale('en-US', { select: { selectAll: 'Everything' } });

            expect(service.getParams('select').hiddenItemsText).toBe(enUSLocaleData.select.hiddenItemsText);
            expect(service.getParams('a11y')).toBe(enUSLocaleData.a11y);
        });

        it('should leave a section rendered by no component alone', () => {
            const service = createService();

            service.addLocale('custom', {});

            expect(service.getParams('navbar')).toBe(ruRULocaleData.navbar);
        });
    });

    describe('shipped locale data', () => {
        // Completing a locale from the default one must never reach the shipped locales themselves:
        // `formatters.number.decimal` exists for ru-RU only, and leaking it into en-US would silently
        // change the group separator of every en-US number.
        it('should not let one shipped locale inherit an optional key from another', () => {
            const service = createService();

            expect(ruRUFormattersData.formatters.number).toHaveProperty('decimal');
            expect(enUSFormattersData.formatters.number).not.toHaveProperty('decimal');
            expect(service.locales['en-US'].formatters.number.decimal).toBeUndefined();
        });

        it('should keep every shipped locale referentially identical to its source data', () => {
            const service = createService();

            expect(service.locales['en-US'].a11y).toBe(enUSLocaleData.a11y);
            expect(service.locales['ru-RU'].sizeUnits).toBe(ruRUFormattersData.sizeUnits);
        });

        it('should accept partial data through KBQ_LOCALE_DATA', () => {
            const service = createService([
                {
                    provide: KBQ_LOCALE_DATA,
                    useValue: { 'ru-RU': { select: { selectAll: 'Everything' } } }
                }
            ]);

            expect(service.getParams('select').selectAll).toBe('Everything');
            expect(service.getParams('a11y')).toBe(ruRULocaleData.a11y);
            expect(service.items()).toBe(service.locales.items);
        });
    });

    describe('locale registry', () => {
        // Any locale a picker can offer must have data behind it: `data()` promises a complete locale, and
        // consumers index `locales[id]` directly — `KbqDataSizePipe` reads `locales[locale].sizeUnits`.
        it('should register every locale the picker offers when KBQ_LOCALE_DATA patches a single one', () => {
            const service = createService([
                {
                    provide: KBQ_LOCALE_DATA,
                    useValue: { 'ru-RU': { select: { selectAll: 'Everything' } } }
                }
            ]);

            expect(service.items().map(({ id }) => id)).toContain('en-US');
            expect(service.items().filter(({ id }) => !service.locales[id])).toEqual([]);

            service.setLocale('en-US');

            expect(service.data()).toBe(service.locales['en-US']);
            expect(service.getParams('a11y')).toBe(enUSLocaleData.a11y);
            expect(service.getParams('select').selectAll).toBe(enUSLocaleData.select.selectAll);
        });

        it('should register a locale offered only through a custom items list', () => {
            const service = createService([
                {
                    provide: KBQ_LOCALE_DATA,
                    useValue: { items: [{ id: 'de-DE', name: 'Deutsch' }] }
                }
            ]);

            expect(service.items().map(({ id }) => id)).toEqual(['de-DE']);
            expect(service.locales['de-DE']).toBeDefined();

            service.setLocale('de-DE');

            expect(service.data().a11y).toBe(ruRULocaleData.a11y);
            expect(service.data().sizeUnits).toBe(ruRUFormattersData.sizeUnits);
        });

        it('should register an unknown id provided through KBQ_LOCALE_ID', () => {
            // `KBQ_LOCALE_ID` takes any string, and the constructor activates it without going through
            // `setLocale` — the id has to be registered there too, or `data()` starts out undefined.
            const service = createService([{ provide: KBQ_LOCALE_ID, useValue: 'de-DE' }]);

            expect(service.data()).toBeDefined();
            expect(service.data()).toBe(service.locales['de-DE']);
            expect(service.data().a11y).toBe(ruRULocaleData.a11y);
        });

        it('should register an unknown id passed to setLocale', () => {
            const service = createService();

            service.setLocale('de-DE');

            expect(service.data()).toBeDefined();
            expect(service.locales['de-DE']).toBe(service.data());
            expect(service.data().a11y).toBe(ruRULocaleData.a11y);
            expect(service.data().sizeUnits).toBe(ruRUFormattersData.sizeUnits);
        });
    });
});

describe('locale data completeness', () => {
    // `satisfies KbqLocaleStringsData` already forces every locale to carry every required key. What it
    // cannot catch is an *optional* key that one locale declares and another forgets — which is exactly how
    // `datepicker.dateInput` came to exist in three locales and not the other two.
    const collectEntries = (value: unknown, prefix = ''): [string, unknown][] =>
        value && typeof value === 'object' && !Array.isArray(value)
            ? Object.entries(value).flatMap(([key, nested]) => {
                  const path = prefix ? `${prefix}.${key}` : key;

                  return [[path, nested] as [string, unknown], ...collectEntries(nested, path)];
              })
            : [];

    /**
     * `datepicker.dateInput` is declared by three locales and not the other two. It is dead data — the
     * datepicker resolves its input format from `KBQ_DATE_FORMATS` and the date adapter — so the drift is
     * harmless and the key is typed optional. Drop this entry together with the key itself.
     */
    const knownDrift = ['datepicker.dateInput'];

    // `SEPARATOR`/`LAST_PART_SEPARATOR` join the parts of a rendered duration; blank and whitespace-only
    // values are meaningful there, unlike in any label or accessible name.
    const isSeparator = (path: string) => /\.(LAST_PART_)?SEPARATOR$/.test(path);

    const keyPathsOf = (data: object): string[] =>
        collectEntries(data)
            .map(([path]) => path)
            .filter((path) => !knownDrift.includes(path))
            .sort();

    const locales: [string, object][] = [
        ['en-US', enUSLocaleData],
        ['es-LA', esLALocaleData],
        ['pt-BR', ptBRLocaleData],
        ['tk-TM', tkTMLocaleData],
        ['ru-RU', ruRULocaleData]
    ];

    it.each(locales)('should declare exactly the key paths of the default locale in %s', (_, data) => {
        expect(keyPathsOf(data)).toEqual(keyPathsOf(ruRULocaleData));
    });

    it.each(locales)('should leave no label blank in %s', (_, data) => {
        const blank = collectEntries(data)
            .filter(([path, value]) => typeof value === 'string' && value.trim() === '' && !isSeparator(path))
            .map(([path]) => path);

        expect(blank).toEqual([]);
    });
});

describe('number helpers', () => {
    const ruConfig = ruRUFormattersData.input.number;
    const enConfig = enUSFormattersData.input.number;

    describe('numberByParts', () => {
        it('should split an integer', () => {
            expect(numberByParts('1 234', ruConfig)).toEqual({ integer: '1234', fraction: '' });
        });

        it('should split a fraction', () => {
            expect(numberByParts('1234,56', ruConfig)).toEqual({ integer: '1234', fraction: '56' });
        });

        it('should keep the sign of a negative number', () => {
            expect(numberByParts('-1234,56', ruConfig).integer).toBe('-1234');
        });
    });

    describe('normalizeNumber', () => {
        it('should strip group separators and normalize the fraction separator', () => {
            expect(normalizeNumber('1 234,56', ruConfig)).toBe('1234.56');
            expect(normalizeNumber('1,234.56', enConfig)).toBe('1234.56');
        });

        it('should return an empty string for a missing value', () => {
            expect(normalizeNumber(null, ruConfig)).toBe('');
            expect(normalizeNumber(undefined, ruConfig)).toBe('');
        });
    });

    describe('checkAndNormalizeLocalizedNumber', () => {
        it('should parse a number written in the given locale', () => {
            expect(checkAndNormalizeLocalizedNumber('1 234,56', 'ru-RU')).toBe(1234.56);
            expect(checkAndNormalizeLocalizedNumber('1,234.56', 'en-US')).toBe(1234.56);
        });

        it('should return null for a missing value', () => {
            expect(checkAndNormalizeLocalizedNumber(null)).toBeNull();
            expect(checkAndNormalizeLocalizedNumber(undefined)).toBeNull();
        });
    });
});

import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { DefaultUrlSerializer, Router } from '@angular/router';
import { KBQ_LOCALE_SERVICE, kbqLocaleServiceProvider } from '@koobiq/components/core';
import type { Mock, MockInstance } from 'vitest';
import { DocsLocale } from '../constants/locale';
import { DocsLocaleService } from './locale';
import { DocsLanguagePreferences } from './preferences';

describe(DocsLanguagePreferences.name, () => {
    let setDocsLocale: Mock;
    let setExamplesLocale: MockInstance;
    let router: { navigate: Mock; parseUrl: (url: string) => ReturnType<DefaultUrlSerializer['parse']> };

    /** Configures the app at the given URL, the preferences not created yet. */
    const configure = (path: string): void => {
        setDocsLocale = vi.fn();

        const serializer = new DefaultUrlSerializer();

        router = { navigate: vi.fn(), parseUrl: (url: string) => serializer.parse(url) };

        let currentDocsLocale =
            Object.values(DocsLocale).find((locale) => path.startsWith(`/${locale}/`)) ?? DocsLocale.Ru;

        TestBed.configureTestingModule({
            providers: [
                kbqLocaleServiceProvider(),
                { provide: Location, useValue: { path: () => path } },
                { provide: Router, useValue: router },
                {
                    provide: DocsLocaleService,
                    useValue: {
                        get locale() {
                            return currentDocsLocale;
                        },
                        getLocaleFromURL: (url: string) =>
                            Object.values(DocsLocale).find((locale) => url.startsWith(`/${locale}/`)) ?? null,
                        setLocale: (locale: DocsLocale) => {
                            currentDocsLocale = locale;
                            setDocsLocale(locale);
                        }
                    }
                }
            ]
        });

        setExamplesLocale = vi.spyOn(TestBed.inject(KBQ_LOCALE_SERVICE), 'setLocale');
    };

    const create = (): DocsLanguagePreferences => TestBed.inject(DocsLanguagePreferences);

    afterEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    // The example page has no footer to apply it.
    it('applies the saved examples language', () => {
        configure('/examples/select-overview');

        const index = TestBed.inject(KBQ_LOCALE_SERVICE).locales.items.findIndex(({ id }) => id === 'ru-RU');

        localStorage.setItem('docs_examples-language', String(index));
        create();

        expect(setExamplesLocale).toHaveBeenLastCalledWith('ru-RU');
    });

    it('applies the saved interface language to a URL without a locale', () => {
        configure('/examples/select-overview');
        localStorage.setItem('docs_language', '1');
        create();

        expect(setDocsLocale).toHaveBeenLastCalledWith(DocsLocale.En);
    });

    it('prefers the locale of the URL to the saved one', () => {
        configure('/ru/components/alert/overview');
        localStorage.setItem('docs_language', '1');

        const preferences = create();

        expect(setDocsLocale).toHaveBeenLastCalledWith(DocsLocale.Ru);
        expect(preferences.docsLanguageSwitch.currentValue.id).toBe(DocsLocale.Ru);
    });

    // The list of locales has shrunk before, leaving saved indexes that point past its end.
    it('falls back to the first language when the saved index is out of the list', () => {
        configure('/examples/select-overview');

        const { items } = TestBed.inject(KBQ_LOCALE_SERVICE).locales;

        localStorage.setItem('docs_examples-language', String(items.length));

        const preferences = create();

        expect(preferences.examplesLanguageSwitch.currentValue.id).toBe(items[0].id);
        expect(setExamplesLocale).toHaveBeenLastCalledWith(items[0].id);
    });

    // Read as the app starts, a throw would leave the whole app blank.
    it('falls back to the defaults where storage is blocked', () => {
        const blocked = () => {
            throw new DOMException('The operation is insecure.', 'SecurityError');
        };

        configure('/examples/select-overview');
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(blocked);
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(blocked);

        const preferences = create();

        expect(preferences.docsLanguageSwitch.currentValue.id).toBe(DocsLocale.Ru);
        expect(setExamplesLocale).toHaveBeenLastCalledWith(preferences.examplesLanguageSwitch.currentValue.id);
    });

    it('prefers the examples language from the query param', () => {
        configure('/examples/select-overview?examples-lang=ru-RU');

        const preferences = create();

        expect(setExamplesLocale).toHaveBeenLastCalledWith('ru-RU');
        expect(preferences.examplesLanguageSwitch.currentValue.id).toBe('ru-RU');
    });

    it('ignores an unknown examples language in the query param', () => {
        configure('/examples/select-overview?examples-lang=zz-ZZ');

        const preferences = create();

        expect(preferences.examplesLanguageSwitch.currentValue.id).toBe(
            TestBed.inject(KBQ_LOCALE_SERVICE).locales.items[0].id
        );
    });

    it('writes the examples language to the query param when it changes', () => {
        configure('/examples/select-overview');

        const preferences = create();
        const ruIndex = preferences.examplesLanguageSwitch.data.findIndex(({ id }) => id === 'ru-RU');

        preferences.examplesLanguageSwitch.setValue(ruIndex);

        expect(router.navigate).toHaveBeenCalledWith([], {
            queryParams: { 'examples-lang': 'ru-RU' },
            queryParamsHandling: 'merge'
        });
    });

    // The examples language follows the docs language until the reader picks a different one.
    it('switches the examples language together with the docs language while they match', () => {
        configure('/ru/components/alert/overview');

        const { items } = TestBed.inject(KBQ_LOCALE_SERVICE).locales;

        localStorage.setItem('docs_examples-language', String(items.findIndex(({ id }) => id === 'ru-RU')));

        const preferences = create();
        const enIndex = preferences.docsLanguageSwitch.data.findIndex(({ id }) => id === DocsLocale.En);

        preferences.docsLanguageSwitch.setValue(enIndex);

        expect(setExamplesLocale).toHaveBeenLastCalledWith('en-US');
        expect(preferences.examplesLanguageSwitch.currentValue.id).toBe('en-US');
        expect(router.navigate).toHaveBeenLastCalledWith([], {
            queryParams: { 'examples-lang': 'en-US' },
            queryParamsHandling: 'merge'
        });
    });

    it('keeps a deliberately different examples language when the docs language changes', () => {
        configure('/ru/components/alert/overview');

        const { items } = TestBed.inject(KBQ_LOCALE_SERVICE).locales;
        const esIndex = items.findIndex(({ id }) => id === 'es-LA');

        localStorage.setItem('docs_examples-language', String(esIndex));

        const preferences = create();

        preferences.docsLanguageSwitch.setValue(
            preferences.docsLanguageSwitch.data.findIndex(({ id }) => id === DocsLocale.En)
        );

        expect(setExamplesLocale).toHaveBeenLastCalledWith('es-LA');
        expect(preferences.examplesLanguageSwitch.currentValue.id).toBe('es-LA');
    });
});

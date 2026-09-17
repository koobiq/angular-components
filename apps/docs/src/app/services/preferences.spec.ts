import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { KBQ_LOCALE_SERVICE, kbqLocaleServiceProvider } from '@koobiq/components/core';
import { DocsLocale } from '../constants/locale';
import { DocsLocaleService } from './locale';
import { DocsLanguagePreferences } from './preferences';

describe(DocsLanguagePreferences.name, () => {
    let setDocsLocale: jest.Mock;
    let setExamplesLocale: jest.SpyInstance;

    /** Configures the app at the given URL, the preferences not created yet. */
    const configure = (path: string): void => {
        setDocsLocale = jest.fn();

        TestBed.configureTestingModule({
            providers: [
                kbqLocaleServiceProvider(),
                { provide: Location, useValue: { path: () => path } },
                {
                    provide: DocsLocaleService,
                    useValue: {
                        getLocaleFromURL: (url: string) =>
                            Object.values(DocsLocale).find((locale) => url.startsWith(`/${locale}/`)) ?? null,
                        setLocale: setDocsLocale
                    }
                }
            ]
        });

        setExamplesLocale = jest.spyOn(TestBed.inject(KBQ_LOCALE_SERVICE), 'setLocale');
    };

    const create = (): DocsLanguagePreferences => TestBed.inject(DocsLanguagePreferences);

    afterEach(() => {
        localStorage.clear();
        jest.restoreAllMocks();
    });

    // The footer, which used to restore it, does not render on the example page.
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

    // Read as the app starts, a throw would leave the whole app blank.
    it('falls back to the defaults where storage is blocked', () => {
        const blocked = () => {
            throw new DOMException('The operation is insecure.', 'SecurityError');
        };

        configure('/examples/select-overview');
        jest.spyOn(Storage.prototype, 'getItem').mockImplementation(blocked);
        jest.spyOn(Storage.prototype, 'setItem').mockImplementation(blocked);

        const preferences = create();

        expect(preferences.docsLanguageSwitch.currentValue.id).toBe(DocsLocale.Ru);
        expect(setExamplesLocale).toHaveBeenLastCalledWith(preferences.examplesLanguageSwitch.currentValue.id);
    });
});

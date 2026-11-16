import { Location } from '@angular/common';
import {
    EnvironmentProviders,
    inject,
    Injectable,
    makeEnvironmentProviders,
    provideAppInitializer
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { KBQ_LOCALE_SERVICE, KBQ_WINDOW, KbqThemeService } from '@koobiq/components/core';
import { distinctUntilKeyChanged, filter, skip } from 'rxjs';
import { DocsNavbarProperty } from '../components/navbar/navbar-property';
import { DOCS_EXAMPLES_LANG_PARAM, DocsLocale } from '../constants/locale';
import { DocsLocaleService } from './locale';

/** Examples locale id that mirrors a docs interface locale. */
const examplesLocaleFor = (locale: DocsLocale): string => (locale === DocsLocale.Ru ? 'ru-RU' : 'en-US');

/** Languages of the docs interface and of the live examples that the reader has picked. */
@Injectable({ providedIn: 'root' })
export class DocsLanguagePreferences {
    private readonly docsLocaleService = inject(DocsLocaleService);
    private readonly localeService = inject(KBQ_LOCALE_SERVICE);
    private readonly location = inject(Location);
    private readonly router = inject(Router);
    private readonly window = inject(KBQ_WINDOW);

    // Field initializers run in declaration order: this reads the storage before the switches below
    // persist their initial value, which is the only way to tell a stored pick from a fresh reader.
    private readonly initiallyStoredExamplesLanguage = this.hasStoredExamplesLanguage();

    /** Guards the mirror-driven examples switch so it does not write the URL param itself. */
    private mirroringExamples = false;

    readonly docsLanguageSwitch = new DocsNavbarProperty({
        property: 'docs_language',
        data: [
            {
                value: 'Русский',
                id: DocsLocale.Ru,
                selected: false
            },
            {
                value: 'English',
                id: DocsLocale.En,
                selected: false
            }
        ],
        updateSelected: true
    });

    readonly examplesLanguageSwitch = new DocsNavbarProperty({
        property: 'docs_examples-language',
        data: this.localeService.locales.items.map((item) => ({ id: item.id, value: item.name, selected: false })),
        updateSelected: true
    });

    constructor() {
        const docsLocale = this.docsLocaleService.getLocaleFromURL(this.location.path());
        const index = this.docsLanguageSwitch.data.findIndex((item) => item.id === docsLocale);

        if (index >= 0) {
            this.docsLanguageSwitch.setValue(index);
        }

        const queryLocale = this.getExamplesLocaleFromUrl(this.location.path());
        const queryIndex = queryLocale
            ? this.examplesLanguageSwitch.data.findIndex(({ id }) => id === queryLocale)
            : -1;

        if (queryIndex >= 0) {
            this.examplesLanguageSwitch.setValue(queryIndex);
        } else if (!this.initiallyStoredExamplesLanguage) {
            // No URL or stored pick: the examples start from the docs language, so a fresh reader
            // on /ru/ gets Russian examples rather than the first language of the list.
            const examplesIndex = this.examplesLanguageSwitch.data.findIndex(
                (item) => item.id === examplesLocaleFor(this.docsLanguageSwitch.currentValue.id)
            );

            if (examplesIndex >= 0) {
                this.examplesLanguageSwitch.setValue(examplesIndex);
            }
        }

        // Applies the locale the app starts with: the merged subscription below skips the value replayed
        // to a fresh subscriber, so a real switch of the docs language is what triggers the examples sync
        // and the locale navigation.
        this.docsLocaleService.setLocale(this.docsLanguageSwitch.currentValue.id, undefined);

        // `skip(1)` drops the value replayed to a fresh subscriber, so the examples follow a switch of the
        // docs language, not the locale the app starts with. While the examples language mirrors the docs
        // language, switching the docs switches both; a deliberately different examples language is left
        // alone. `locale` is still the previous one here: the examples sync runs before `setLocale` applies
        // the picked docs locale, so the mirrored examples language is passed to it and the locale segment
        // and the query param are rewritten in one navigation.
        this.docsLanguageSwitch.changes
            .pipe(distinctUntilKeyChanged('value'), skip(1))
            .subscribe(({ value: { id } }) => {
                const mirrorExamples =
                    this.localeService.localeId() === examplesLocaleFor(this.docsLocaleService.locale);

                if (mirrorExamples) {
                    const index = this.examplesLanguageSwitch.data.findIndex(
                        (item) => item.id === examplesLocaleFor(id)
                    );

                    if (index >= 0) {
                        this.mirroringExamples = true;
                        this.examplesLanguageSwitch.setValue(index);
                        this.mirroringExamples = false;
                    }
                }

                this.docsLocaleService.setLocale(id, mirrorExamples ? examplesLocaleFor(id) : undefined);
            });

        this.examplesLanguageSwitch.changes.pipe(distinctUntilKeyChanged('value')).subscribe(({ value: { id } }) => {
            this.localeService.setLocale(id);
        });

        // `skip(1)` drops the value replayed to a fresh subscriber, so the param is written on a change only.
        // A mirror switch is written by the `setLocale` navigation instead, to keep a single history entry;
        // a browser navigation already shows the param — writing it again would add a duplicate history entry.
        this.examplesLanguageSwitch.changes
            .pipe(distinctUntilKeyChanged('value'), skip(1))
            .subscribe(({ value: { id } }) => {
                if (this.mirroringExamples) return;
                if (this.getExamplesLocaleFromUrl(this.location.path()) === id) return;

                this.router.navigate([], {
                    queryParams: { [DOCS_EXAMPLES_LANG_PARAM]: id },
                    queryParamsHandling: 'merge',
                    preserveFragment: true
                });
            });

        // Browser back/forward restores a URL that can carry a different examples language: apply it, so
        // the address bar and the rendered examples never disagree. A missing param leaves the picked
        // language alone — storage, not the URL, is the source of truth after the start.
        this.router.events
            .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
            .subscribe(({ urlAfterRedirects }) => this.applyExamplesLanguageFromURL(urlAfterRedirects));
    }

    private applyExamplesLanguageFromURL(url: string): void {
        const locale = this.getExamplesLocaleFromUrl(url);

        if (!locale || this.examplesLanguageSwitch.currentValue.id === locale) return;

        const index = this.examplesLanguageSwitch.data.findIndex(({ id }) => id === locale);

        if (index >= 0) {
            this.examplesLanguageSwitch.setValue(index);
        }
    }

    // Storage throws where it is blocked, which `DocsNavbarProperty` already swallows; a throw here would
    // be just as fatal at startup, so this mirrors its safe read.
    private hasStoredExamplesLanguage(): boolean {
        try {
            return this.window.localStorage.getItem('docs_examples-language') !== null;
        } catch {
            return false;
        }
    }

    private getExamplesLocaleFromUrl(url: string): string | null {
        const value = this.router.parseUrl(url).queryParams[DOCS_EXAMPLES_LANG_PARAM];

        return typeof value === 'string' && this.localeService.locales.items.some(({ id }) => id === value)
            ? value
            : null;
    }
}

/**
 * Applies the saved theme and languages as the app starts rather than once the navbar and the footer render:
 * the example page has neither.
 */
export function docsProvidePreferences(): EnvironmentProviders {
    return makeEnvironmentProviders([
        provideAppInitializer(() => {
            inject(KbqThemeService);
            inject(DocsLanguagePreferences);
        })
    ]);
}

import { Location } from '@angular/common';
import {
    EnvironmentProviders,
    inject,
    Injectable,
    makeEnvironmentProviders,
    provideAppInitializer
} from '@angular/core';
import { Router } from '@angular/router';
import { KBQ_LOCALE_SERVICE, KbqThemeService } from '@koobiq/components/core';
import { distinctUntilKeyChanged, skip } from 'rxjs';
import { DocsNavbarProperty } from '../components/navbar/navbar-property';
import { DOCS_EXAMPLES_LANG_PARAM, DocsLocale } from '../constants/locale';
import { DocsLocaleService } from './locale';

/** Languages of the docs interface and of the live examples that the reader has picked. */
@Injectable({ providedIn: 'root' })
export class DocsLanguagePreferences {
    private readonly docsLocaleService = inject(DocsLocaleService);
    private readonly localeService = inject(KBQ_LOCALE_SERVICE);
    private readonly location = inject(Location);
    private readonly router = inject(Router);

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
        const index = this.docsLanguageSwitch.data.findIndex(
            (item) => item.id === this.docsLocaleService.getLocaleFromURL(this.location.path())
        );

        if (index >= 0) {
            this.docsLanguageSwitch.setValue(index);
        }

        const queryLocale = this.getExamplesLocaleFromQuery();
        const queryIndex = queryLocale
            ? this.examplesLanguageSwitch.data.findIndex(({ id }) => id === queryLocale)
            : -1;

        if (queryIndex >= 0) {
            this.examplesLanguageSwitch.setValue(queryIndex);
        }

        this.docsLanguageSwitch.changes.pipe(distinctUntilKeyChanged('value')).subscribe(({ value: { id } }) => {
            this.docsLocaleService.setLocale(id);
        });

        this.examplesLanguageSwitch.changes.pipe(distinctUntilKeyChanged('value')).subscribe(({ value: { id } }) => {
            this.localeService.setLocale(id);
        });

        // `skip(1)` drops the value replayed to a fresh subscriber, so the param is written on a change only.
        this.examplesLanguageSwitch.changes
            .pipe(distinctUntilKeyChanged('value'), skip(1))
            .subscribe(({ value: { id } }) => {
                this.router.navigate([], {
                    queryParams: { [DOCS_EXAMPLES_LANG_PARAM]: id },
                    queryParamsHandling: 'merge'
                });
            });
    }

    private getExamplesLocaleFromQuery(): string | null {
        const value = this.router.parseUrl(this.location.path()).queryParams[DOCS_EXAMPLES_LANG_PARAM];

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

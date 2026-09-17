import { Location } from '@angular/common';
import {
    EnvironmentProviders,
    inject,
    Injectable,
    makeEnvironmentProviders,
    provideAppInitializer
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KBQ_LOCALE_SERVICE, KbqThemeService } from '@koobiq/components/core';
import { distinctUntilKeyChanged } from 'rxjs';
import { DocsNavbarProperty } from '../components/navbar/navbar-property';
import { DocsLocale } from '../constants/locale';
import { DocsLocaleService } from './locale';

/** Languages of the docs interface and of the live examples that the reader has picked. */
@Injectable({ providedIn: 'root' })
export class DocsLanguagePreferences {
    private readonly docsLocaleService = inject(DocsLocaleService);
    private readonly localeService = inject(KBQ_LOCALE_SERVICE);
    private readonly location = inject(Location);

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

        this.docsLanguageSwitch.changes
            .pipe(distinctUntilKeyChanged('value'), takeUntilDestroyed())
            .subscribe(({ value: { id } }) => {
                this.docsLocaleService.setLocale(id);
            });

        this.examplesLanguageSwitch.changes
            .pipe(distinctUntilKeyChanged('value'), takeUntilDestroyed())
            .subscribe(({ value: { id } }) => {
                this.localeService.setLocale(id);
            });
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

import { AsyncPipe, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KBQ_LOCALE_SERVICE } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { distinctUntilKeyChanged } from 'rxjs';
import { DocsLocale } from 'src/app/constants/locale';
import { DocsLocaleService } from 'src/app/services/locale.service';
import { koobiqVersion } from '../../version';
import { NavbarProperty } from '../navbar/navbar-property';
import { DocsVersionPickerDirective } from '../version-picker/version-picker.directive';

@Component({
    standalone: true,
    imports: [
        KbqIconModule,
        KbqLinkModule,
        KbqDropdownModule,
        DocsVersionPickerDirective,
        AsyncPipe
    ],
    selector: 'docs-footer',
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss',
    host: {
        class: 'docs-footer'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DocsFooterComponent {
    private readonly localeService = inject(KBQ_LOCALE_SERVICE);
    private readonly location = inject(Location);
    readonly docsLocaleService = inject(DocsLocaleService);

    readonly DocsLocale = DocsLocale;
    readonly version = koobiqVersion;
    readonly examplesLanguageSwitch: NavbarProperty;
    readonly docsLanguageSwitch: NavbarProperty;

    get selectedLanguages(): string {
        if (this.docsLanguageSwitch.currentValue.value === this.examplesLanguageSwitch.currentValue.value) {
            return this.examplesLanguageSwitch.currentValue.value;
        }

        return `${this.docsLanguageSwitch.currentValue.value}, ${this.examplesLanguageSwitch.currentValue.value}`;
    }

    constructor() {
        this.docsLanguageSwitch = new NavbarProperty({
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

        this.examplesLanguageSwitch = new NavbarProperty({
            property: 'docs_examples-language',
            data: this.localeService.locales.items
                // exclude fa-IR (DS-2219)
                .filter((item) => item.id !== 'fa-IR')
                .map((item) => ({ id: item.id, value: item.name, selected: false })),
            updateSelected: true
        });

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

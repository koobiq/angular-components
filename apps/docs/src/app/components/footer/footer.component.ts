import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { KBQ_LOCALE_SERVICE, KbqLocaleService } from '@koobiq/components/core';
import { koobiqVersion, koobiqVersionFull } from '../../version';
import { NavbarProperty, NavbarPropertyParameters } from '../navbar/navbar-property';

@Component({
    selector: 'docs-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
    host: {
        class: 'docs-footer'
    },
    encapsulation: ViewEncapsulation.None
})
export class FooterComponent {
    version = koobiqVersion;

    examplesLanguageSwitch: NavbarProperty;
    docsLanguageSwitch: NavbarProperty;

    get selectedLanguages(): string {
        if (this.docsLanguageSwitch.currentValue.value === this.examplesLanguageSwitch.currentValue.value) {
            return this.examplesLanguageSwitch.currentValue.value;
        }

        return `${this.docsLanguageSwitch.currentValue.value}, ${this.examplesLanguageSwitch.currentValue.value}`;
    }

    private docsLanguageProperty: NavbarPropertyParameters = {
        property: 'docs_language',
        data: [
            {
                name: 'Интерфейс',
                value: 'Русский',
                id: 'ru-RU',
                selected: false
            },
            {
                name: 'Interface',
                value: 'English',
                id: 'en-US',
                selected: false
            }
        ],
        updateTemplate: false,
        updateSelected: true
    };

    private examplesLanguageProperty: NavbarPropertyParameters = {
        property: 'docs_examples-language',
        data: [],
        updateTemplate: false,
        updateSelected: true
    };

    constructor(@Inject(KBQ_LOCALE_SERVICE) private localeService: KbqLocaleService) {
        console.debug(koobiqVersionFull);
        this.examplesLanguageProperty.data.push(
            ...localeService.locales.items
                // exclude fa-IR (DS-2219)
                .filter((item) => item.id !== 'fa-IR')
                .map((item) => ({ id: item.id, value: item.name, selected: false }))
        );

        this.docsLanguageSwitch = new NavbarProperty(this.docsLanguageProperty);
        this.examplesLanguageSwitch = new NavbarProperty(this.examplesLanguageProperty);

        this.examplesLanguageSwitch.changes
            // .pipe(filter(({ name }) => ['init', 'setValue'].includes(name)))
            .subscribe(({ value: { id } }) => this.localeService.setLocale(id));
    }

    setLanguage(i) {
        this.examplesLanguageSwitch.setValue(i);
    }
}

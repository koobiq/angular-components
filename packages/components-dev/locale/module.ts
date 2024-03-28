import { Component, Inject, NgModule, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    KBQ_LOCALE_SERVICE,
    KbqLocaleService,
    KbqLocaleServiceModule,
    KbqOptionModule,
    ThemePalette
} from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';

import { KbqIconModule } from '../../components/icon';
import { KbqNavbarModule } from '../../components/navbar';


@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class LocaleDemoComponent {
    themePalette = ThemePalette;
    selectedLanguage;
    languages;

    constructor(@Inject(KBQ_LOCALE_SERVICE) private localeService: KbqLocaleService) {
        this.languages = this.localeService.locales.items
            .map((item) => ({ ...item, selected: false }));

        this.selectLanguage(this.languages[0]);
    }

    selectLanguage(language) {
        this.languages.forEach((item) => item.selected = false);
        this.selectedLanguage = language;
        this.selectedLanguage.selected = true;

        this.localeService.setLocale(this.selectedLanguage.id);
    }
}


@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        KbqLocaleServiceModule,
        KbqNavbarModule,
        KbqIconModule,
        KbqButtonModule,
        FormsModule,
        KbqDropdownModule,
        KbqFormFieldModule,
        KbqOptionModule,
        KbqSelectModule
    ],
    declarations: [LocaleDemoComponent],
    bootstrap: [LocaleDemoComponent]
})
export class DemoModule {}

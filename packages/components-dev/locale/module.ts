import { ChangeDetectionStrategy, Component, Inject, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqNavbarModule } from '@koobiq/components/navbar';
import { KbqSelectModule } from '@koobiq/components/select';

@Component({
    selector: 'dev-app',
    imports: [
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
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    themePalette = ThemePalette;
    selectedLanguage;
    languages;

    constructor(@Inject(KBQ_LOCALE_SERVICE) private localeService: KbqLocaleService) {
        this.languages = this.localeService.locales.items.map((item) => ({ ...item, selected: false }));

        this.selectLanguage(this.languages[0]);
    }

    selectLanguage(language) {
        this.languages.forEach((item) => (item.selected = false));
        this.selectedLanguage = language;
        this.selectedLanguage.selected = true;

        this.localeService.setLocale(this.selectedLanguage.id);
    }
}

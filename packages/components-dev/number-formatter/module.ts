/* tslint:disable:naming-convention */
// tslint:disable:no-console
import { Component, Inject, NgModule, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    KBQ_LOCALE_SERVICE,
    KbqFormattersModule,
    KbqLocaleService,
    KbqLocaleServiceModule
} from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';


@Component({
    selector: 'app',
    templateUrl: './demo-template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {
    value = 1000.123;

    locales: any[];

    constructor(@Inject(KBQ_LOCALE_SERVICE) public localeService: KbqLocaleService) {

        this.locales = this.localeService.locales.items
            .map((item) => ({ ...item, selected: item.id === this.localeService.id }));
    }

    selectLanguage(lang: any) {
        this.localeService.setLocale(lang.id);
    }
}


@NgModule({
    imports: [
        KbqLocaleServiceModule,
        BrowserModule,
        KbqButtonModule,
        KbqFormattersModule,
        KbqInputModule,
        KbqFormFieldModule,
        FormsModule,
        KbqIconModule
    ],
    declarations: [DemoComponent],
    bootstrap: [DemoComponent]
})
export class DemoModule {}

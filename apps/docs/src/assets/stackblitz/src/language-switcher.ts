import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KBQ_LOCALE_SERVICE } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';

/** Language switcher mounted into the header of the generated project by `main.ts`. */
@Component({
    selector: 'docs-language-switcher',
    imports: [KbqFormFieldModule, KbqSelectModule],
    template: `
        <kbq-form-field>
            <kbq-select [value]="localeService.localeId()" (valueChange)="localeService.setLocale($event)">
                @for (item of localeService.locales.items; track item.id) {
                    <kbq-option [value]="item.id">{{ item.name }}</kbq-option>
                }
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: block;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsLanguageSwitcher {
    protected readonly localeService = inject(KBQ_LOCALE_SERVICE);
}

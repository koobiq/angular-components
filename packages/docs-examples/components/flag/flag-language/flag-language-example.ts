import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Flag is not a language
 */
@Component({
    selector: 'flag-language-example',
    imports: [ReactiveFormsModule, KbqFormFieldModule, KbqSelectModule, KbqIconModule],
    template: `
        <kbq-form-field>
            <i kbqPrefix color="contrast-fade" kbq-icon="kbq-globe_16"></i>
            <kbq-select placeholder="Select your language" [formControl]="control">
                @for (language of languages; track language) {
                    <kbq-option [value]="language">{{ language }}</kbq-option>
                }
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        .kbq-form-field {
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-row layout-align-center-center layout-padding-l'
    }
})
export class FlagLanguageExample {
    // Languages are picked with a neutral icon, not a flag: one language spans several countries.
    protected readonly languages = ['English (UK)', 'English (US)', 'Español', 'Français', 'Русский', 'हिन्दी', '中文'];

    protected readonly control = new FormControl(this.languages[0]);
}

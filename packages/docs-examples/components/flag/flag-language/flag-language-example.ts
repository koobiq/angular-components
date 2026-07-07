import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFlag } from '@koobiq/components/flag';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';
import { FlagSrcPipe } from '../flag-string.pipe';

/**
 * @title Flag is not a language (anti-pattern)
 */
@Component({
    selector: 'flag-language-example',
    imports: [KbqFormFieldModule, KbqSelectModule, KbqFlag, FlagSrcPipe],
    template: `
        <kbq-form-field>
            <kbq-select placeholder="Select your language" [(value)]="selected">
                @for (language of languages; track language.code) {
                    <kbq-option [value]="language.code">
                        <kbq-flag decorative>
                            <img alt="" [src]="language.code | flagSrc" />
                        </kbq-flag>
                        {{ language.name }}
                    </kbq-option>
                }
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            justify-content: center;
            padding: var(--kbq-size-l);
        }

        .kbq-form-field {
            width: 320px;
        }

        kbq-option .kbq-flag {
            margin-right: var(--kbq-size-xs);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlagLanguageExample {
    // Demonstrates why flags should NOT be used to pick an interface language.
    protected readonly languages = [
        { code: 'GB', name: 'English (UK)' },
        { code: 'US', name: 'English (US)' },
        { code: 'ES', name: 'Español' }
    ];

    protected selected = this.languages[0].code;
}

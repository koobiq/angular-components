import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqSelectModule } from '@koobiq/components/select';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Select with multiline matcher
 */
@Component({
    selector: 'select-with-multiline-matcher-example',
    imports: [
        KbqSelectModule
    ],
    template: `
        <div>
            <kbq-form-field>
                <kbq-select [placeholder]="t().placeholder" [multiline]="true" [value]="selected" [panelWidth]="400">
                    @for (option of options; track option) {
                        <kbq-option [value]="option">{{ option }}</kbq-option>
                    }
                    <kbq-cleaner />
                </kbq-select>
            </kbq-form-field>
        </div>
    `,
    styles: [
        `
            :host {
                display: flex;
                flex-direction: column;
                align-items: center;
            }

            .kbq-form-field {
                width: 320px;
            }

            div:not(:last-child) {
                margin-bottom: var(--kbq-size-xl);
            }
        `
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectWithMultilineMatcherExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    readonly options = Array.from({ length: 10 }, (_, i) => 'Option #' + i);
    selected: string[] = [this.options[0], this.options[1], this.options[2], this.options[3]];
}

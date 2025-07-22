import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Select with panelWidth attribute
 */
@Component({
    standalone: true,
    imports: [
        KbqFormFieldModule,
        KbqSelectModule
    ],
    selector: 'select-with-multiline-matcher-example',
    template: `
        <div>
            <label class="kbq-form__label">Multiline matcher</label>
            <kbq-form-field>
                <kbq-select [multiple]="true" [multiline]="true" [panelWidth]="400" placeholder="Placeholder">
                    @for (option of options; track option) {
                        <kbq-option [value]="option">{{ option }}</kbq-option>
                    }
                    <kbq-cleaner #kbqSelectCleaner />
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

            div {
                width: 300px;
            }

            div:not(:last-child) {
                margin-bottom: var(--kbq-size-xl);
            }
        `

    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectWithMultilineMatcherExample {
    readonly options = [
        'Option with very very very very very very very very very very very very very very very very very very very very very long text',
        ...Array.from({ length: 10 }).map((_, i) => `Option ${i}`)];
}

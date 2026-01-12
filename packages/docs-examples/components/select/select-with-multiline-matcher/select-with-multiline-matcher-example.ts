import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Select with panelWidth attribute
 */
@Component({
    selector: 'select-with-multiline-matcher-example',
    imports: [
        KbqFormFieldModule,
        KbqSelectModule
    ],
    template: `
        <div>
            <kbq-form-field>
                <kbq-select placeholder="Placeholder" [multiline]="true" [value]="selected" [panelWidth]="400">
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
    readonly options = Array.from({ length: 10 }).map((_, i) => `Option ${i}`);
    selected: string[] = [this.options[0], this.options[1], this.options[2], this.options[3]];
}

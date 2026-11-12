import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/** @title Form field with kbq-cleaner */
@Component({
    selector: 'form-field-with-cleaner-example',
    imports: [KbqInputModule, KbqSelectModule, ReactiveFormsModule],
    template: `
        <kbq-form-field class="layout-margin-bottom-m">
            <input kbqInput [placeholder]="t().enterSomeInput" [formControl]="inputFormControl" />
            <kbq-cleaner />
        </kbq-form-field>

        <kbq-form-field>
            <kbq-select [placeholder]="t().selectOption" [formControl]="selectFormControl">
                <kbq-cleaner />
                <kbq-option value="1">Option #1</kbq-option>
                <kbq-option value="2">Option #2</kbq-option>
            </kbq-select>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldWithCleanerExample extends BaseLocalizedExample<ExampleTranslation> {
    readonly inputFormControl = new FormControl(this.t().thisFieldCanBeCleaned);
    readonly selectFormControl = new FormControl('1');

    constructor() {
        super(TRANSLATIONS);
    }
}

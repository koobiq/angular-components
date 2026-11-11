import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';
import { injectExampleText } from '../l10n';

/** @title Form field with kbq-cleaner */
@Component({
    selector: 'form-field-with-cleaner-example',
    imports: [KbqInputModule, KbqSelectModule, ReactiveFormsModule],
    template: `
        <kbq-form-field class="layout-margin-bottom-m">
            <input kbqInput [placeholder]="text().enterSomeInput" [formControl]="inputFormControl" />
            <kbq-cleaner />
        </kbq-form-field>

        <kbq-form-field>
            <kbq-select [placeholder]="text().selectOption" [formControl]="selectFormControl">
                <kbq-cleaner />
                <kbq-option value="1">{{ text().option(1) }}</kbq-option>
                <kbq-option value="2">{{ text().option(2) }}</kbq-option>
            </kbq-select>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldWithCleanerExample {
    protected readonly text = injectExampleText();

    readonly inputFormControl = new FormControl(this.text().thisFieldCanBeCleaned);
    readonly selectFormControl = new FormControl('1');
}

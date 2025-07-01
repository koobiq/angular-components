import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqOptionModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Form fieldset
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'form-fieldset-overview-example',
    template: `
        <kbq-fieldset>
            <kbq-form-field style="width: 96px; min-width: 96px">
                <kbq-select [formControl]="control" panelWidth="auto">
                    @for (option of options; track option) {
                        <kbq-option [value]="option">
                            <span [innerHTML]="option"></span>
                        </kbq-option>
                    }
                </kbq-select>
            </kbq-form-field>

            <kbq-form-field kbqFieldsetItem>
                <input kbqInput placeholder="IP-address" />
            </kbq-form-field>
        </kbq-fieldset>
    `,
    imports: [
        KbqFormFieldModule,
        KbqInputModule,
        KbqButtonModule,
        KbqOptionModule,
        KbqSelectModule,
        ReactiveFormsModule
    ]
})
export class FormFieldsetOverviewExample {
    options = [
        'https://',
        'http://'
    ];

    control = new FormControl(this.options[0], Validators.required);
}

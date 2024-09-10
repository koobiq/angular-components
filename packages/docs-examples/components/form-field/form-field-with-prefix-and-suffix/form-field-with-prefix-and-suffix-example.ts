import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components-experimental/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';

/** @title Form field with kbqPrefix and kbqSuffix */
@Component({
    standalone: true,
    selector: 'form-field-with-prefix-and-suffix-example',
    imports: [
        KbqFormFieldModule,
        KbqInputModule,
        KbqIconModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-form-field>
            <kbq-label>Form field with prefix and suffix</kbq-label>
            <i
                kbqPrefix
                kbq-icon="mc-search_16"
            ></i>
            <input
                [formControl]="formControl"
                kbqInput
                placeholder="Search"
            />
            <i
                kbq-icon="mc-info-o_16"
                kbqSuffix
            ></i>
            <kbq-cleaner />
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldWithPrefixAndSuffixExample {
    readonly formControl = new FormControl();
}

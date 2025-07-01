import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { kbqDisableLegacyValidationDirectiveProvider } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';

/** @title Form field with kbqPrefix and kbqSuffix */
@Component({
    standalone: true,
    selector: 'form-field-with-prefix-and-suffix-example',
    imports: [KbqFormFieldModule, KbqInputModule, KbqIconModule, ReactiveFormsModule],
    providers: [kbqDisableLegacyValidationDirectiveProvider()],
    template: `
        <kbq-form-field>
            <i kbqPrefix kbq-icon="kbq-magnifying-glass_16"></i>
            <input [formControl]="formControl" kbqInput placeholder="Search" />
            <i kbqSuffix kbq-icon="kbq-info-circle_16"></i>
            <kbq-cleaner />
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldWithPrefixAndSuffixExample {
    readonly formControl = new FormControl();
}

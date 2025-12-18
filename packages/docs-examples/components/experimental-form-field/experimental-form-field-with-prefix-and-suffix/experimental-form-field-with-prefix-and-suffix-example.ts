import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components-experimental/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';

/** @title Form field with kbqPrefix and kbqSuffix */
@Component({
    selector: 'experimental-form-field-with-prefix-and-suffix-example',
    imports: [
        KbqFormFieldModule,
        KbqInputModule,
        KbqIconModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-form-field>
            <i kbqPrefix kbq-icon="kbq-magnifying-glass_16"></i>
            <input kbqInput placeholder="Search" [formControl]="formControl" />
            <i kbqSuffix kbq-icon="kbq-circle-info_16"></i>
            <kbq-cleaner />
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentalFormFieldWithPrefixAndSuffixExample {
    readonly formControl = new FormControl();
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

/** @title Form field with kbqPrefix and kbqSuffix */
@Component({
    selector: 'form-field-with-prefix-and-suffix-example',
    imports: [KbqInputModule, KbqIconModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <i kbqPrefix kbq-icon="kbq-magnifying-glass_16"></i>
            <input kbqInput [placeholder]="text().search" [formControl]="formControl" />
            <i kbqSuffix kbq-icon="kbq-circle-info_16"></i>
            <kbq-cleaner />
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldWithPrefixAndSuffixExample extends BaseLocalizedExample<ExampleText> {
    readonly formControl = new FormControl();

    constructor() {
        super(TEXT);
    }
}

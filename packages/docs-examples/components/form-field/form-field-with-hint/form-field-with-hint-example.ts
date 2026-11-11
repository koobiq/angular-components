import { ChangeDetectionStrategy, Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqInputModule } from '@koobiq/components/input';
import { map } from 'rxjs';
import { injectExampleText } from '../l10n';

/** @title Form field with kbq-hint */
@Component({
    selector: 'form-field-with-hint-example',
    imports: [KbqInputModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <kbq-label>{{ text().articleTitle }}</kbq-label>
            <input kbqInput [placeholder]="text().articleTitle" [formControl]="formControl" [maxlength]="maxLength" />
            <kbq-hint>{{ text().maxChars(maxLength, count()) }}</kbq-hint>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldWithHintExample {
    protected readonly text = injectExampleText();

    readonly formControl = new FormControl();
    readonly maxLength = 25;
    readonly count = toSignal(this.formControl.valueChanges.pipe(map((v) => v.length)), { initialValue: 0 });
}

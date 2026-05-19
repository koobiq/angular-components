import { ChangeDetectionStrategy, Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { kbqDisableLegacyValidationDirectiveProvider } from '@koobiq/components/core';
import { KbqInputModule } from '@koobiq/components/input';
import { map } from 'rxjs';

/** @title Form field with kbq-hint */
@Component({
    selector: 'form-field-with-hint-example',
    imports: [KbqInputModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <kbq-label>Article title</kbq-label>
            <input kbqInput placeholder="Article title" [formControl]="formControl" [maxlength]="maxLength" />
            <kbq-hint>Max {{ maxLength }} chars ({{ count() }}/{{ maxLength }})</kbq-hint>
        </kbq-form-field>
    `,
    providers: [kbqDisableLegacyValidationDirectiveProvider()],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldWithHintExample {
    readonly formControl = new FormControl();
    readonly maxLength = 25;
    readonly count = toSignal(this.formControl.valueChanges.pipe(map((v) => v.length)), { initialValue: 0 });
}

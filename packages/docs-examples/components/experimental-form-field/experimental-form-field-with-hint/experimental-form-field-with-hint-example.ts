import { ChangeDetectionStrategy, Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components-experimental/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { map } from 'rxjs';

/** @title Form field with kbq-hint */
@Component({
    selector: 'experimental-form-field-with-hint-example',
    imports: [KbqFormFieldModule, KbqInputModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <kbq-label>Article title</kbq-label>
            <input kbqInput placeholder="Article title" [formControl]="formControl" [maxlength]="maxLength" />
            <kbq-hint>Max {{ maxLength }} chars ({{ count() }}/{{ maxLength }})</kbq-hint>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentalFormFieldWithHintExample {
    readonly formControl = new FormControl();
    readonly maxLength = 25;
    readonly count = toSignal(this.formControl.valueChanges.pipe(map((v) => v.length)), { initialValue: 0 });
}

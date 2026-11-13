import { ChangeDetectionStrategy, Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqInputModule } from '@koobiq/components/input';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { map } from 'rxjs';
import { TRANSLATIONS } from './l10n';

/** @title Form field with kbq-hint */
@Component({
    selector: 'form-field-with-hint-example',
    imports: [KbqInputModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <kbq-label>{{ t().articleTitle }}</kbq-label>
            <input kbqInput [placeholder]="t().articleTitle" [formControl]="formControl" [maxlength]="maxLength" />
            <kbq-hint>{{ t().maxChars(maxLength, count()) }}</kbq-hint>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldWithHintExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    readonly formControl = new FormControl();
    readonly maxLength = 25;
    readonly count = toSignal(this.formControl.valueChanges.pipe(map((v) => v.length)), { initialValue: 0 });
}

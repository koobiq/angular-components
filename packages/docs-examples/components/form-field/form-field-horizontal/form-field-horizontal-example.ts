import { ChangeDetectionStrategy, Component } from '@angular/core';
import { kbqDisableLegacyValidationDirectiveProvider } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';

/** @title Form field horizontal */
@Component({
    selector: 'form-field-horizontal-example',
    imports: [KbqFormFieldModule, KbqInputModule],
    providers: [kbqDisableLegacyValidationDirectiveProvider()],
    template: `
        <kbq-form-field horizontal labelClass="flex-15" contentClass="flex-85">
            <kbq-label>Field name</kbq-label>
            <input kbqInput />
            <kbq-hint>Hint below the field</kbq-hint>
        </kbq-form-field>

        <kbq-form-field horizontal>
            <kbq-label>Field name</kbq-label>
            <input kbqInput />
            <kbq-hint>Hint below the field</kbq-hint>
        </kbq-form-field>

        <kbq-form-field horizontal labelClass="flex-35" contentClass="flex-65">
            <kbq-label>Field name</kbq-label>
            <input kbqInput />
            <kbq-hint>Hint below the field</kbq-hint>
        </kbq-form-field>

        <kbq-form-field horizontal labelClass="flex-60" contentClass="flex-40">
            <kbq-label>Field name</kbq-label>
            <input kbqInput />
            <kbq-hint>Hint below the field</kbq-hint>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: var(--kbq-size-xl);
        }

        .kbq-form-field {
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldHorizontalExample {}

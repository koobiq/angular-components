import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqInputModule } from '@koobiq/components/input';
import { injectExampleText } from '../l10n';

/** @title Form field horizontal */
@Component({
    selector: 'form-field-horizontal-example',
    imports: [KbqInputModule],
    template: `
        <kbq-form-field horizontal labelClass="flex-15" contentClass="flex-85">
            <kbq-label>{{ text().fieldName }}</kbq-label>
            <input kbqInput />
            <kbq-hint>{{ text().hintBelowField }}</kbq-hint>
        </kbq-form-field>

        <kbq-form-field horizontal>
            <kbq-label>{{ text().fieldName }}</kbq-label>
            <input kbqInput />
            <kbq-hint>{{ text().hintBelowField }}</kbq-hint>
        </kbq-form-field>

        <kbq-form-field horizontal labelClass="flex-35" contentClass="flex-65">
            <kbq-label>{{ text().fieldName }}</kbq-label>
            <input kbqInput />
            <kbq-hint>{{ text().hintBelowField }}</kbq-hint>
        </kbq-form-field>

        <kbq-form-field horizontal labelClass="flex-60" contentClass="flex-40">
            <kbq-label>{{ text().fieldName }}</kbq-label>
            <input kbqInput />
            <kbq-hint>{{ text().hintBelowField }}</kbq-hint>
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
export class FormFieldHorizontalExample {
    protected readonly text = injectExampleText();
}

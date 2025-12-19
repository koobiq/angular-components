import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { kbqDisableLegacyValidationDirectiveProvider } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqTextareaModule } from '@koobiq/components/textarea';

@Component({
    selector: 'e2e-textarea-states',
    imports: [KbqFormFieldModule, KbqTextareaModule, FormsModule, ReactiveFormsModule],
    providers: [kbqDisableLegacyValidationDirectiveProvider()],
    template: `
        <kbq-form-field>
            <kbq-label>Label | empty</kbq-label>
            <textarea kbqTextarea placeholder="Placeholder" canGrow="false"></textarea>
            <kbq-hint>Hint</kbq-hint>
        </kbq-form-field>

        <kbq-form-field>
            <kbq-label>Label | value</kbq-label>
            <textarea kbqTextarea placeholder="Placeholder" canGrow="false" [(ngModel)]="value"></textarea>
            <kbq-hint>Hint</kbq-hint>
        </kbq-form-field>

        <kbq-form-field>
            <kbq-label>Label | disabled empty</kbq-label>
            <textarea kbqTextarea placeholder="Placeholder" canGrow="false" [disabled]="true"></textarea>
            <kbq-hint>Hint</kbq-hint>
        </kbq-form-field>

        <kbq-form-field>
            <kbq-label>Label | disabled value</kbq-label>
            <textarea
                kbqTextarea
                placeholder="Placeholder"
                canGrow="false"
                [disabled]="true"
                [(ngModel)]="value"
            ></textarea>
            <kbq-hint>Hint</kbq-hint>
        </kbq-form-field>

        <kbq-form-field>
            <kbq-label>Label | invalid</kbq-label>
            <textarea kbqTextarea placeholder="Placeholder" canGrow="false" [formControl]="invalidControl"></textarea>
            <kbq-hint>Hint</kbq-hint>
            <kbq-error>Error</kbq-error>
        </kbq-form-field>

        <kbq-form-field class="cdk-keyboard-focused cdk-focused">
            <kbq-label>Label | focused</kbq-label>
            <textarea kbqTextarea placeholder="Placeholder" canGrow="false" [(ngModel)]="value"></textarea>
            <kbq-hint>Hint</kbq-hint>
        </kbq-form-field>

        <kbq-form-field class="cdk-keyboard-focused cdk-focused">
            <kbq-label>Label | focused invalid</kbq-label>
            <textarea kbqTextarea placeholder="Placeholder" canGrow="false" [formControl]="invalidControl"></textarea>
            <kbq-hint>Hint</kbq-hint>
            <kbq-error>Error</kbq-error>
        </kbq-form-field>

        <kbq-form-field>
            <kbq-label>Label | maxRows</kbq-label>
            <textarea kbqTextarea placeholder="Placeholder" [maxRows]="5" [(ngModel)]="longValue"></textarea>
            <kbq-hint>Hint</kbq-hint>
        </kbq-form-field>

        <kbq-form-field>
            <kbq-label>Label | canGrow</kbq-label>
            <textarea kbqTextarea placeholder="Placeholder" [canGrow]="true" [(ngModel)]="longValue"></textarea>
            <kbq-hint>Hint</kbq-hint>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: inline-grid;
            grid-template-columns: repeat(3, 250px);
            gap: var(--kbq-size-s);
            padding: var(--kbq-size-xxs);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eTextareaStates'
    }
})
export class E2eTextareaStates {
    protected readonly value = model('Value');
    protected readonly longValue = model(
        'In computing, a denial-of-service attack (DoS attack) is a cyber-attack in which the perpetrator seeks to make a machine or network resource unavailable to its intended users by temporarily or indefinitely disrupting services of a host connected to a network.'
    );
    protected readonly invalidControl = new FormControl('', [Validators.minLength(10), Validators.required]);

    constructor() {
        this.invalidControl.markAsTouched();
        this.invalidControl.updateValueAndValidity();
    }
}

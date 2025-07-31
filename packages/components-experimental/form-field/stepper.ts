import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { KBQ_FORM_FIELD_REF } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInput, KbqNumberInput } from '@koobiq/components/input';
import { KbqFormField } from './form-field';

const getKbqStepperToggleMissingControlError = (): Error => {
    return Error('kbq-stepper should use with kbqNumberInput');
};

/** Component which allow to increment or decrement number value. */
@Component({
    standalone: true,
    selector: 'kbq-stepper',
    exportAs: 'kbqStepper',
    imports: [KbqIconModule],
    template: `
        <i
            class="kbq-stepper__step-up"
            color="contrast-fade"
            kbq-icon-button="kbq-chevron-up-s_16"
            [tabindex]="-1"
            [autoColor]="true"
            [disabled]="control.disabled"
            (mousedown)="stepUp($event)"
        ></i>
        <i
            class="kbq-stepper__step-down"
            color="contrast-fade"
            kbq-icon-button="kbq-chevron-down-s_16"
            [tabindex]="-1"
            [autoColor]="true"
            [disabled]="control.disabled"
            (mousedown)="stepDown($event)"
        ></i>
    `,
    styleUrl: './stepper.scss',
    host: {
        class: 'kbq-stepper___EXPERIMENTAL'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqStepper {
    // @TODO fix types (#DS-2915)
    private readonly formField = inject(KBQ_FORM_FIELD_REF, { optional: true }) as unknown as KbqFormField | undefined;

    /** Whether the stepper is visible.
     * @deprecated stepper should be always visible when provided, so this parameter is redundant */
    visible = true;

    /** Form field number control. */
    protected get control(): KbqNumberInput {
        const control = this.formField?.control;

        if (!(control instanceof KbqInput && control.numberInput)) {
            throw getKbqStepperToggleMissingControlError();
        }

        return control.numberInput;
    }

    protected stepUp(event: MouseEvent) {
        event.stopPropagation();
        this.control.stepUp(this.control.step);
    }

    protected stepDown(event: MouseEvent) {
        event.stopPropagation();
        this.control.stepDown(this.control.step);
    }
}

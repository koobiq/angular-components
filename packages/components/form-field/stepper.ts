import { ChangeDetectionStrategy, Component, EventEmitter, inject, Output, ViewEncapsulation } from '@angular/core';
import { KBQ_FORM_FIELD_REF } from '@koobiq/components/core';
import { KbqFormFieldControl } from './form-field-control';

const getKbqStepperToggleMissingControlError = (): Error => {
    return Error('kbq-stepper should use with kbqNumberInput');
};

/**
 * Used as temporary solution to resolve circular dependency.
 * Moving `KbqStepper` to standalone will resolve the issue
 */
type KbqNumberInput = KbqFormFieldControl<unknown> & {
    stepUp: (val: number) => void;
    stepDown: (val: number) => void;
    step: number;
};

@Component({
    selector: 'kbq-stepper',
    template: `
        <i
            class="kbq-stepper-step-up"
            [small]="true"
            [tabindex]="-1"
            [autoColor]="true"
            [disabled]="control.disabled"
            (mousedown)="onStepUp($event)"
            color="contrast-fade"
            kbq-icon-button="kbq-chevron-down_16"
        ></i>
        <i
            class="kbq-stepper-step-down"
            [small]="true"
            [tabindex]="-1"
            [autoColor]="true"
            [disabled]="control.disabled"
            (mousedown)="onStepDown($event)"
            color="contrast-fade"
            kbq-icon-button="kbq-chevron-down_16"
        ></i>
    `,
    styleUrls: ['stepper.scss'],
    host: {
        class: 'kbq-stepper'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqStepper {
    private readonly formField = inject(KBQ_FORM_FIELD_REF, { optional: true });

    @Output()
    readonly stepUp: EventEmitter<void> = new EventEmitter<void>();
    @Output()
    readonly stepDown: EventEmitter<void> = new EventEmitter<void>();

    /** Form field number control. */
    protected get control(): KbqNumberInput {
        const control = this.formField?.control;

        if (!control?.numberInput) {
            throw getKbqStepperToggleMissingControlError();
        }

        return control.numberInput;
    }

    connectTo(numberInput: KbqNumberInput) {
        if (!numberInput) return;

        this.stepUp.subscribe(() => {
            numberInput.stepUp(numberInput.step);
        });

        this.stepDown.subscribe(() => {
            numberInput.stepDown(numberInput.step);
        });
    }

    onStepUp($event: MouseEvent) {
        this.stepUp.emit();
        $event.preventDefault();
    }

    onStepDown($event: MouseEvent) {
        this.stepDown.emit();
        $event.preventDefault();
    }
}

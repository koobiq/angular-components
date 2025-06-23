import { ChangeDetectionStrategy, Component, EventEmitter, inject, Output, ViewEncapsulation } from '@angular/core';
import { KBQ_FORM_FIELD_REF } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInput, KbqNumberInput } from '@koobiq/components/input';

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

    /** Emitted when the stepper is incremented. */
    @Output() readonly stepUp: EventEmitter<void> = new EventEmitter<void>();

    /** Emitted when the stepper is decremented. */
    @Output() readonly stepDown: EventEmitter<void> = new EventEmitter<void>();

    /**
     * Form field number control.
     *
     * @docs-private
     */
    protected get control(): KbqNumberInput {
        const control = this.formField?.control;

        if (!(control instanceof KbqInput && control.numberInput)) {
            throw getKbqStepperToggleMissingControlError();
        }

        return control.numberInput;
    }

    /**
     * @docs-private
     */
    connectTo(numberInput: KbqNumberInput): void {
        if (!numberInput) return;

        this.stepUp.subscribe(() => {
            numberInput.stepUp(numberInput.step);
        });

        this.stepDown.subscribe(() => {
            numberInput.stepDown(numberInput.step);
        });
    }

    /**
     * @docs-private
     */
    onStepUp($event: MouseEvent): void {
        this.stepUp.emit();
        $event.preventDefault();
    }

    /**
     * @docs-private
     */
    onStepDown($event: MouseEvent): void {
        this.stepDown.emit();
        $event.preventDefault();
    }
}

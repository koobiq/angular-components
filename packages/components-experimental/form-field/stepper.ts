import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { KBQ_FORM_FIELD_REF } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInput, KbqNumberInput } from '@koobiq/components/input';
import { KbqFormField } from './form-field';

/** @docs-private */
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
            class="kbq-stepper_step-up"
            [small]="true"
            [tabindex]="-1"
            [autoColor]="true"
            (click)="stepUp($event)"
            color="contrast-fade"
            kbq-icon-button="kbq-chevron-down_16"
        ></i>
        <i
            class="kbq-stepper_step-down"
            [small]="true"
            [tabindex]="-1"
            [autoColor]="true"
            (mousedown)="stepDown($event)"
            color="contrast-fade"
            kbq-icon-button="kbq-chevron-down_16"
        ></i>
    `,
    styleUrl: './stepper.scss',
    host: {
        class: 'kbq-stepper___EXPERIMENTAL',
        '[style.visibility]': 'visible ? "visible" : "hidden"',
        '[attr.aria-hidden]': '!visible'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqStepper {
    // @TODO fix types (#DS-2915)
    private readonly formField = inject(KBQ_FORM_FIELD_REF, { optional: true }) as unknown as KbqFormField | undefined;

    /** Whether the stepper is visible. */
    get visible(): boolean {
        return !!((this.formField?.focused || this.formField?.hovered) && !this.formField?.disabled);
    }

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

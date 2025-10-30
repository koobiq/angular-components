import { ChangeDetectionStrategy, Component, EventEmitter, inject, Output, ViewEncapsulation } from '@angular/core';
import { KBQ_FORM_FIELD_REF } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { concatMap, interval, Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { KbqFormFieldControl } from './form-field-control';

// @TODO Temporary solution to resolve circular dependency (#DS-3893)
type KbqNumberInput = KbqFormFieldControl<unknown> & {
    stepUp: (step: number) => void;
    stepDown: (step: number) => void;
    step: number;
};

// @TODO Temporary solution to resolve circular dependency (#DS-3893)
const isNumberInput = (control: KbqFormFieldControl<unknown>): control is KbqNumberInput => {
    return 'stepUp' in control && 'stepDown' in control;
};

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
            color="contrast-fade"
            kbq-icon-button="kbq-chevron-up-s_16"
            [tabindex]="-1"
            [autoColor]="true"
            [disabled]="control.disabled"
            (mousedown)="onStepUp($event)"
            (mouseup)="mouseUp.next()"
        ></i>
        <i
            class="kbq-stepper-step-down"
            color="contrast-fade"
            kbq-icon-button="kbq-chevron-down-s_16"
            [tabindex]="-1"
            [autoColor]="true"
            [disabled]="control.disabled"
            (mousedown)="onStepDown($event)"
            (mouseup)="mouseUp.next()"
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

    /** @docs-private */
    protected readonly mouseUp = new Subject<void>();

    /**
     * Timing observable simulating long press in native input-number.
     * - Value increases/decreases by step immediately.
     * - Brief pause (`300ms`)
     * - Numbers start running upward with selected speed
     * (controlled by interval period `75ms`)
     * @docs-private
     */
    protected readonly mouseHoldInterval = timer(300).pipe(
        concatMap(() => interval(75)),
        takeUntil(this.mouseUp)
    );

    /**
     * Form field number control.
     *
     * @docs-private
     */
    protected get control(): KbqNumberInput {
        const control = this.formField?.control;
        const input = control.numberInput;

        if (!isNumberInput(input)) {
            throw getKbqStepperToggleMissingControlError();
        }

        return input;
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
        this.mouseHoldInterval.subscribe(() => this.stepUp.emit());
        $event.preventDefault();
    }

    /**
     * @docs-private
     */
    onStepDown($event: MouseEvent): void {
        this.stepDown.emit();
        this.mouseHoldInterval.subscribe(() => this.stepDown.emit());
        $event.preventDefault();
    }
}

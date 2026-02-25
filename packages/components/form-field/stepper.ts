import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Output, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KBQ_FORM_FIELD_REF } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { concatMap, fromEvent, interval, Subject, timer } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
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

/**
 * Timeout duration when clicking the up/down arrow
 * @docs-private
 */
export const KBQ_STEPPER_INITIAL_TIMEOUT = 300;

/**
 * Interval delay when clicking the up/down arrow
 * @docs-private
 */
export const KBQ_STEPPER_INTERVAL_DELAY = 75;

/** Component which allow to increment or decrement number value. */
@Component({
    selector: 'kbq-stepper',
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
        ></i>
        <i
            class="kbq-stepper-step-down"
            color="contrast-fade"
            kbq-icon-button="kbq-chevron-down-s_16"
            [tabindex]="-1"
            [autoColor]="true"
            [disabled]="control.disabled"
            (mousedown)="onStepDown($event)"
        ></i>
    `,
    styleUrls: ['stepper.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'kbqStepper',
    host: {
        class: 'kbq-stepper'
    }
})
export class KbqStepper {
    private readonly formField = inject(KBQ_FORM_FIELD_REF, { optional: true });
    private readonly document = inject<Document>(DOCUMENT);

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
     * - Numbers start running upward/downward with selected speed
     * (controlled by interval period)
     * @see KBQ_STEPPER_INTERVAL_DELAY
     * @see KBQ_STEPPER_INITIAL_TIMEOUT
     * @docs-private
     */
    private readonly longPress = timer(KBQ_STEPPER_INITIAL_TIMEOUT).pipe(
        concatMap(() => interval(KBQ_STEPPER_INTERVAL_DELAY)),
        takeUntilDestroyed(),
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

    /** @docs-private */
    onStepUp($event: MouseEvent): void {
        this.handleStep($event, this.stepUp);
    }

    /** @docs-private */
    onStepDown($event: MouseEvent): void {
        this.handleStep($event, this.stepDown);
    }

    private handleStep($event: MouseEvent, emitter: EventEmitter<void>): void {
        if (this.control.disabled) return;

        emitter.emit();
        // handle case when cursor is out of viewport.
        fromEvent(this.document, 'mouseup')
            .pipe(take(1))
            .subscribe(() => this.mouseUp.next());
        this.longPress.subscribe(() => emitter.emit());
        $event.preventDefault();
    }
}

import { DOCUMENT } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    inject,
    output,
    OutputEmitterRef,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KBQ_FORM_FIELD_REF } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { concatMap, fromEvent, interval, Subject, timer } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { KbqFormFieldControl } from './form-field-control';

/**
 * The subset of `KbqNumberInput` the stepper drives.
 *
 * Declared here instead of imported from `@koobiq/components/input` to break the circular dependency
 * between the packages (#DS-3893).
 */
export interface KbqNumberInputControl extends KbqFormFieldControl<unknown> {
    /** Increases the value by `step`. */
    stepUp: (step: number) => void;
    /** Decreases the value by `step`. */
    stepDown: (step: number) => void;
    /** Amount the value changes by on a single step. */
    step: number;
}

const isNumberInput = (control: KbqFormFieldControl<unknown>): control is KbqNumberInputControl => {
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
            aria-hidden="true"
            class="kbq-stepper-step-up"
            color="contrast-fade"
            kbq-icon-button="kbq-chevron-up-s_16"
            [tabindex]="-1"
            [autoColor]="true"
            [disabled]="control().disabled"
            (mousedown)="onStepUp($event)"
        ></i>
        <i
            aria-hidden="true"
            class="kbq-stepper-step-down"
            color="contrast-fade"
            kbq-icon-button="kbq-chevron-down-s_16"
            [tabindex]="-1"
            [autoColor]="true"
            [disabled]="control().disabled"
            (mousedown)="onStepDown($event)"
        ></i>
    `,
    styleUrls: ['stepper.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-stepper'
    },
    exportAs: 'kbqStepper'
})
export class KbqStepper {
    private readonly formField = inject(KBQ_FORM_FIELD_REF, { optional: true });
    private readonly document = inject<Document>(DOCUMENT);
    private readonly destroyRef = inject(DestroyRef);

    /** Emitted when the stepper is incremented. */
    readonly stepUp = output<void>();

    /** Emitted when the stepper is decremented. */
    readonly stepDown = output<void>();

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

    /** Whether `connectTo` has already wired the number input. */
    private connected = false;

    /**
     * Form field number control. Resolved once per control change instead of on every template read.
     *
     * @docs-private
     */
    protected readonly control = computed<KbqNumberInputControl>(() => {
        const control = this.formField?.control();
        const input = (control as { numberInput?: KbqFormFieldControl<unknown> })?.numberInput;

        if (!input || !isNumberInput(input)) {
            throw getKbqStepperToggleMissingControlError();
        }

        return input;
    });

    constructor() {
        this.destroyRef.onDestroy(() => this.mouseUp.complete());
    }

    /**
     * @docs-private
     */
    connectTo(numberInput: KbqNumberInputControl): void {
        // The form field calls it on every content init, and the outputs must not be wired twice.
        if (!numberInput || this.connected) return;

        this.connected = true;

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

    private handleStep($event: MouseEvent, emitter: OutputEmitterRef<void>): void {
        if (this.control().disabled) return;

        emitter.emit();
        // handle case when cursor is out of viewport.
        fromEvent(this.document, 'mouseup')
            .pipe(take(1), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.mouseUp.next());
        this.longPress.subscribe(() => emitter.emit());
        $event.preventDefault();
    }
}

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
import { KbqIconModule } from '@koobiq/components/icon';
import { concatMap, fromEvent, interval, Subject, timer } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { KBQ_FORM_FIELD } from './form-field';
import type { KbqFormFieldControl } from './form-field-control';

/**
 * Narrow structural contract for the control hosted by `kbqNumberInput`, duck-typed here to avoid
 * a circular dependency between `@koobiq/components/form-field` and `@koobiq/components/input`.
 */
type KbqStepperControl = KbqFormFieldControl<unknown> & {
    readonly controlType: 'input-number';
    readonly step: number;
    stepUp: (step: number) => void;
    /** Decreases the value by `step`. */
    stepDown: (step: number) => void;
};

/**
 * Checks whether the given value structurally matches `KbqStepperControl`.
 */
const isStepperControl = (control: unknown): control is KbqStepperControl => {
    return (
        !!control &&
        typeof control === 'object' &&
        'controlType' in control &&
        control.controlType === 'input-number' &&
        'stepUp' in control &&
        typeof control.stepUp === 'function' &&
        'stepDown' in control &&
        typeof control.stepDown === 'function'
    );
};

const getKbqStepperToggleMissingControlError = (): Error => {
    return Error('You should use kbq-stepper with kbqNumberInput');
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
    private readonly formField = inject(KBQ_FORM_FIELD, { optional: true });
    private readonly document = inject(DOCUMENT);
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

    /**
     * Form field number control. Resolved once per control change instead of on every template read.
     *
     * @docs-private
     */
    protected readonly control = computed<KbqStepperControl>(() => {
        const control = this.formField?.control();
        // `formFieldControl` here is `KbqInput` (it owns the `KbqFormFieldControl` provider on
        // `<input kbqNumberInput>`), not the number-input itself: `stepUp`/`stepDown`/`step`
        // live on the sibling `KbqNumberInput` directive, reachable only via `KbqInput.numberInput`.
        const inputNumberControl =
            control?.controlType === 'input-number' && 'numberInput' in control ? control.numberInput : null;

        if (!isStepperControl(inputNumberControl)) {
            throw getKbqStepperToggleMissingControlError();
        }

        return inputNumberControl;
    });

    constructor() {
        this.destroyRef.onDestroy(() => this.mouseUp.complete());
    }

    /**
     * @deprecated No longer required — `KbqStepper` resolves its control automatically via DI.
     * @docs-private
     */
    connectTo(_: any): void {}

    /** @docs-private */
    onStepUp(event: MouseEvent): void {
        this.handleStep(event, (control) => control.stepUp(control.step), this.stepUp);
    }

    /** @docs-private */
    onStepDown(event: MouseEvent): void {
        this.handleStep(event, (control) => control.stepDown(control.step), this.stepDown);
    }

    private handleStep(
        event: MouseEvent,
        step: (control: KbqStepperControl) => void,
        emitter: OutputEmitterRef<void>
    ): void {
        const control = this.control();

        if (control.disabled) return;

        const performStep = () => {
            step(control);
            emitter.emit();
        };

        performStep();
        // handle case when cursor is out of viewport.
        fromEvent(this.document, 'mouseup')
            .pipe(take(1), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.mouseUp.next());
        this.longPress.subscribe(performStep);
        event.preventDefault();
    }
}

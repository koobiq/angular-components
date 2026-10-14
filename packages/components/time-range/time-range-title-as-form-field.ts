import { _IdGenerator, FocusMonitor } from '@angular/cdk/a11y';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    Directive,
    DoCheck,
    effect,
    ElementRef,
    inject,
    OnDestroy,
    signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroupDirective, NgControl, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher, KbqErrorStateTracker } from '@koobiq/components/core';
import { KBQ_FORM_FIELD, KbqFormFieldControl } from '@koobiq/components/form-field';
import { Observable, Subject } from 'rxjs';
import { KbqTimeRange } from './time-range';
import { KbqTimeRangeRange } from './types';

/** Directive for easy using styles of time-range placeholder publicly. */
@Directive({
    selector: '[kbqTimeRangeTitlePlaceholder]',
    host: {
        class: 'kbq-time-range-title__placeholder'
    }
})
export class KbqTimeRangeTitlePlaceholder {}

/** Component simulates `KbqFormFieldControl` allowing to provide custom content inside `KbqFormField` */
@Component({
    selector: 'kbq-time-range-title-as-control',
    template: `
        <ng-content />
    `,
    styles: `
        :host {
            &:focus-visible {
                outline: none;
            }
            display: flex;
            align-items: center;
        }
    `,
    providers: [
        {
            provide: KbqFormFieldControl,
            useExisting: KbqTimeRangeTitleAsControl
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[attr.id]': 'id',
        '[attr.tabindex]': 'disabled ? null : 0',
        '[attr.aria-labelledby]': 'ariaLabelledby()',
        class: 'kbq-time-range-title-as-form-field'
    }
})
export class KbqTimeRangeTitleAsControl implements KbqFormFieldControl<KbqTimeRangeRange>, DoCheck, OnDestroy {
    private readonly timeRange = inject(KbqTimeRange);
    private readonly parentFormField = inject(KBQ_FORM_FIELD, { host: true, optional: true });
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly focusMonitor = inject(FocusMonitor);
    private readonly stateChangesSubject = new Subject<void>();
    private readonly errorStateSignal = signal(false);
    private readonly errorStateTracker: KbqErrorStateTracker;

    /** @docs-private */
    readonly controlType = 'select';
    /** @docs-private */
    readonly isNativeLabelSupported = false;
    /**
     * Id of the `kbq-form-field` caption naming this control, when it has one.
     *
     * A `<label for>` does not associate with a custom element, so the relationship is expressed the
     * other way around — from the control to the label.
     * @docs-private
     */
    protected readonly ariaLabelledby = computed(() => this.parentFormField?.labelId() ?? null);
    /** @docs-private */
    readonly stateChanges: Observable<void> = this.stateChangesSubject;
    /** @docs-private */
    readonly ngControl: NgControl | null = this.timeRange.ngControl;
    /** @docs-private */
    readonly id: string = inject(_IdGenerator).getId('kbq-time-range-title-as-control-');
    /** @docs-private */
    readonly placeholder = '';
    /** @docs-private */
    focused = false;

    /** @docs-private */
    get value(): KbqTimeRangeRange | null {
        return this.timeRange.value();
    }

    /** @docs-private */
    get empty(): boolean {
        return this.timeRange.value() === null;
    }

    /** @docs-private */
    get required(): boolean {
        return !!this.ngControl?.control?.hasValidator(Validators.required);
    }

    /** @docs-private */
    get disabled(): boolean {
        return this.timeRange.disabled();
    }

    /**
     * Whether the error state is currently shown.
     *
     * Backed by a signal rather than the tracker's own field: `KbqFormField` reads this while it
     * renders, and the tracker is only refreshed from `ngDoCheck`, which runs after the form field
     * has already rendered. A plain boolean left the error a pass behind - and left a control that
     * only became `touched` with nothing to schedule that pass at all.
     * @docs-private
     */
    get errorState(): boolean {
        return this.errorStateSignal();
    }

    constructor() {
        this.errorStateTracker = new KbqErrorStateTracker(
            inject(ErrorStateMatcher),
            this.ngControl,
            inject(FormGroupDirective, { optional: true }),
            inject(NgForm, { optional: true }),
            this.stateChangesSubject
        );

        this.focusMonitor
            .monitor(this.elementRef, true)
            .pipe(takeUntilDestroyed())
            .subscribe((origin) => {
                this.focused = !!origin;
                this.stateChangesSubject.next();
            });

        // The value and the disabled state live in signals on the host, and `KbqFormField` only
        // learns that any of them moved through `stateChanges`.
        effect(() => {
            this.timeRange.value();
            this.timeRange.disabled();

            this.stateChangesSubject.next();
        });
    }

    /** @docs-private */
    ngDoCheck(): void {
        this.errorStateTracker.updateErrorState();
        this.errorStateSignal.set(this.errorStateTracker.errorState);
    }

    /** @docs-private */
    ngOnDestroy(): void {
        this.focusMonitor.stopMonitoring(this.elementRef);
        this.stateChangesSubject.complete();
    }

    /** @docs-private */
    onContainerClick(_event: MouseEvent): void {
        this.focus();
    }

    /** @docs-private */
    focus(options?: FocusOptions): void {
        this.elementRef.nativeElement.focus(options);
    }
}

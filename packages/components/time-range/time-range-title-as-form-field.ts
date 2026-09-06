import { FocusMonitor } from '@angular/cdk/a11y';
import {
    ChangeDetectionStrategy,
    Component,
    Directive,
    DoCheck,
    effect,
    ElementRef,
    inject,
    OnDestroy
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroupDirective, NgControl, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher, KbqErrorStateTracker } from '@koobiq/components/core';
import { KbqFormFieldControl } from '@koobiq/components/form-field';
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

let nextUniqueId = 0;

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
        class: 'kbq-time-range-title-as-form-field'
    }
})
export class KbqTimeRangeTitleAsControl implements KbqFormFieldControl<KbqTimeRangeRange>, DoCheck, OnDestroy {
    private readonly timeRange = inject(KbqTimeRange);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly focusMonitor = inject(FocusMonitor);
    private readonly stateChangesSubject = new Subject<void>();
    private readonly errorStateTracker: KbqErrorStateTracker;

    /** @docs-private */
    readonly controlType = 'select';
    /** @docs-private */
    readonly stateChanges: Observable<void> = this.stateChangesSubject;
    /** @docs-private */
    readonly ngControl: NgControl | null = this.timeRange.ngControl;
    /** @docs-private */
    readonly id = `kbq-time-range-title-as-control-${nextUniqueId++}`;
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

    /** @docs-private */
    get errorState(): boolean {
        return this.errorStateTracker.errorState;
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

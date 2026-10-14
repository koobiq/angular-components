import { _IdGenerator } from '@angular/cdk/a11y';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    Directive,
    DoCheck,
    ElementRef,
    inject,
    Signal,
    signal
} from '@angular/core';
import { FormGroupDirective, NgControl, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher, KbqErrorStateTracker } from '@koobiq/components/core';
import { KBQ_FORM_FIELD, KbqFormFieldControl } from '@koobiq/components/form-field';
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
            display: flex;
            align-items: center;
        }

        :host(:focus-visible) {
            outline: none;
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
        '[attr.tabindex]': 'disabled() ? null : 0',
        '[attr.id]': 'id()',
        '[attr.aria-labelledby]': 'ariaLabelledby()',
        class: 'kbq-time-range-title-as-form-field',
        '(focus)': 'focusedValue.set(true)',
        '(blur)': 'focusedValue.set(false)'
    }
})
export class KbqTimeRangeTitleAsControl implements KbqFormFieldControl<KbqTimeRangeRange>, DoCheck {
    private readonly timeRange = inject(KbqTimeRange);
    private readonly parentFormField = inject(KBQ_FORM_FIELD, { host: true, optional: true });
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly requiredValue = signal(false);
    /** @docs-private */
    protected readonly focusedValue = signal(false);

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
    readonly ngControl: NgControl | null = this.timeRange.ngControl;

    private readonly errorStateTracker = new KbqErrorStateTracker(
        inject(ErrorStateMatcher),
        this.ngControl,
        inject(FormGroupDirective, { optional: true }),
        inject(NgForm, { optional: true })
    );

    /** @docs-private */
    readonly value: Signal<KbqTimeRangeRange | null> = this.timeRange.value;
    /** @docs-private */
    readonly id = signal(inject(_IdGenerator).getId('kbq-time-range-title-as-control-')).asReadonly();
    /** @docs-private */
    readonly placeholder = signal<string | undefined>(undefined).asReadonly();
    /** @docs-private */
    readonly focused = this.focusedValue.asReadonly();
    /** @docs-private */
    readonly empty = computed(() => this.timeRange.value() === null);
    /** @docs-private */
    readonly required = this.requiredValue.asReadonly();
    /** @docs-private */
    readonly disabled: Signal<boolean> = this.timeRange.disabled;
    /** @docs-private */
    readonly errorState = this.errorStateTracker.errorState;

    /**
     * The validators and the touched state of the bound control notify nothing a signal could follow.
     * @docs-private
     */
    ngDoCheck(): void {
        this.errorStateTracker.updateErrorState();
        this.requiredValue.set(!!this.ngControl?.control?.hasValidator(Validators.required));
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

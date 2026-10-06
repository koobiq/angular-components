import { ChangeDetectionStrategy, Component, Directive, computed, inject } from '@angular/core';
import { NgControl } from '@angular/forms';
import { KBQ_FORM_FIELD, KbqFormFieldControl } from '@koobiq/components/form-field';
import { Observable, Subject } from 'rxjs';
import { KbqTimeRange } from './time-range';

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
        '[attr.tabindex]': '0',
        '[attr.aria-labelledby]': 'ariaLabelledby()',
        class: 'kbq-time-range-title-as-form-field'
    }
})
export class KbqTimeRangeTitleAsControl implements KbqFormFieldControl<any> {
    private timeRange = inject(KbqTimeRange);
    private readonly parentFormField = inject(KBQ_FORM_FIELD, { host: true, optional: true });

    /** @docs-private */
    controlType = 'select';
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
    stateChanges: Observable<void> = new Subject<void>();
    /** @docs-private */
    ngControl: NgControl | null = this.timeRange.ngControl;
    /** @docs-private */
    value: any;
    /** @docs-private */
    id: string;
    /** @docs-private */
    placeholder: string;
    /** @docs-private */
    focused: boolean;
    /** @docs-private */
    empty: boolean;
    /** @docs-private */
    required: boolean;
    /** @docs-private */
    disabled: boolean;
    /** @docs-private */
    errorState: boolean;
    /** @docs-private */
    onContainerClick(_event: MouseEvent): void {}
    /** @docs-private */
    focus(_options?: FocusOptions): void {}
}

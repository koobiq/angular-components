import { _IdGenerator } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, Directive, inject } from '@angular/core';
import { NgControl } from '@angular/forms';
import { KbqFormField, KbqFormFieldControl } from '@koobiq/components/form-field';
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
    providers: [
        {
            provide: KbqFormFieldControl,
            useExisting: KbqTimeRangeTitleAsControl
        }
    ],
    host: {
        '[attr.id]': 'id',
        '[attr.tabindex]': '0',
        '[attr.aria-labelledby]': 'ariaLabelledby',
        class: 'kbq-time-range-title-as-form-field'
    },
    styles: `
        :host {
            &:focus-visible {
                outline: none;
            }
            display: flex;
            align-items: center;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqTimeRangeTitleAsControl implements KbqFormFieldControl<any> {
    private timeRange = inject(KbqTimeRange);
    private readonly parentFormField = inject(KbqFormField, { host: true, optional: true });

    /** @docs-private */
    controlType = 'select';
    /** @docs-private */
    readonly isNativeLabelSupported = false;
    /** @docs-private */
    stateChanges: Observable<void> = new Subject<void>();
    /** @docs-private */
    ngControl: NgControl | null = this.timeRange.ngControl;
    /** @docs-private */
    value: any;
    /** @docs-private */
    id: string = inject(_IdGenerator).getId('kbq-time-range-title-as-control-');
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

    /**
     * Id of the `kbq-form-field` caption naming this control, when it has one.
     *
     * A `<label for>` does not associate with a custom element, so the relationship is expressed the
     * other way around — from the control to the label.
     * @docs-private
     */
    protected get ariaLabelledby(): string | null {
        return this.parentFormField?.labelId ?? null;
    }
}

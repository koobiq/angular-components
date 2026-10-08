import { _IdGenerator } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, computed, Directive, inject, signal } from '@angular/core';
import { NgControl } from '@angular/forms';
import { KBQ_FORM_FIELD, KbqFormFieldControl } from '@koobiq/components/form-field';
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
        '[attr.id]': 'id()',
        '[attr.aria-labelledby]': 'ariaLabelledby()',
        class: 'kbq-time-range-title-as-form-field'
    }
})
export class KbqTimeRangeTitleAsControl implements KbqFormFieldControl<any> {
    private timeRange = inject(KbqTimeRange);
    private readonly parentFormField = inject(KBQ_FORM_FIELD, { host: true, optional: true });

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
    /** @docs-private */
    readonly value = signal<any>(null).asReadonly();
    /** @docs-private */
    readonly id = signal(inject(_IdGenerator).getId('kbq-time-range-title-')).asReadonly();
    /** @docs-private */
    readonly placeholder = signal<string | undefined>(undefined).asReadonly();
    /** @docs-private */
    readonly focused = signal(false).asReadonly();
    /** @docs-private */
    readonly empty = signal(false).asReadonly();
    /** @docs-private */
    readonly required = signal(false).asReadonly();
    /** @docs-private */
    readonly disabled = signal(false).asReadonly();
    /** @docs-private */
    readonly errorState = signal(false).asReadonly();
    /** @docs-private */
    onContainerClick(_event: MouseEvent): void {}
    /** @docs-private */
    focus(_options?: FocusOptions): void {}
}

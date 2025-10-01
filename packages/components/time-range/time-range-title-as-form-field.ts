import { ChangeDetectionStrategy, Component, Directive, inject } from '@angular/core';
import { NgControl } from '@angular/forms';
import { KbqFormFieldControl } from '@koobiq/components/form-field';
import { Observable, Subject } from 'rxjs';
import { KbqTimeRange } from './time-range';

/** Directive for easy using styles of time-range placeholder publicly. */
@Directive({
    standalone: true,
    selector: '[kbqTimeRangeTitlePlaceholder]',
    host: {
        class: 'kbq-time-range-title__placeholder'
    }
})
export class KbqTimeRangeTitlePlaceholder {}

/** Component simulates `KbqFormFieldControl` allowing to provide custom content inside `KbqFormField` */
@Component({
    standalone: true,
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
        '[attr.tabindex]': '0',
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

    controlType = 'select';
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

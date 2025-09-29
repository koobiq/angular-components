import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgControl } from '@angular/forms';
import { KbqFormFieldControl } from '@koobiq/components/form-field';
import { Observable, Subject } from 'rxjs';
import { KbqTimeRange } from './time-range';

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

    stateChanges: Observable<void> = new Subject<void>();
    ngControl: NgControl | null = this.timeRange.ngControl;
    controlType = 'select';
    value: any;
    id: string;
    placeholder: string;
    focused: boolean;
    empty: boolean;
    required: boolean;
    disabled: boolean;
    errorState: boolean;
    onContainerClick(_event: MouseEvent): void {}
    focus(_options?: FocusOptions): void {}
}

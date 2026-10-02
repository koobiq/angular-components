import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqRadioModule } from '@koobiq/components/radio';
import { KbqSkeletonCheckable } from '@koobiq/components/skeleton';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Skeleton checkable preset
 */
@Component({
    selector: 'skeleton-checkable-example',
    imports: [
        KbqSkeletonCheckable,
        KbqToggleModule,
        FormsModule,
        KbqCheckboxModule,
        KbqRadioModule,
        KbqFormFieldModule
    ],
    template: `
        <kbq-toggle [(ngModel)]="loading">Loading</kbq-toggle>

        @if (loading()) {
            <kbq-skeleton-checkable hint />
            <kbq-skeleton-checkable control="radio" [rows]="3" />
            <kbq-skeleton-checkable control="toggle" hint />
        } @else {
            <kbq-checkbox>
                Synchronize every hour
                <kbq-hint>The next synchronization starts at 12:00</kbq-hint>
            </kbq-checkbox>
            <kbq-radio-group name="protocol">
                <kbq-radio-button [checked]="true" [value]="'ldaps'">LDAPS</kbq-radio-button>
                <kbq-radio-button [value]="'ldap'">LDAP</kbq-radio-button>
                <kbq-radio-button [value]="'starttls'">LDAP with StartTLS</kbq-radio-button>
            </kbq-radio-group>
            <kbq-toggle>
                Notify the administrators
                <kbq-hint>By email and in the notification center</kbq-hint>
            </kbq-toggle>
        }
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: var(--kbq-size-xl);
            padding: var(--kbq-size-xl);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonCheckableExample {
    protected readonly loading = model(true);
}

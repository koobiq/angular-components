import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqDlModule } from '@koobiq/components/dl';
import { KbqSkeletonDl } from '@koobiq/components/skeleton';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Skeleton description list preset
 */
@Component({
    selector: 'skeleton-dl-example',
    imports: [KbqSkeletonDl, KbqToggleModule, FormsModule, KbqDlModule],
    template: `
        <kbq-toggle [(ngModel)]="loading">Loading</kbq-toggle>

        @if (loading()) {
            <kbq-skeleton-dl />
        } @else {
            <kbq-dl>
                @for (item of items; track item.term) {
                    <kbq-dt>{{ item.term }}</kbq-dt>
                    <kbq-dd>{{ item.value }}</kbq-dd>
                }
            </kbq-dl>
        }
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-xl);
            padding: var(--kbq-size-xl);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonDlExample {
    protected readonly loading = model(true);
    protected readonly items = [
        { term: 'Domain', value: 'domain-LDAP-7f7d60de-d36d-46df-80b9-8f272c32ae43' },
        { term: 'Connection type', value: 'Synchronization and authentication' },
        { term: 'Servers', value: 'productname1.security.com:555, productname2.security.com:556' }
    ];
}

import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqDlModule } from '@koobiq/components/dl';
import { KbqSkeleton } from '@koobiq/components/skeleton';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Skeleton with description list
 */
@Component({
    selector: 'skeleton-dl-example',
    imports: [KbqSkeleton, KbqToggleModule, FormsModule, KbqDlModule],
    template: `
        <kbq-toggle [(ngModel)]="loading">Loading</kbq-toggle>

        <kbq-dl class="example-dl">
            @for (item of items; track item.term) {
                <kbq-dt>
                    <span [kbqSkeleton]="loading()">{{ item.term }}</span>
                </kbq-dt>
                <kbq-dd>
                    <span [kbqSkeleton]="loading()">{{ item.value }}</span>
                </kbq-dd>
            }
        </kbq-dl>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--kbq-size-xl);
            padding: var(--kbq-size-xl);
        }

        .example-dl {
            align-self: stretch;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonDlExample {
    protected readonly loading = model(true);

    protected readonly items = [
        { term: 'Domain', value: 'domain-LDAP-7f7d60de-d36d-46df-80b9-8f272c32ae43' },
        { term: 'Connection type', value: 'Synchronization and authentication' },
        { term: 'Servers', value: 'productname1.security.com:555, productname2.security.com:556' },
        { term: 'Base DN', value: 'dc=security,dc=com' }
    ];
}

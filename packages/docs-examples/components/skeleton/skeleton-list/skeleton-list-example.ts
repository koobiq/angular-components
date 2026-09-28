import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqListModule } from '@koobiq/components/list';
import { KbqSkeleton } from '@koobiq/components/skeleton';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Skeleton with list
 */
@Component({
    selector: 'skeleton-list-example',
    imports: [KbqSkeleton, KbqToggleModule, FormsModule, KbqListModule],
    template: `
        <kbq-toggle [(ngModel)]="loading">Loading</kbq-toggle>

        <kbq-list-selection aria-label="Servers" class="example-list" [disabled]="loading()" [(ngModel)]="selected">
            @for (server of servers; track server) {
                <kbq-list-option [value]="server">
                    <span [kbqSkeleton]="loading()">{{ server }}</span>
                </kbq-list-option>
            }
        </kbq-list-selection>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--kbq-size-xl);
            padding: var(--kbq-size-xl);
        }

        .example-list {
            align-self: stretch;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonListExample {
    protected readonly loading = model(true);
    protected readonly selected = model<string[]>([]);
    protected readonly servers = [
        'productname1.security.com',
        'productname2.security.com',
        'productname3.security.com',
        'ldap.security.com',
        'backup.security.com'
    ];
}

import { ChangeDetectionStrategy, Component, inject, signal, TemplateRef } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDlModule } from '@koobiq/components/dl';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqSidepanelModule, KbqSidepanelService } from '@koobiq/components/sidepanel';
import { KbqSkeleton } from '@koobiq/components/skeleton';
import { KbqTableModule } from '@koobiq/components/table';

/**
 * @title Skeleton in sidepanel
 */
@Component({
    selector: 'skeleton-in-sidepanel-example',
    imports: [KbqSkeleton, KbqButtonModule, KbqSidepanelModule, KbqIconModule, KbqDlModule, KbqTableModule],
    template: `
        <button kbq-button (click)="open(template)">Open sidepanel</button>

        <ng-template #template>
            <kbq-sidepanel-header [closeable]="true">LDAP-7f7d60de-d36d-46df-80b9-8f272c32ae45</kbq-sidepanel-header>
            <kbq-sidepanel-body class="example-body">
                <div class="example-actions">
                    <button kbq-button [kbqSkeleton]="detailsLoading()">
                        <i kbq-icon="kbq-circle-play_16"></i>
                        Start synchronization
                    </button>
                    <button kbq-button aria-label="Edit" [kbqSkeleton]="detailsLoading()">
                        <i kbq-icon="kbq-pencil_16"></i>
                    </button>
                    <button kbq-button [kbqSkeleton]="detailsLoading()">
                        <i kbq-icon="kbq-trash_16"></i>
                        Remove
                    </button>
                </div>

                <kbq-dl>
                    @for (item of details; track item.term) {
                        <kbq-dt>{{ item.term }}</kbq-dt>
                        <kbq-dd>
                            <span [kbqSkeleton]="detailsLoading()">{{ item.value }}</span>
                        </kbq-dd>
                    }
                </kbq-dl>

                <table kbq-table width="100%">
                    <thead>
                        <tr>
                            <th>Address</th>
                            <th>Port</th>
                            <th>SSL</th>
                        </tr>
                    </thead>
                    <tbody>
                        @for (server of servers; track server.address) {
                            <tr>
                                <td>
                                    <span [kbqSkeleton]="serversLoading()">{{ server.address }}</span>
                                </td>
                                <td>
                                    <span [kbqSkeleton]="serversLoading()">{{ server.port }}</span>
                                </td>
                                <td>
                                    <i
                                        aria-label="Enabled"
                                        kbq-icon="kbq-check_16"
                                        role="img"
                                        [kbqSkeleton]="serversLoading()"
                                    ></i>
                                </td>
                            </tr>
                        }
                    </tbody>
                </table>
            </kbq-sidepanel-body>
        </ng-template>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: var(--kbq-size-xl);
        }

        .example-body {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-xxl);
        }

        .example-actions {
            display: flex;
            gap: var(--kbq-size-m);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonInSidepanelExample {
    private readonly sidepanel = inject(KbqSidepanelService);

    protected readonly detailsLoading = signal(true);
    protected readonly serversLoading = signal(true);
    protected readonly details = [
        { term: 'Domain', value: 'domain-LDAP-7f7d60de-d36d-46df-80b9-8f272c32ae43' },
        { term: 'Connection type', value: 'Synchronization and authentication' },
        { term: 'Servers', value: 'productname1.security.com:555, productname2.security.com:556' }
    ];
    protected readonly servers = Array.from({ length: 6 }, (_, index) => ({
        address: `productname${index}.security.com`,
        port: 555 + index
    }));

    // Stands in for the requests behind the panel: the details arrive first, the servers later.
    protected open(template: TemplateRef<unknown>): void {
        this.detailsLoading.set(true);
        this.serversLoading.set(true);
        this.sidepanel.open(template);

        setTimeout(() => this.detailsLoading.set(false), 1500);
        setTimeout(() => this.serversLoading.set(false), 2500);
    }
}

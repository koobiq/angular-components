import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal, TemplateRef } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDlModule } from '@koobiq/components/dl';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqSidepanelModule, KbqSidepanelService } from '@koobiq/components/sidepanel';
import { KbqSkeletonDl, KbqSkeletonGroup, KbqSkeletonTable } from '@koobiq/components/skeleton';
import { KbqTableModule } from '@koobiq/components/table';
import { merge, Subscription, tap, timer } from 'rxjs';

type Detail = { term: string; value: string };

type Server = { address: string; port: number };

const DETAILS: Detail[] = [
    { term: 'Domain', value: 'domain-LDAP-7f7d60de-d36d-46df-80b9-8f272c32ae43' },
    { term: 'Connection type', value: 'Synchronization and authentication' },
    { term: 'Servers', value: 'productname1.security.com:555, productname2.security.com:556' }
];

const SERVERS: Server[] = Array.from({ length: 6 }, (_, index) => ({
    address: `productname${index}.security.com`,
    port: 555 + index
}));

/**
 * @title Skeleton in sidepanel
 */
@Component({
    selector: 'skeleton-in-sidepanel-example',
    imports: [
        KbqSkeletonDl,
        KbqSkeletonGroup,
        KbqSkeletonTable,
        KbqButtonModule,
        KbqSidepanelModule,
        KbqIconModule,
        KbqDlModule,
        KbqTableModule
    ],
    template: `
        <button kbq-button (click)="open(template)">Open sidepanel</button>

        <ng-template #template>
            <kbq-sidepanel-header [closeable]="true">LDAP-7f7d60de-d36d-46df-80b9-8f272c32ae45</kbq-sidepanel-header>
            <kbq-sidepanel-body class="example-body">
                @if (details(); as details) {
                    <div class="example-actions">
                        <button kbq-button (click)="load()">
                            <i kbq-icon="kbq-circle-play_16"></i>
                            Start synchronization
                        </button>
                        <button kbq-button aria-label="Edit" disabled>
                            <i kbq-icon="kbq-pencil_16"></i>
                        </button>
                        <button kbq-button disabled>
                            <i kbq-icon="kbq-trash_16"></i>
                            Remove
                        </button>
                    </div>

                    <kbq-dl>
                        @for (item of details; track item.term) {
                            <kbq-dt>{{ item.term }}</kbq-dt>
                            <kbq-dd>{{ item.value }}</kbq-dd>
                        }
                    </kbq-dl>
                } @else {
                    <kbq-skeleton-group preset="button" />
                    <kbq-skeleton-dl />
                }

                @if (servers(); as servers) {
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
                                    <td>{{ server.address }}</td>
                                    <td>{{ server.port }}</td>
                                    <td>
                                        <i aria-label="Enabled" kbq-icon="kbq-check_16" role="img"></i>
                                    </td>
                                </tr>
                            }
                        </tbody>
                    </table>
                } @else {
                    <kbq-skeleton-table />
                }
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
            gap: var(--kbq-size-s);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonInSidepanelExample {
    private readonly sidepanel = inject(KbqSidepanelService);
    private loading = Subscription.EMPTY;

    protected readonly details = signal<Detail[] | null>(null);
    protected readonly servers = signal<Server[] | null>(null);

    constructor() {
        inject(DestroyRef).onDestroy(() => this.loading.unsubscribe());
    }

    protected open(template: TemplateRef<unknown>): void {
        this.load();
        this.sidepanel
            .open(template)
            .afterClosed()
            .subscribe(() => this.loading.unsubscribe());
    }

    // Stands in for the requests behind the panel: the details arrive first, the servers later. A new load and
    // closing the panel cancel whatever has not arrived yet.
    protected load(): void {
        this.loading.unsubscribe();
        this.details.set(null);
        this.servers.set(null);
        this.loading = merge(
            timer(1500).pipe(tap(() => this.details.set(DETAILS))),
            timer(2500).pipe(tap(() => this.servers.set(SERVERS)))
        ).subscribe();
    }
}

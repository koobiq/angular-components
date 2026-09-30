import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqSkeletonTable } from '@koobiq/components/skeleton';
import { KbqTableModule } from '@koobiq/components/table';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Skeleton table preset
 */
@Component({
    selector: 'skeleton-table-example',
    imports: [KbqSkeletonTable, KbqToggleModule, FormsModule, KbqTableModule],
    template: `
        <kbq-toggle [(ngModel)]="loading">Loading</kbq-toggle>

        @if (loading()) {
            <kbq-skeleton-table [rows]="servers.length" [columns]="columns.length" />
        } @else {
            <table kbq-table disableHover width="100%">
                <thead>
                    <tr>
                        @for (column of columns; track column) {
                            <th>{{ column }}</th>
                        }
                    </tr>
                </thead>
                <tbody>
                    @for (server of servers; track server.address) {
                        <tr>
                            <td>{{ server.address }}</td>
                            <td>{{ server.port }}</td>
                            <td>{{ server.protocol }}</td>
                        </tr>
                    }
                </tbody>
            </table>
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
export class SkeletonTableExample {
    protected readonly loading = model(true);
    protected readonly columns = ['Address', 'Port', 'Protocol'];
    protected readonly servers = [
        { address: 'productname1.security.com', port: 555, protocol: 'LDAPS' },
        { address: 'productname2.security.com', port: 556, protocol: 'LDAPS' },
        { address: 'productname3.security.com', port: 389, protocol: 'LDAP' },
        { address: 'ldap.security.com', port: 636, protocol: 'LDAPS' }
    ];
}

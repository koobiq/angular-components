import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqSkeleton } from '@koobiq/components/skeleton';
import { KbqTableModule } from '@koobiq/components/table';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Skeleton with table
 */
@Component({
    selector: 'skeleton-table-example',
    imports: [KbqSkeleton, KbqToggleModule, FormsModule, KbqTableModule, KbqIconModule],
    template: `
        <kbq-toggle [(ngModel)]="loading">Loading</kbq-toggle>

        <table kbq-table disableHover width="100%">
            <thead>
                <tr>
                    @for (column of columns; track column) {
                        <th>
                            <span [kbqSkeleton]="loading()">{{ column }}</span>
                        </th>
                    }
                </tr>
            </thead>
            <tbody>
                @for (server of servers; track server.id) {
                    <tr>
                        <td>
                            <span [kbqSkeleton]="loading()">{{ server.id }}</span>
                        </td>
                        <td>
                            <span [kbqSkeleton]="loading()">{{ server.address }}</span>
                        </td>
                        <td>
                            <span [kbqSkeleton]="loading()">{{ server.port }}</span>
                        </td>
                        <td>
                            <i aria-label="Enabled" kbq-icon="kbq-check_16" role="img" [kbqSkeleton]="loading()"></i>
                        </td>
                    </tr>
                }
            </tbody>
        </table>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--kbq-size-xl);
            padding: var(--kbq-size-xl);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonTableExample {
    protected readonly loading = model(true);
    protected readonly columns = ['ID', 'Address', 'Port', 'SSL'];
    protected readonly servers = [
        { id: '7f7d60de-d36d-46df-80b9-8f272c32ae43', address: 'productname1.security.com', port: 555 },
        { id: 'b3e1c9a2-5f4d-4c8e-9a1b-2d6f8e0c4a17', address: 'productname2.security.com', port: 556 },
        { id: 'e9a4f2c1-8b3d-47a6-b5e2-9c0d1f3a6b58', address: 'productname3.security.com', port: 557 },
        { id: '4c2d8e1f-a7b9-4e3c-8d6a-1f5b9c2e7d04', address: 'ldap.security.com', port: 636 }
    ];
}

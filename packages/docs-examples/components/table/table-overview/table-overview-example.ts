import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqTableModule } from '@koobiq/components/table';

/**
 * @title Table
 */
@Component({
    selector: 'table-overview-example',
    imports: [
        KbqTableModule
    ],
    template: `
        <table kbq-table style="margin-bottom: 32px">
            <thead>
                <tr>
                    <th>Client</th>
                    <th>Event</th>
                    <th>Registered</th>
                </tr>
            </thead>
            <tbody>
                @for (row of rows; track $index) {
                    <tr>
                        <td>{{ row.client }}</td>
                        <td>{{ row.event }}</td>
                        <td>{{ row.registered }}</td>
                    </tr>
                }
            </tbody>
        </table>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableOverviewExample {
    protected readonly rows = [
        { client: 'Company 1', event: 'Identity Theft', registered: '8 Jul, 14:31' },
        { client: 'Company 2', event: 'DDoS', registered: '4 Dec, 16:11' },
        { client: 'Company 1', event: 'HIPS Alert', registered: '4 Dec, 16:11' },
        { client: 'Company 3', event: 'Spam Attack', registered: '4 Dec, 16:11' },
        { client: 'Company 2', event: 'Vulnerability Exploitation', registered: '4 Dec, 16:11' },
        { client: 'Company 1', event: 'Complex Attack', registered: '4 Dec, 16:11' }
    ];
}

import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqTableModule } from '@koobiq/components/table';
import { injectExampleText } from '../l10n';

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
                    <th>{{ text().client }}</th>
                    <th>{{ text().event }}</th>
                    <th>{{ text().registered }}</th>
                </tr>
            </thead>
            <tbody>
                @for (row of rows(); track $index) {
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
    protected readonly text = injectExampleText();

    protected readonly rows = computed(() => [
        { client: this.text().companyN(1), event: this.text().events[0], registered: '8 Jul, 14:31' },
        { client: this.text().companyN(2), event: this.text().events[1], registered: '4 Dec, 16:11' },
        { client: this.text().companyN(1), event: this.text().events[2], registered: '4 Dec, 16:11' },
        { client: this.text().companyN(3), event: this.text().events[3], registered: '4 Dec, 16:11' },
        { client: this.text().companyN(2), event: this.text().events[4], registered: '4 Dec, 16:11' },
        { client: this.text().companyN(1), event: this.text().events[5], registered: '4 Dec, 16:11' }
    ]);
}

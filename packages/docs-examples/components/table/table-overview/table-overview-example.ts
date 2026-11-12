import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqTableModule } from '@koobiq/components/table';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

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
                    <th>{{ t().client }}</th>
                    <th>{{ t().event }}</th>
                    <th>{{ t().registered }}</th>
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
export class TableOverviewExample extends BaseLocalizedExample<ExampleTranslation> {
    protected readonly rows = computed(() => [
        { client: 'Company 1', event: this.t().events[0], registered: '8 Jul, 14:31' },
        { client: 'Company 2', event: this.t().events[1], registered: '4 Dec, 16:11' },
        { client: 'Company 1', event: this.t().events[2], registered: '4 Dec, 16:11' },
        { client: 'Company 3', event: this.t().events[3], registered: '4 Dec, 16:11' },
        { client: 'Company 2', event: this.t().events[4], registered: '4 Dec, 16:11' },
        { client: 'Company 1', event: this.t().events[5], registered: '4 Dec, 16:11' }
    ]);

    constructor() {
        super(TRANSLATIONS);
    }
}

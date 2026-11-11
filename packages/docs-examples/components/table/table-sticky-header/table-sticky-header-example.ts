import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter, DateFormatter, KbqRelativeShortDatePipe } from '@koobiq/components/core';
import { KbqTableModule } from '@koobiq/components/table';
import { DateTime } from 'luxon';
import { injectExampleText } from '../l10n';

/**
 * @title Table with sticky header
 */
@Component({
    selector: 'table-sticky-header-example',
    imports: [KbqTableModule, KbqLuxonDateModule, KbqRelativeShortDatePipe],
    template: `
        <div style="max-height: 240px; overflow: auto;">
            <table kbq-table stickyHeader style="width: 100%">
                <thead>
                    <tr>
                        <th>{{ text().file }}</th>
                        <th>{{ text().owner }}</th>
                        <th>{{ text().modified }}</th>
                    </tr>
                </thead>
                <tbody>
                    @for (row of rows(); track row.name) {
                        <tr>
                            <td>{{ row.name }}</td>
                            <td>{{ row.owner }}</td>
                            <td>{{ row.modified | kbqRelativeShortDate }}</td>
                        </tr>
                    }
                </tbody>
            </table>
        </div>
    `,
    providers: [
        { provide: DateFormatter, deps: [DateAdapter] }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableStickyHeaderExample {
    protected readonly text = injectExampleText();

    readonly adapter = inject<DateAdapter<DateTime>>(DateAdapter);
    readonly value = this.adapter.today();

    protected readonly rows = computed(() => [
        { name: 'document.txt', owner: this.text().userN(1), modified: this.value },
        { name: 'report-2023.pdf', owner: this.text().userN(2), modified: this.value },
        { name: 'notes.doc', owner: this.text().userN(3), modified: this.value },
        { name: 'archive.zip', owner: this.text().userN(4), modified: this.value },
        { name: 'presentation.pptx', owner: this.text().userN(5), modified: this.value },
        { name: 'budget.xlsx', owner: this.text().userN(6), modified: this.value },
        { name: 'photo.png', owner: this.text().userN(7), modified: this.value },
        { name: 'contract.pdf', owner: this.text().userN(8), modified: this.value },
        { name: 'summary.doc', owner: this.text().userN(9), modified: this.value },
        { name: 'backup.zip', owner: this.text().userN(10), modified: this.value }
    ]);
}

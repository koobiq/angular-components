import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter, DateFormatter, KbqRelativeShortDatePipe } from '@koobiq/components/core';
import { KbqTableModule } from '@koobiq/components/table';
import { DateTime } from 'luxon';

/**
 * @title Table with sticky header
 */
@Component({
    selector: 'table-sticky-header-example',
    providers: [
        { provide: DateFormatter, deps: [DateAdapter] }
    ],
    imports: [KbqTableModule, KbqLuxonDateModule, KbqRelativeShortDatePipe],
    template: `
        <div style="max-height: 240px; overflow: auto">
            <table kbq-table stickyHeader style="width: 100%">
                <thead>
                    <tr>
                        <th>File</th>
                        <th>Owner</th>
                        <th>Modified</th>
                    </tr>
                </thead>
                <tbody>
                    @for (row of rows; track row.name) {
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
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableStickyHeaderExample {
    readonly adapter = inject<DateAdapter<DateTime>>(DateAdapter);
    readonly value = this.adapter.today();

    protected readonly rows = [
        { name: 'document.txt', owner: 'User 1', modified: this.value },
        { name: 'report-2023.pdf', owner: 'User 2', modified: this.value },
        { name: 'notes.doc', owner: 'User 3', modified: this.value },
        { name: 'archive.zip', owner: 'User 4', modified: this.value },
        { name: 'presentation.pptx', owner: 'User 5', modified: this.value },
        { name: 'budget.xlsx', owner: 'User 6', modified: this.value },
        { name: 'photo.png', owner: 'User 7', modified: this.value },
        { name: 'contract.pdf', owner: 'User 8', modified: this.value },
        { name: 'summary.doc', owner: 'User 9', modified: this.value },
        { name: 'backup.zip', owner: 'User 10', modified: this.value }
    ];
}

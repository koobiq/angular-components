import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqTableModule } from '@koobiq/components/table';

/**
 * @title Table without hover
 */
@Component({
    selector: 'table-disable-hover-example',
    imports: [KbqTableModule],
    template: `
        <table kbq-table disableHover>
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
                        <td>{{ row.modified }}</td>
                    </tr>
                }
            </tbody>
        </table>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableDisableHoverExample {
    protected readonly rows = [
        { name: 'document.txt', owner: 'User 1', modified: '27 мая 2024' },
        { name: 'report-2023.pdf', owner: 'User 2', modified: '1 дек 2023' },
        { name: 'notes.doc', owner: 'User 3', modified: '7 мар 2024' },
        { name: 'archive.zip', owner: 'User 4', modified: '24 авг 2022' }
    ];
}

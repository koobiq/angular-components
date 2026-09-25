import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqTableModule } from '@koobiq/components/table';

/**
 * @title Table with borders
 */
@Component({
    selector: 'table-with-borders-example',
    imports: [
        KbqTableModule
    ],
    template: `
        <table style="margin-bottom: 32px; width: 100%" kbq-table [border]="true">
            <thead>
                <tr>
                    <th>File</th>
                    <th style="width: 110px">Owner</th>
                    <th style="width: 110px">Modified</th>
                    <th style="width: 50px">Size</th>
                </tr>
            </thead>
            <tbody>
                @for (row of rows; track row.name) {
                    <tr>
                        <td>{{ row.name }}</td>
                        <td>{{ row.owner }}</td>
                        <td>{{ row.modified }}</td>
                        <td>{{ row.size }}</td>
                    </tr>
                }
            </tbody>
        </table>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableWithBordersExample {
    protected readonly rows = [
        { name: '000.txt', owner: 'User 1', modified: '27 May 2024', size: '17 KB' },
        { name: 'The Big Book of Poems and Fairy Tales', owner: 'User 2', modified: '1 Dec 2023', size: '998 KB' },
        { name: 'notes.doc', owner: 'User 3', modified: '7 Mar 1993', size: '502 KB' },
        { name: 'recipe.txt', owner: 'User 4', modified: '24 Aug 2022', size: '128 KB' }
    ];
}

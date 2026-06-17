import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqHighlightBackgroundPipe } from '@koobiq/components/core';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqTableModule } from '@koobiq/components/table';

type CompanyRow = {
    city: string;
    company: string;
    person: string;
    notes: string;
    note?: string;
};

/**
 * @title Highlight in table
 */
@Component({
    selector: 'highlight-background-table-example',
    imports: [
        KbqTableModule,
        KbqLinkModule,
        KbqHighlightBackgroundPipe
    ],
    template: `
        <table kbq-table class="highlight-table">
            <thead>
                <tr>
                    <th style="width: 96px">City</th>
                    <th style="width: 124px">Company</th>
                    <th style="width: 116px">Person</th>
                    <th>Notes</th>
                </tr>
            </thead>
            <tbody>
                @for (row of rows; track row.city) {
                    <tr [class.highlight-table__row_with-note]="row.note">
                        <td>
                            <a kbq-link href="#" (click)="$event.preventDefault()">
                                <span
                                    class="kbq-link__text"
                                    [innerHTML]="row.city | kbqHighlightBackground: keyword"
                                ></span>
                            </a>
                        </td>
                        <td [innerHTML]="row.company | kbqHighlightBackground: keyword"></td>
                        <td [innerHTML]="row.person | kbqHighlightBackground: keyword"></td>
                        <td [innerHTML]="row.notes | kbqHighlightBackground: keyword"></td>
                    </tr>
                }
            </tbody>
        </table>
    `,
    styles: `
        :host {
            display: block;
        }

        .highlight-table {
            width: 100%;
        }

        .highlight-table__row_with-note > td {
            border-bottom: none;
            padding-bottom: var(--kbq-size-xxs);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HighlightBackgroundTableExample {
    protected readonly keyword = 'manc';
    protected readonly rows: CompanyRow[] = [
        {
            city: 'Manchester',
            company: 'Blue Harbor Ltd',
            person: 'Alice Brown',
            notes: 'Annual review completed'
        },
        {
            city: 'Liverpool',
            company: 'Mancraft Studio',
            person: 'Daniel Reed',
            notes: 'New client onboarded'
        },
        {
            city: 'Bristol',
            company: 'GreenField Tech',
            person: 'Mancini Robert',
            notes: 'Budget approved'
        },
        {
            city: 'Leeds',
            company: 'Northwind Labs',
            person: 'Emma Stone',
            notes: 'Visit planned for Manchester office'
        },
        {
            city: 'York',
            company: 'Delta Systems',
            person: 'Michael Turner',
            notes: 'Contract with Mancorp signed'
        },
        {
            city: 'Oxford',
            company: 'Silver Bridge',
            person: 'Laura Green',
            notes: 'Archived in mancategory B'
        }
    ];
}

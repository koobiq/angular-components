import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqHighlightBackgroundPipe } from '@koobiq/components/core';
import { KbqLink } from '@koobiq/components/link';
import { KbqTableModule } from '@koobiq/components/table';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

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
        KbqLink,
        KbqHighlightBackgroundPipe
    ],
    template: `
        <table kbq-table class="highlight-table">
            <thead>
                <tr>
                    <th style="width: 96px">{{ t().city }}</th>
                    <th style="width: 124px">{{ t().company }}</th>
                    <th style="width: 116px">{{ t().person }}</th>
                    <th>{{ t().notes }}</th>
                </tr>
            </thead>
            <tbody>
                @for (row of rows; track row.city) {
                    <tr [class.highlight-table__row_with-note]="row.note">
                        <td>
                            <a kbqLink href="#" (click)="$event.preventDefault()">
                                <span [innerHTML]="row.city | kbqHighlightBackground: keyword"></span>
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
export class HighlightBackgroundTableExample extends BaseLocalizedExample<ExampleTranslation> {
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

    constructor() {
        super(TRANSLATIONS);
    }
}

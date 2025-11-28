import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqSearchExpandableModule } from '@koobiq/components/search-expandable';

/**
 * @title search-expandable
 */
@Component({
    selector: 'search-expandable-overview-example',
    imports: [
        KbqSearchExpandableModule,
        FormsModule
    ],
    template: `
        <kbq-search-expandable [(ngModel)]="search" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchExpandableOverviewExample {
    search: string;
}

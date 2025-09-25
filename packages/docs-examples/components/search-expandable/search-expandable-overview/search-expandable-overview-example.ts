import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqSearchExpandableModule } from '@koobiq/components/search-expandable';

/**
 * @title search-expandable
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'search-expandable-overview-example',
    imports: [
        KbqSearchExpandableModule
    ],
    template: `
        <kbq-search-expandable />
    `
})
export class SearchExpandableOverviewExample {}

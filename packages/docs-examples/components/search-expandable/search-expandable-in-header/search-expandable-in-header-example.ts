import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqSearchExpandableModule } from '@koobiq/components/search-expandable';

/**
 * @title search-expandable-in-header
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'search-expandable-in-header-example',
    imports: [
        KbqSearchExpandableModule
    ],
    template: `
        <kbq-search-expandable />
    `
})
export class SearchExpandableInHeaderExample {}

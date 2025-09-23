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
        <div class="example-search-expandable-in-header-example__panel">
            <div class="example-search-expandable-in-header-example__header">
                <div class="example-search-expandable-in-header-example__name kbq-subheading">Panel Title</div>
                <kbq-search-expandable />
            </div>
            <div class="example-search-expandable-in-header-example__body"></div>
        </div>
    `,
    styleUrls: ['./search-expandable-in-header.scss']
})
export class SearchExpandableInHeaderExample {}

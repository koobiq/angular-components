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
    styles: `
        :host {
            display: flex;

            border-radius: inherit;

            margin: -20px;

            padding: var(--kbq-size-m);

            background: var(--kbq-background-bg-secondary);
        }

        .example-search-expandable-in-header-example__panel {
            width: 622px;

            border: 1px solid var(--kbq-line-contrast-less);
            border-radius: var(--kbq-size-m);

            background: var(--kbq-background-bg);
        }

        .example-search-expandable-in-header-example__header {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;

            max-height: var(--kbq-size-5xl);

            padding: var(--kbq-size-s) var(--kbq-size-m);

            border-bottom: 1px solid var(--kbq-line-contrast-less);
        }

        .example-search-expandable-in-header-example__body {
            height: 152px;
        }
    `
})
export class SearchExpandableInHeaderExample {}

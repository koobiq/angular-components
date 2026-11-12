import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqSearchExpandableModule } from '@koobiq/components/search-expandable';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title search-expandable-in-header
 */
@Component({
    selector: 'search-expandable-in-header-example',
    imports: [
        KbqSearchExpandableModule,
        FormsModule
    ],
    template: `
        <div class="example-search-expandable-in-header-example__panel">
            <div class="example-search-expandable-in-header-example__header">
                <div class="example-search-expandable-in-header-example__name kbq-subheading">
                    {{ t().panelTitle }}
                </div>
                <kbq-search-expandable [(ngModel)]="search" />
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
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchExpandableInHeaderExample extends BaseLocalizedExample<ExampleTranslation> {
    search: string = 'report';

    constructor() {
        super(TRANSLATIONS);
    }
}

import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqContentPanelContainer, KbqContentPanelModule } from '@koobiq/components/content-panel';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Content panel state saving
 */
@Component({
    selector: 'content-panel-state-saving-example',
    imports: [KbqButtonModule, KbqContentPanelModule],
    template: `
        <kbq-content-panel-container
            #panel="kbqContentPanelContainer"
            maxWidth="450"
            minWidth="250"
            stateSavingKey="content-panel-state-saving-example"
            width="350"
        >
            <div class="example-content-panel-container__content">
                <div class="example-content-panel-container__actions">
                    <button kbq-button (click)="panel.toggle()">{{ t().toggle }}</button>
                    <button kbq-button type="button" (click)="container().clearSavedState()">
                        {{ t().resetSavedState }}
                    </button>
                </div>
            </div>

            <kbq-content-panel>
                <kbq-content-panel-header>
                    <div kbqContentPanelHeaderTitle>{{ t().title }}</div>
                </kbq-content-panel-header>
                <kbq-content-panel-body>
                    <p>{{ t().stateSavingHint }}</p>
                </kbq-content-panel-body>
            </kbq-content-panel>
        </kbq-content-panel-container>
    `,
    styles: `
        :host {
            display: block;
            height: 200px;
        }

        .example-content-panel-container__content {
            padding: 16px;
        }

        .example-content-panel-container__actions {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentPanelStateSavingExample extends BaseLocalizedExample<ExampleTranslation> {
    protected readonly container = viewChild.required(KbqContentPanelContainer);

    constructor() {
        super(TRANSLATIONS);
    }
}

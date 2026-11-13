import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqContentPanelContainer, KbqContentPanelModule } from '@koobiq/components/content-panel';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

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
                <button kbq-button (click)="panel.toggle()">{{ t().toggle }}</button>
                <button kbq-button type="button" (click)="container().clearSavedState()">
                    {{ t().resetSavedState }}
                </button>
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
        .example-content-panel-container__content {
            display: flex;
            gap: 8px;
            padding: 16px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentPanelStateSavingExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    protected readonly container = viewChild.required(KbqContentPanelContainer);
}

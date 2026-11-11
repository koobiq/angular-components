import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqContentPanelContainer, KbqContentPanelModule } from '@koobiq/components/content-panel';
import { injectExampleText } from './l10n';

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
                    <button kbq-button (click)="panel.toggle()">{{ text().toggle }}</button>
                    <button kbq-button type="button" (click)="container().clearSavedState()">
                        {{ text().resetSavedState }}
                    </button>
                </div>
            </div>

            <kbq-content-panel>
                <kbq-content-panel-header>
                    <div kbqContentPanelHeaderTitle>{{ text().title }}</div>
                </kbq-content-panel-header>
                <kbq-content-panel-body>
                    <p>{{ text().stateSavingHint }}</p>
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
export class ContentPanelStateSavingExample {
    protected readonly text = injectExampleText();

    protected readonly container = viewChild.required(KbqContentPanelContainer);
}

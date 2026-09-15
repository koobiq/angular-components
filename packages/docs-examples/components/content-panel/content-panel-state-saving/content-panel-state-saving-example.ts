import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqContentPanelContainer, KbqContentPanelModule } from '@koobiq/components/content-panel';

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
                <button kbq-button (click)="panel.toggle()">Toggle</button>
                <button kbq-button type="button" (click)="container().clearSavedState()">Reset saved state</button>
            </div>

            <kbq-content-panel>
                <kbq-content-panel-header>
                    <div kbqContentPanelHeaderTitle>Title</div>
                </kbq-content-panel-header>
                <kbq-content-panel-body>
                    <p>
                        Open the panel and drag its left edge, then reload the page — the panel comes back open and at
                        the width it was left. Double-clicking the edge restores the declared width, and that is
                        remembered too.
                    </p>
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
    protected readonly container = viewChild.required(KbqContentPanelContainer);
}

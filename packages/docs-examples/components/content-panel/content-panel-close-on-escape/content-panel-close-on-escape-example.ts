import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqContentPanelContainer, KbqContentPanelModule } from '@koobiq/components/content-panel';

/**
 * @title Content panel close on escape
 */
@Component({
    selector: 'content-panel-close-on-escape-example',
    imports: [KbqButtonModule, KbqContentPanelModule],
    template: `
        <kbq-content-panel-container maxWidth="450" minWidth="250" width="350">
            <div class="example-content-panel-container__content">
                <button kbq-button (click)="panel().open()">Open</button>
            </div>

            <kbq-content-panel>
                <kbq-content-panel-header>
                    <div kbqContentPanelHeaderTitle>Title</div>
                </kbq-content-panel-header>
                <kbq-content-panel-body>Press Escape anywhere on the page.</kbq-content-panel-body>
            </kbq-content-panel>
        </kbq-content-panel-container>
    `,
    styles: `
        :host {
            display: block;
            height: 200px;
        }

        .example-content-panel-container__content {
            padding: var(--kbq-size-l);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(document:keydown.escape)': 'closeOnEscape($event)'
    }
})
export class ContentPanelCloseOnEscapeExample {
    protected readonly panel = viewChild.required(KbqContentPanelContainer);

    protected closeOnEscape(event: Event): void {
        // Spent by a pop-up that closed on it, such as a select or a modal.
        if (event.defaultPrevented) return;

        this.panel().close();
    }
}

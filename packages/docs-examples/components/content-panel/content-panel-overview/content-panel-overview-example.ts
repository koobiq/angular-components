import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqContentPanelModule } from '@koobiq/components/content-panel';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { injectExampleText } from './l10n';

/**
 * @title Content panel overview
 */
@Component({
    selector: 'content-panel-overview-example',
    imports: [KbqButtonModule, KbqContentPanelModule, KbqIconModule],
    template: `
        <kbq-content-panel-container #panel="kbqContentPanelContainer" width="350" maxWidth="450" minWidth="250">
            <div class="example-content-panel-container__content">
                <button kbq-button (click)="panel.toggle()">{{ text().toggle }}</button>
                <button kbq-button [disabled]="panel.isOpened()" (click)="panel.open()">{{ text().open }}</button>
                <button kbq-button [disabled]="!panel.isOpened()" (click)="panel.close()">{{ text().close }}</button>
            </div>

            <kbq-content-panel>
                <kbq-content-panel-header>
                    <div kbqContentPanelHeaderTitle>{{ text().title }}</div>
                    <div kbqContentPanelHeaderActions>
                        <button
                            kbq-button
                            [attr.aria-label]="text().copyLink"
                            [color]="componentColors.Contrast"
                            [kbqStyle]="buttonStyles.Transparent"
                        >
                            <i kbq-icon="kbq-link_16"></i>
                        </button>
                        <button
                            kbq-button
                            [attr.aria-label]="text().expand"
                            [color]="componentColors.Contrast"
                            [kbqStyle]="buttonStyles.Transparent"
                        >
                            <i kbq-icon="kbq-arrows-expand-diagonal_16"></i>
                        </button>
                    </div>
                </kbq-content-panel-header>
                <kbq-content-panel-body>
                    @for (_i of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]; track $index) {
                        <p>{{ text().dosText($index) }}</p>
                    }
                </kbq-content-panel-body>
                <kbq-content-panel-footer>
                    <button kbq-button [color]="componentColors.Contrast">Button 1</button>
                    <button kbq-button [color]="componentColors.ContrastFade">Button 2</button>
                </kbq-content-panel-footer>
            </kbq-content-panel>
        </kbq-content-panel-container>
    `,
    styles: `
        :host {
            display: block;
            height: 400px;
        }

        .example-content-panel-container__content {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-s);
            align-items: center;
            justify-content: center;
            height: 100%;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentPanelOverviewExample {
    protected readonly text = injectExampleText();

    protected readonly componentColors = KbqComponentColors;
    protected readonly buttonStyles = KbqButtonStyles;
}

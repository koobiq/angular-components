import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqContentPanelModule } from '@koobiq/components/content-panel';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title Content panel overview
 */
@Component({
    standalone: true,
    imports: [KbqButtonModule, KbqContentPanelModule, KbqIconModule],
    selector: 'content-panel-overview-example',
    template: `
        <kbq-content-panel-container #panel="kbqContentPanelContainer" width="350" maxWidth="450" minWidth="250">
            <div class="example-content-panel-container__content">
                <button (click)="panel.toggle()" kbq-button>Toggle</button>
                <button [disabled]="panel.isOpened()" (click)="panel.open()" kbq-button>Open</button>
                <button [disabled]="!panel.isOpened()" (click)="panel.close()" kbq-button>Close</button>
            </div>

            <kbq-content-panel>
                <kbq-content-panel-header>
                    <div kbqContentPanelHeaderTitle>Title</div>
                    <div kbqContentPanelHeaderActions>
                        <button [color]="componentColors.Contrast" [kbqStyle]="buttonStyles.Transparent" kbq-button>
                            <i kbq-icon="kbq-link_16"></i>
                        </button>
                        <button [color]="componentColors.Contrast" [kbqStyle]="buttonStyles.Transparent" kbq-button>
                            <i kbq-icon="kbq-arrows-expand-diagonal_16"></i>
                        </button>
                    </div>
                </kbq-content-panel-header>
                <kbq-content-panel-body>
                    @for (_i of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]; track $index) {
                        <p>
                            In computing [{{ $index }}], a denial-of-service attack (DoS attack) is a cyber-attack in
                            which the perpetrator seeks to make a machine or network resource unavailable to its
                            intended users by temporarily or indefinitely disrupting services of a host connected to a
                            network. Denial of service is typically accomplished by flooding the targeted machine or
                            resource with superfluous requests in an attempt to overload systems and prevent some or all
                            legitimate requests from being fulfilled. The range of attacks varies widely, spanning from
                            inundating a server with millions of requests to slow its performance, overwhelming a server
                            with a substantial amount of invalid data, to submitting requests with an illegitimate IP
                            address.
                        </p>
                    }
                </kbq-content-panel-body>
                <kbq-content-panel-footer>
                    <button [color]="componentColors.Contrast" kbq-button>Button 1</button>
                    <button [color]="componentColors.ContrastFade" kbq-button>Button 2</button>
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
    protected readonly componentColors = KbqComponentColors;
    protected readonly buttonStyles = KbqButtonStyles;
}

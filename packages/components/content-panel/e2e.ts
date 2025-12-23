import { afterNextRender, ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqContentPanelBody, KbqContentPanelModule } from '@koobiq/components/content-panel';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';

@Component({
    selector: 'e2e-content-panel-state',
    imports: [KbqButtonModule, KbqContentPanelModule, KbqIconModule],
    standalone: true,
    template: `
        <kbq-content-panel-container
            #panel="kbqContentPanelContainer"
            width="350"
            maxWidth="400"
            minWidth="300"
            [opened]="true"
        >
            <div (click)="panel.toggle()">Content panel container content</div>
            <kbq-content-panel>
                <kbq-content-panel-aside>
                    @for (_i of [0, 1, 2, 3]; track $index) {
                        <button
                            kbq-button
                            [class.kbq-active]="$first"
                            [color]="componentColors.Contrast"
                            [kbqStyle]="buttonStyles.Transparent"
                        >
                            <i kbq-icon="kbq-bug_16"></i>
                        </button>
                    }
                </kbq-content-panel-aside>
                <kbq-content-panel-header>
                    <div kbqContentPanelHeaderTitle>Title</div>
                    <div kbqContentPanelHeaderActions>
                        <button kbq-button [color]="componentColors.Contrast" [kbqStyle]="buttonStyles.Transparent">
                            <i kbq-icon="kbq-link_16"></i>
                        </button>
                        <button kbq-button [color]="componentColors.Contrast" [kbqStyle]="buttonStyles.Transparent">
                            <i kbq-icon="kbq-arrows-expand-diagonal_16"></i>
                        </button>
                    </div>
                </kbq-content-panel-header>
                <kbq-content-panel-body>
                    <p>
                        In computing, a denial-of-service attack (DoS attack) is a cyber-attack in which the perpetrator
                        seeks to make a machine or network resource unavailable to its intended users by temporarily or
                        indefinitely disrupting services of a host connected to a network. Denial of service is
                        typically accomplished by flooding the targeted machine or resource with superfluous requests in
                        an attempt to overload systems and prevent some or all legitimate requests from being fulfilled.
                        The range of attacks varies widely, spanning from inundating a server with millions of requests
                        to slow its performance, overwhelming a server with a substantial amount of invalid data, to
                        submitting requests with an illegitimate IP address.
                    </p>
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
            display: inline-flex;
            flex-direction: column;
            gap: var(--kbq-size-s);
            padding: var(--kbq-size-xxs);
        }

        .kbq-content-panel-container {
            height: 300px;
            width: 500px;
        }
    `,
    host: {
        'data-testid': 'e2eContentPanelState'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class E2eContentPanelState {
    protected readonly componentColors = KbqComponentColors;
    protected readonly buttonStyles = KbqButtonStyles;
    private readonly contentPanelBody = viewChild.required(KbqContentPanelBody);

    constructor() {
        afterNextRender(() => {
            this.contentPanelBody().scrollbar().scrollTo({ top: 50 });
        });
    }
}

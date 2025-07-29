import { afterNextRender, ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqContentPanel, KbqContentPanelContainer, KbqContentPanelModule } from '@koobiq/components/content-panel';

/**
 * @title Content Panel scroll events
 */
@Component({
    standalone: true,
    imports: [KbqButtonModule, KbqContentPanelModule],
    selector: 'content-panel-scroll-events-example',
    template: `
        <kbq-content-panel-container #contentPanelContainer="kbqContentPanelContainer">
            <button (click)="contentPanelContainer.toggle()" kbq-button>toggle</button>
            @for (_p of paragraphs; track $index) {
                <p>
                    In computing [{{ $index }}], a denial-of-service attack (DoS attack) is a cyber-attack in which the
                    perpetrator seeks to make a machine or network resource unavailable to its intended users by
                    temporarily or indefinitely disrupting services of a host connected to a network. Denial of service
                    is typically accomplished by flooding the targeted machine or resource with superfluous requests in
                    an attempt to overload systems and prevent some or all legitimate requests from being fulfilled. The
                    range of attacks varies widely, spanning from inundating a server with millions of requests to slow
                    its performance, overwhelming a server with a substantial amount of invalid data, to submitting
                    requests with an illegitimate IP address.
                </p>
            }
            <kbq-content-panel>
                <kbq-content-panel-header>
                    <div kbqContentPanelHeaderTitle>Title</div>
                </kbq-content-panel-header>
                <kbq-content-panel-body>
                    @for (_p of paragraphs; track $index) {
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
            </kbq-content-panel>
        </kbq-content-panel-container>
    `,
    styles: `
        :host {
            display: block;
            height: 400px;
            min-width: 1000px;
            overflow: auto;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentPanelScrollEventsExample {
    protected readonly paragraphs = Array.from({ length: 10 });

    private readonly contentPanelContainer = viewChild.required(KbqContentPanelContainer);
    private readonly contentPanel = viewChild.required(KbqContentPanel);

    constructor() {
        afterNextRender(() => {
            this.contentPanelContainer()
                .scrollableContent()
                .elementScrolled()
                .subscribe(() => {
                    console.log('KbqContentPanelContainer content scrolled.');
                });

            this.contentPanel()
                .scrollableBody()
                ?.elementScrolled()
                .subscribe(() => {
                    console.log('KbqContentPanelBody content scrolled.');
                });
        });
    }
}

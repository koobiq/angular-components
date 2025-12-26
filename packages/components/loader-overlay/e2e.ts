import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqLoaderOverlayModule } from '@koobiq/components/loader-overlay';

@Component({
    selector: 'e2e-loader-overlay-states',
    imports: [KbqLoaderOverlayModule],
    template: `
        <!-- Base -->
        <div>
            Content
            <kbq-loader-overlay size="compact" />
        </div>
        <div>
            Content
            <kbq-loader-overlay size="normal" />
        </div>
        <div>
            Content
            <kbq-loader-overlay size="big" />
        </div>
        <div>
            Content
            <kbq-loader-overlay size="big" [transparent]="false" />
        </div>

        <!-- With text -->
        <div>
            Content
            <kbq-loader-overlay text="Text" size="compact" />
        </div>
        <div>
            Content
            <kbq-loader-overlay text="Text" size="normal" />
        </div>
        <div>
            Content
            <kbq-loader-overlay text="Text" size="big" />
        </div>
        <div>
            Content
            <kbq-loader-overlay size="big" text="Text" [transparent]="false" />
        </div>

        <!-- With text and caption -->
        <div>
            Content
            <kbq-loader-overlay text="Text" size="compact" caption="Caption" />
        </div>
        <div>
            Content
            <kbq-loader-overlay text="Text" size="normal" caption="Caption" />
        </div>
        <div>
            Content
            <kbq-loader-overlay text="Text" size="big" caption="Caption" />
        </div>
        <div>
            Content
            <kbq-loader-overlay size="big" text="Text" caption="Caption" [transparent]="false" />
        </div>
    `,
    styles: `
        :host {
            display: inline-grid;
            grid-template-columns: repeat(4, 1fr);
            gap: var(--kbq-size-xxs);
        }

        div {
            width: 170px;
            height: 170px;
            border: 1px dashed;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eLoaderOverlayStates'
    }
})
export class E2eLoaderOverlayStates {}

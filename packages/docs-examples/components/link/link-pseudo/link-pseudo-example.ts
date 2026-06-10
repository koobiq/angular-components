import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqLinkModule } from '@koobiq/components/link';

/**
 * @title Link pseudo
 */
@Component({
    selector: 'link-pseudo-example',
    imports: [KbqLinkModule],
    template: `
        <span kbq-link pseudo>Scan report</span>
    `,
    styles: `
        :host {
            display: flex;
            padding: var(--kbq-size-l);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkPseudoExample {}

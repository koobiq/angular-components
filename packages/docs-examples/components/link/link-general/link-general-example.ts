import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqLinkModule } from '@koobiq/components/link';

/**
 * @title Link general
 */
@Component({
    selector: 'link-general-example',
    imports: [KbqLinkModule],
    template: `
        <a kbq-link>Scan report</a>
    `,
    styles: `
        :host {
            display: flex;
            padding: var(--kbq-size-l);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkGeneralExample {}

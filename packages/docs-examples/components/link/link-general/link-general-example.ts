import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqLink } from '@koobiq/components/link';

/**
 * @title Link general
 */
@Component({
    selector: 'link-general-example',
    imports: [KbqLink],
    template: `
        <a kbqLink href="https://koobiq.io/en/components/link">Scan report</a>
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

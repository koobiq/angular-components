import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqLink } from '@koobiq/components/link';

/**
 * @title Link pseudo
 */
@Component({
    selector: 'link-pseudo-example',
    imports: [KbqLink],
    template: `
        <span kbqLink>Scan report</span>
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

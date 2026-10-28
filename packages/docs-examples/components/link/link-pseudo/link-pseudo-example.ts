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
            align-items: center;
            justify-content: center;
            min-height: 160px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkPseudoExample {}

import { Component } from '@angular/core';
import { KbqLinkModule } from '@koobiq/components/link';

/**
 * @title Link pseudo
 */
@Component({
    standalone: true,
    selector: 'link-pseudo-example',
    imports: [KbqLinkModule],
    template: `
        <div style="padding: 16px">
            <span
                kbq-link
                pseudo
            >
                Отчет от 19.05.2020
            </span>
        </div>
    `
})
export class LinkPseudoExample {}

import { Component } from '@angular/core';
import { KbqLinkModule } from '@koobiq/components/link';

/**
 * @title Link multi-line
 */
@Component({
    standalone: true,
    selector: 'link-multi-line-example',
    imports: [
        KbqLinkModule
    ],
    template: `
        <div style="padding: 16px; width: 275px">
            Просим вас обратитесь
            <a kbq-link>в Центр технической поддержки</a>
        </div>
    `
})
export class LinkMultiLineExample {}

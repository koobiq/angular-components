import { Component } from '@angular/core';
import { KbqLinkModule } from '@koobiq/components/link';

/**
 * @title Link preposition
 */
@Component({
    standalone: true,
    selector: 'link-prepositions-example',
    imports: [KbqLinkModule],
    template: `
        <div style="padding: 16px">
            Обратитесь
            <a
                href="#"
                kbq-link
            >
                в Центр технической поддержки
            </a>
        </div>
    `
})
export class LinkPrepositionsExample {}

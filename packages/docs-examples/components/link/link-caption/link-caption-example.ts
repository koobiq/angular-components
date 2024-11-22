import { Component } from '@angular/core';
import { KbqLinkModule } from '@koobiq/components/link';

/**
 * @title Link caption
 */
@Component({
    standalone: true,
    selector: 'link-caption-example',
    imports: [
        KbqLinkModule
    ],
    template: `
        <div style="padding: 16px">
            <a compact href="https://koobiq.io/components/link/overview" target="_blank" kbq-link>Отчет сканирования</a>
        </div>
    `
})
export class LinkCaptionExample {}

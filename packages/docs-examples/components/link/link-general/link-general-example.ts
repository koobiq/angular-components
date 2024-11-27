import { Component } from '@angular/core';
import { KbqLinkModule } from '@koobiq/components/link';

/**
 * @title Link general
 */
@Component({
    standalone: true,
    selector: 'link-general-example',
    imports: [KbqLinkModule],
    template: `
        <div style="padding: 16px">
            <a class="kbq-link_external" href="https://koobiq.io/components/link/overview" target="_blank" kbq-link>
                Отчет сканирования
            </a>
        </div>
    `
})
export class LinkGeneralExample {}

import { Component } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';

/**
 * @title Link icons
 */
@Component({
    standalone: true,
    selector: 'link-icons-example',
    imports: [KbqLinkModule, KbqIconModule],
    template: `
        <div style="padding: 16px">
            <a class="kbq-link_external" href="https://koobiq.io/en/components/link" target="_blank" kbq-link>
                <i kbq-icon="kbq-clock_16"></i>
                <span class="kbq-link__text">Отчет сканирования</span>
            </a>
        </div>
    `
})
export class LinkIconsExample {}

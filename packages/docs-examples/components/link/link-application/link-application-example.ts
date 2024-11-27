import { Component } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';

/**
 * @title Link application
 */
@Component({
    standalone: true,
    selector: 'link-application-example',
    imports: [
        KbqLinkModule,
        KbqIconModule
    ],
    template: `
        <div style="padding: 16px">
            <a class="kbq-link_external" href="https://koobiq.io/components/link/overview" target="_blank" kbq-link>
                <span class="kbq-link__text">Отчет сканирования в AI Desktop</span>
                <i kbq-icon="kbq-north-east_16"></i>
            </a>
        </div>
        <div style="padding: 16px">
            <a class="kbq-link_external" href="https://koobiq.io/components/link/overview" target="_blank" kbq-link>
                <span class="kbq-link__text">Отчет сканирования в AI Desktop</span>
            </a>
            <img style="margin-left: 5px; vertical-align: middle" alt="" src="favicon.ico" />
        </div>
    `
})
export class LinkApplicationExample {}

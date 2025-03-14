import { Component } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';

/**
 * @title Link target blank
 */
@Component({
    standalone: true,
    selector: 'link-target-blank-example',
    imports: [KbqLinkModule, KbqIconModule],
    template: `
        <div style="padding: 16px">
            <a class="kbq-link_external" href="https://koobiq.io/en/components/link" target="_blank" kbq-link>
                <span class="kbq-link__text">Отчет сканирования</span>
                <i kbq-icon="kbq-north-east_16"></i>
            </a>
        </div>
    `
})
export class LinkTargetBlankExample {}

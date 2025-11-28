import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';

/**
 * @title Link icons
 */
@Component({
    selector: 'link-icons-example',
    imports: [KbqLinkModule, KbqIconModule],
    template: `
        <div style="padding: 16px">
            <a class="kbq-link_external" href="https://koobiq.io/en/components/link" target="_blank" kbq-link>
                <i kbq-icon="kbq-clock_16"></i>
                <span class="kbq-link__text">Отчет сканирования</span>
            </a>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkIconsExample {}

import { Component } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';

/**
 * @title Link
 */
@Component({
    standalone: true,
    selector: 'link-overview-example',
    imports: [KbqLinkModule, KbqIconModule],
    template: `
        <div style="padding: 16px">
            <a class="kbq-link_external" href="https://koobiq.io/components/link/overview" target="_blank" kbq-link>
                Отчет сканирования
            </a>
        </div>

        <div style="padding: 16px">
            <a class="kbq-link_external" href="https://koobiq.io/components/link/overview" target="_blank" kbq-link>
                <span class="kbq-link__text">Отчет сканирования</span>
                <i kbq-icon="kbq-north-east_16"></i>
            </a>
        </div>

        <div style="padding: 16px">
            <a class="kbq-link_external" href="https://koobiq.io/components/link/overview" target="_blank" kbq-link>
                <span class="kbq-link__text">Отчет сканирования</span>
                <i kbq-icon="kbq-north-east_16"></i>
            </a>
        </div>

        <div style="padding: 16px">
            <a
                class="kbq-link_external"
                [disabled]="disabled"
                href="https://koobiq.io/components/link/overview"
                target="_blank"
                kbq-link
            >
                <i kbq-icon="kbq-calendar-o_16"></i>
                <span class="kbq-link__text">Отчет сканирования</span>
                <i kbq-icon="kbq-north-east_16"></i>
            </a>
        </div>

        <div style="padding: 16px">
            <a
                class="kbq-link_external"
                href="https://koobiq.io/components/link/overview"
                target="_blank"
                kbq-link
                noUnderline
            >
                Отчет сканирования
            </a>
        </div>
    `
})
export class LinkOverviewExample {
    active = true;
    focus = true;
    disabled = true;
}

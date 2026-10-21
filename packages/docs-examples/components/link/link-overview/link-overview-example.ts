import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLink, KbqLinkPrefix } from '@koobiq/components/link';

/**
 * @title Link
 */
@Component({
    selector: 'link-overview-example',
    imports: [KbqLink, KbqLinkPrefix, KbqIconModule],
    template: `
        <div style="padding: 16px">
            <a href="https://koobiq.io/en/components/link" target="_blank" kbqLink>Отчет сканирования</a>
        </div>

        <div style="padding: 16px">
            <a href="https://koobiq.io/en/components/link" target="_blank" kbqLink external>Отчет сканирования</a>
        </div>

        <div style="padding: 16px">
            <a href="https://koobiq.io/en/components/link" target="_blank" kbqLink external>Отчет сканирования</a>
        </div>

        <div style="padding: 16px">
            <a href="https://koobiq.io/en/components/link" target="_blank" kbqLink external [disabled]="disabled">
                <i kbqLinkPrefix kbq-icon="kbq-calendar-o_16"></i>
                Отчет сканирования
            </a>
        </div>

        <div style="padding: 16px">
            <a href="https://koobiq.io/en/components/link" target="_blank" kbqLink underline="none">
                Отчет сканирования
            </a>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkOverviewExample {
    active = true;
    focus = true;
    disabled = true;
}

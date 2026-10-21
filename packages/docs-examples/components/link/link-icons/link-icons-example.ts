import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLink, KbqLinkPrefix } from '@koobiq/components/link';

/**
 * @title Link icons
 */
@Component({
    selector: 'link-icons-example',
    imports: [KbqLink, KbqLinkPrefix, KbqIconModule],
    template: `
        <div style="padding: 16px">
            <a href="https://koobiq.io/en/components/link" target="_blank" kbqLink>
                <i kbqLinkPrefix kbq-icon="kbq-clock_16"></i>
                Отчет сканирования
            </a>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkIconsExample {}

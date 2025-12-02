import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqLinkModule } from '@koobiq/components/link';

/**
 * @title Link caption
 */
@Component({
    selector: 'link-caption-example',
    imports: [
        KbqLinkModule
    ],
    template: `
        <div style="padding: 16px">
            <a class="kbq-link_external" compact href="https://koobiq.io/en/components/link" target="_blank" kbq-link>
                Отчет сканирования
            </a>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkCaptionExample {}

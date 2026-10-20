import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqLink } from '@koobiq/components/link';

/**
 * @title Link caption
 */
@Component({
    selector: 'link-caption-example',
    imports: [
        KbqLink
    ],
    template: `
        <div style="padding: 16px">
            <a size="compact" href="https://koobiq.io/en/components/link" target="_blank" kbqLink>Отчет сканирования</a>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkCaptionExample {}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqLink } from '@koobiq/components/link';

/**
 * @title Link target blank
 */
@Component({
    selector: 'link-target-blank-example',
    imports: [KbqLink],
    template: `
        <div style="padding: 16px">
            <a href="https://koobiq.io/en/components/link" target="_blank" kbqLink external>Отчет сканирования</a>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkTargetBlankExample {}

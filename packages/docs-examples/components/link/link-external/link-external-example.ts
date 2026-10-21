import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqLink } from '@koobiq/components/link';

/**
 * @title Link external
 */
@Component({
    selector: 'link-external-example',
    imports: [KbqLink],
    template: `
        <div style="padding: 16px">
            <a href="https://koobiq.io/en/components/link" target="_blank" kbqLink external>
                Центр технической поддержки
            </a>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkExternalExample {}

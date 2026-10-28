import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqLink } from '@koobiq/components/link';

/**
 * @title Link
 */
@Component({
    selector: 'link-overview-example',
    imports: [KbqLink],
    template: `
        <a kbqLink href="https://koobiq.io/en/components/link" target="_blank">Scan report</a>
    `,
    styles: `
        :host {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 160px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkOverviewExample {}

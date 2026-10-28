import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqLink } from '@koobiq/components/link';

/**
 * @title Link visited
 */
@Component({
    selector: 'link-visited-example',
    imports: [KbqLink],
    template: `
        <a kbqLink href="https://koobiq.io/en/components/link" target="_blank" useVisited>Scan report</a>
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
export class LinkVisitedExample {}

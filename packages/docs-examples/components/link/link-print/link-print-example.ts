import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqLink } from '@koobiq/components/link';

/**
 * @title Link print
 */
@Component({
    selector: 'link-print-example',
    imports: [KbqLink],
    template: `
        <a kbqLink print href="https://www.cvedetails.com/cve/CVE-2019-1020010/" target="_blank">CVE-2019-1020010</a>
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
export class LinkPrintExample {}

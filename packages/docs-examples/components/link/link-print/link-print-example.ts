import { Component } from '@angular/core';
import { KbqLinkModule } from '@koobiq/components/link';

/**
 * @title Link print
 */
@Component({
    standalone: true,
    selector: 'link-print-example',
    imports: [KbqLinkModule],
    template: `
        <div style="padding: 16px">
            <a
                [print]="'cvedetails.com/cve/CVE-2019-1020010'"
                href="https://www.cvedetails.com/cve/CVE-2019-1020010/"
                kbq-link
            >
                CVE-2019-1020010
            </a>
        </div>
    `
})
export class LinkPrintExample {}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqLink } from '@koobiq/components/link';

/**
 * @title Link print
 */
@Component({
    selector: 'link-print-example',
    imports: [KbqLink],
    template: `
        <div style="padding: 16px">
            <a
                href="https://www.cvedetails.com/cve/CVE-2019-1020010/"
                kbqLink
                [print]="'cvedetails.com/cve/CVE-2019-1020010'"
            >
                CVE-2019-1020010
            </a>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkPrintExample {}

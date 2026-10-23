import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqDd, KbqDl, KbqDt } from '@koobiq/components/dl';
import { KbqLink } from '@koobiq/components/link';

/**
 * @title Description list with long text
 */
@Component({
    selector: 'dl-long-text-example',
    imports: [KbqDl, KbqDt, KbqDd, KbqLink],
    template: `
        <kbq-dl resizable [dtMinWidth]="100" [ddMinWidth]="200">
            <kbq-dt>security.incident.description</kbq-dt>
            <kbq-dd>
                An employee opened the
                <span class="kbq-text-normal-strong">security_update.exe</span>
                attachment in a phishing email. The file executed malicious code on the workstation.
            </kbq-dd>

            <kbq-dt>process.parent.executable.file_name</kbq-dt>
            <kbq-dd>security_update.exe</kbq-dd>

            <kbq-dt>process.parent.executable.hash.sha256</kbq-dt>
            <kbq-dd>
                <span class="kbq-mono-normal">5cfeaa7084b508d0ea762d8cfed396b6029eed6005d381b16e725755ec801014</span>
            </kbq-dd>

            <kbq-dt>process.parent.executable.full_path</kbq-dt>
            <kbq-dd>
                C:\\Users\\Administrator\\AppData\\Local\\Temp\\SecurityUpdate\\packages\\windows\\x64\\security_update.exe
            </kbq-dd>

            <kbq-dt>threat.indicator.reference</kbq-dt>
            <kbq-dd>
                <a kbqLink pseudo>
                    https://www.virustotal.com/gui/file/5cfeaa7084b508d0ea762d8cfed396b6029eed6005d381b16e725755ec801014/detection
                </a>
            </kbq-dd>
        </kbq-dl>
    `,
    styles: `
        :host {
            display: block;
            max-width: 600px;
            padding: var(--kbq-size-l);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DlLongTextExample {}

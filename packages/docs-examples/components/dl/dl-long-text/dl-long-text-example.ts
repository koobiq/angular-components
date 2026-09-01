import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqDlModule } from '@koobiq/components/dl';
import { KbqLinkModule } from '@koobiq/components/link';

/**
 * @title Description list with long text
 */
@Component({
    selector: 'dl-long-text-example',
    imports: [KbqDlModule, KbqLinkModule],
    template: `
        @let dtMinWidth = 100;
        @let ddMinWidth = 200;

        <kbq-dl resizable [dtMinWidth]="dtMinWidth" [ddMinWidth]="ddMinWidth">
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

            <kbq-dt>threat.mitre_attack.technique_url</kbq-dt>
            <kbq-dd>
                <a kbq-link multiline href="https://attack.mitre.org/techniques/T1204/002/">
                    <span class="kbq-link__text">https://attack.mitre.org/techniques/T1204/002/</span>
                </a>
            </kbq-dd>
        </kbq-dl>
    `,
    styles: `
        :host {
            display: block;
            max-width: 600px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DlLongTextExample {}

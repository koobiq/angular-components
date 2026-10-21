import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqDd, KbqDl, KbqDt } from '@koobiq/components/dl';

/**
 * @title Description list with long text
 */
@Component({
    selector: 'dl-long-text-example',
    imports: [KbqDl, KbqDt, KbqDd],
    template: `
        <kbq-dl>
            <kbq-dt>process.parent.executable.file_name</kbq-dt>
            <kbq-dd>security_update.exe</kbq-dd>

            <kbq-dt>process.parent.executable.hash.sha256</kbq-dt>
            <kbq-dd>5cfeaa7084b508d0ea762d8cfed396b6029eed6005d381b16e725755ec801014</kbq-dd>

            <kbq-dt>process.parent.executable.full_path</kbq-dt>
            <kbq-dd>
                C:\\Users\\Administrator\\AppData\\Local\\Temp\\SecurityUpdate\\packages\\windows\\x64\\security_update.exe
            </kbq-dd>

            <kbq-dt>threat.mitre_attack.technique_url</kbq-dt>
            <kbq-dd>https://attack.mitre.org/techniques/T1204/002/</kbq-dd>
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

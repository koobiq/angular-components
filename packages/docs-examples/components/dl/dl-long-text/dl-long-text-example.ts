import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqDlModule } from '@koobiq/components/dl';

/**
 * @title Description list with long text
 */
@Component({
    selector: 'dl-long-text-example',
    imports: [KbqDlModule],
    template: `
        @let dtMinWidth = 100;
        @let ddMinWidth = 200;

        <kbq-dl resizable [dtMinWidth]="dtMinWidth" [ddMinWidth]="ddMinWidth">
            <kbq-dt>process.parent.entity_id</kbq-dt>
            <kbq-dd>0198EB25C90370D5A8B57414ED82C4D0198EB25C90370D5A8B5B7414ED82C4D</kbq-dd>
            <kbq-dt>process.parent.executable</kbq-dt>
            <kbq-dd>C:\\Users\\Administrator\\AppData\\Local\\Temp\\7zS4C0B1F3\\setup_installer.exe</kbq-dd>
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

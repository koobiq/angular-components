import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqCodeBlockFile, KbqCodeBlockModule } from '@koobiq/components/code-block';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Code-block with lineNumbers attribute
 */
@Component({
    selector: 'code-block-with-line-numbers-example',
    imports: [
        KbqCodeBlockModule,
        KbqToggleModule,
        FormsModule
    ],
    template: `
        <kbq-toggle class="layout-margin-bottom-m" [(ngModel)]="lineNumbers">Line numbers</kbq-toggle>
        <kbq-code-block canToggleSoftWrap [files]="files" [lineNumbers]="lineNumbers" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodeBlockWithLineNumbersExample {
    readonly files: KbqCodeBlockFile[] = [
        {
            content: `function getVulnerabilities() {\n\treturn ['BruteForce', 'Complex Attack', 'DDoS', 'HIPS alert', 'IDS/IPS Alert', 'Zero-Day Exploit', 'XSS', 'Malware', 'Ransomware', 'Phishing'];\n};`,
            language: 'javascript'
        }
    ];

    lineNumbers: boolean = true;
}

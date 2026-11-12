import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    KbqCodeBlockFile,
    kbqCodeBlockHighlightJsConfigProvider,
    KbqCodeBlockModule
} from '@koobiq/components/code-block';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Code-block with lineNumbers attribute
 */
@Component({
    selector: 'code-block-line-numbers-example',
    imports: [
        KbqCodeBlockModule,
        KbqToggleModule,
        FormsModule
    ],
    template: `
        <kbq-toggle class="layout-margin-bottom-m" [(ngModel)]="lineNumbers">{{ t().lineNumbers }}</kbq-toggle>
        <kbq-code-block canToggleSoftWrap [files]="files" [lineNumbers]="lineNumbers" />
    `,
    providers: [
        kbqCodeBlockHighlightJsConfigProvider({
            languages: {
                javascript: () => import('highlight.js/lib/languages/javascript')
            }
        })
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodeBlockLineNumbersExample extends BaseLocalizedExample<ExampleTranslation> {
    readonly files: KbqCodeBlockFile[] = [
        {
            content: `function getVulnerabilities() {\n\treturn ['BruteForce', 'Complex Attack', 'DDoS', 'HIPS alert', 'IDS/IPS Alert', 'Zero-Day Exploit', 'XSS', 'Malware', 'Ransomware', 'Phishing'];\n};`,
            language: 'javascript'
        }
    ];

    lineNumbers: boolean = true;

    constructor() {
        super(TRANSLATIONS);
    }
}

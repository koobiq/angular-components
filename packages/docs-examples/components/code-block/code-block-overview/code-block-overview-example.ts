import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    type KbqCodeBlockFile,
    kbqCodeBlockHighlightJsConfigProvider,
    KbqCodeBlockModule
} from '@koobiq/components/code-block';

/**
 * @title Code-block overview
 */
@Component({
    selector: 'code-block-overview-example',
    imports: [KbqCodeBlockModule],
    template: `
        <kbq-code-block [files]="files" />
    `,
    providers: [
        kbqCodeBlockHighlightJsConfigProvider({
            languages: {
                typescript: () => import('highlight.js/lib/languages/typescript')
            }
        })
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodeBlockOverviewExample {
    readonly files: KbqCodeBlockFile[] = [
        {
            content: `function getVulnerabilities(): string[] {\n\treturn ['XSS', 'DDoS', 'Phishing'];\n}`,
            language: 'typescript'
        }
    ];
}

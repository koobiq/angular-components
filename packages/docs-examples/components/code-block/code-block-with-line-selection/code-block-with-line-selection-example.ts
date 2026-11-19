import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    type KbqCodeBlockFile,
    kbqCodeBlockHighlightJsConfigProvider,
    KbqCodeBlockModule
} from '@koobiq/components/code-block';

/**
 * @title Code-block with line selection
 */
@Component({
    selector: 'code-block-with-line-selection-example',
    imports: [KbqCodeBlockModule],
    template: `
        <kbq-code-block canSelectLines lineNumbers [(files)]="files" />
    `,
    providers: [
        kbqCodeBlockHighlightJsConfigProvider({
            languages: {
                json: () => import('highlight.js/lib/languages/json')
            }
        })
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodeBlockWithLineSelectionExample {
    files: KbqCodeBlockFile[] = [
        {
            filename: 'incident.json',
            language: 'json',
            content: `{
    "id": "INC-2048",
    "severity": "critical",
    "rule": "Brute-force login",
    "source": "203.0.113.15",
    "attempts": 312,
    "status": "open"
}`,
            markedLines: [3]
        }
    ];
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    KbqCodeBlockFile,
    kbqCodeBlockHighlightJsConfigProvider,
    KbqCodeBlockModule
} from '@koobiq/components/code-block';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Code-block with filled attribute
 */
@Component({
    selector: 'code-block-with-filled-example',
    imports: [
        KbqCodeBlockModule,
        KbqToggleModule,
        FormsModule
    ],
    providers: [
        kbqCodeBlockHighlightJsConfigProvider({
            core: () => import('highlight.js/lib/core'),
            languages: {
                bash: () => import('highlight.js/lib/languages/bash')
            }
        })
    ],
    template: `
        <kbq-toggle class="layout-margin-bottom-m" [(ngModel)]="filled">Filled</kbq-toggle>
        <kbq-code-block [files]="files" [filled]="filled" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodeBlockWithFilledExample {
    readonly files: KbqCodeBlockFile[] = [
        {
            language: 'bash',
            content: 'npm install @koobiq/components'
        }
    ];

    filled: boolean = true;
}

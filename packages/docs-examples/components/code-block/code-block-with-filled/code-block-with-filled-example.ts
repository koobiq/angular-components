import { ChangeDetectionStrategy, Component, model } from '@angular/core';
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
    template: `
        <kbq-toggle class="layout-margin-bottom-m layout-margin-right-m" [(ngModel)]="filled">Filled</kbq-toggle>
        <kbq-toggle class="layout-margin-bottom-m" [(ngModel)]="alwaysShowActionbar">Always show actionbar</kbq-toggle>

        <kbq-code-block [files]="files" [filled]="filled()" [alwaysShowActionbar]="alwaysShowActionbar()" />
    `,
    providers: [
        kbqCodeBlockHighlightJsConfigProvider({
            core: () => import('highlight.js/lib/core'),
            languages: {
                bash: () => import('highlight.js/lib/languages/bash')
            }
        })
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodeBlockWithFilledExample {
    readonly files: KbqCodeBlockFile[] = [
        {
            language: 'bash',
            content: 'npm install @koobiq/components'
        }
    ];

    readonly filled = model(true);
    readonly alwaysShowActionbar = model(false);
}

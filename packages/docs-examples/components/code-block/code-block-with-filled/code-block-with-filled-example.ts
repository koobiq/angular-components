import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    KbqCodeBlockFile,
    kbqCodeBlockHighlightJsConfigProvider,
    KbqCodeBlockModule
} from '@koobiq/components/code-block';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

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
        <kbq-toggle class="layout-margin-bottom-m layout-margin-right-m" [(ngModel)]="filled">
            {{ t().filled }}
        </kbq-toggle>
        <kbq-toggle class="layout-margin-bottom-m" [(ngModel)]="alwaysShowActionbar">
            {{ t().alwaysShowActionbar }}
        </kbq-toggle>

        <kbq-code-block [files]="files" [filled]="filled()" [alwaysShowActionbar]="alwaysShowActionbar()" />
    `,
    providers: [
        kbqCodeBlockHighlightJsConfigProvider({
            languages: {
                bash: () => import('highlight.js/lib/languages/bash')
            }
        })
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodeBlockWithFilledExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    readonly files: KbqCodeBlockFile[] = [
        {
            language: 'bash',
            content: 'npm install @koobiq/components'
        }
    ];

    readonly filled = model(true);
    readonly alwaysShowActionbar = model(false);
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqCodeBlockFile, KbqCodeBlockModule } from '@koobiq/components/code-block';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Code-block with filled attribute
 */
@Component({
    standalone: true,
    selector: 'code-block-with-filled-example',
    imports: [
        KbqCodeBlockModule,
        KbqToggleModule,
        FormsModule
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

import { Component } from '@angular/core';
import { KbqCodeBlockModule, KbqCodeFile } from '@koobiq/components/code-block';

const codeTs2 = `getUserAddress('Rey.Padberg@karina.biz').then(console.log).catch(console.error)`;

/**
 * @title Сode-block single line
 */
@Component({
    standalone: true,
    selector: 'code-block-single-line-example',
    imports: [
        KbqCodeBlockModule
    ],
    template: `
        <kbq-code-block
            [codeFiles]="files"
            [filled]="false"
            [lineNumbers]="true"
        />
    `
})
export class CodeBlockSingleLineExample {
    files: KbqCodeFile[];

    constructor() {
        this.files = [
            {
                filename: '',
                content: codeTs2,
                language: 'typescript'
            }
        ];
    }
}

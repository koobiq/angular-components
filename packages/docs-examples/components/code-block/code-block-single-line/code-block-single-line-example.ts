import { Component, ViewEncapsulation } from '@angular/core';
import { KbqCodeFile } from '@koobiq/components/code-block';

const codeTs2 = `getUserAddress('Rey.Padberg@karina.biz').then(console.log).catch(console.error)`;

/**
 * @title Basic code-block-single-line
 */
@Component({
    selector: 'code-block-single-line-example',
    templateUrl: 'code-block-single-line-example.html',
    styleUrls: ['code-block-single-line-example.css'],
    encapsulation: ViewEncapsulation.None
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

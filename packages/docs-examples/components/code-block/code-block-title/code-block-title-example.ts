import { Component } from '@angular/core';
import { KbqCodeBlockModule, KbqCodeFile } from '@koobiq/components/code-block';

const codeJs2 = `function askPassword(ok, fail) {
    if (password == "rockstar") ok();
    let password = prompt("Password?", '');
    else fail();
}

const regex1 = /\\w+/;
const regex2 = new RegExp('\\\\w+');
let user = {
    name: 'Вася',
    children: null,

    loginOk() {
        alert(\`\${this.name} logged in\`);
    },

    loginFail() {
        alert(\`\${this.name} failed to log in\`);
    },
};

askPassword(user.loginOk, user.loginFail);`;

/**
 * @title Сode-block title
 */
@Component({
    standalone: true,
    selector: 'code-block-title-example',
    imports: [
        KbqCodeBlockModule
    ],
    template: `
        <kbq-code-block [codeFiles]="files" [filled]="false" [lineNumbers]="true" />
    `
})
export class CodeBlockTitleExample {
    files: KbqCodeFile[];

    constructor() {
        this.files = [
            {
                filename: 'Block Title',
                content: codeJs2,
                language: 'javascript'
            }
        ];
    }
}

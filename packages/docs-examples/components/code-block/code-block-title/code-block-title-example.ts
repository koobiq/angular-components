import { Component, ViewEncapsulation } from '@angular/core';
import { KbqCodeFile } from '@koobiq/components/code-block';


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
 * @title Basic code-block-title
 */
@Component({
    selector: 'code-block-title-example',
    templateUrl: 'code-block-title-example.html',
    styleUrls: ['code-block-title-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class CodeBlockTitleExample {
    files: KbqCodeFile[];

    constructor() {
        this.files = [{
            filename: 'Block Title',
            content: codeJs2,
            language: 'javascript'
        }];
    }
}

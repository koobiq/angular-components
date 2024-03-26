import { Component, ViewEncapsulation } from '@angular/core';
import { KbqCodeFile } from '@koobiq/components/code-block';


const codeTs = `class Greeter {
  @format("Hello, %s")
  greeting: string;

  constructor(message: string) {
    this.greeting = message;
    const age = 32;
  }

  greet() {
    let formatString = getFormat(this, "greeting");  // comment
    return formatString.replace("%s", this.greeting);
  }
}`;

const codeHTML = `<header class="page-header">
    <div class="logo">
        <p>Cat Energy</p>
    </div>
    <nav class="main-menu">
        <ul>
            <li><a href="#home">Главная</a></li>
            <li><a href="#blog">Посты</a></li>
            <li><a href="#me">Обо мне</a></li>
        </ul>
    </nav>
</header>`;

const codeCSS = `body, html {
    margin:0; padding: 0;
    height: 100%;
}
body {
    font-family: Helvetica Neue, Helvetica, Arial;
    font-size: 14px;
}

.small { font-size: 12px; }
*, *:after, *:before {
    -webkit-box-sizing:border-box;
    -moz-box-sizing:border-box;
    box-sizing:border-box;
}`;


/**
 * @title Basic code-block-tabs
 */
@Component({
    selector: 'code-block-tabs-with-overflow-example',
    templateUrl: 'code-block-tabs-with-overflow-example.html',
    styleUrls: ['code-block-tabs-with-overflow-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class CodeBlockTabsWithOverflowExample {
    files: KbqCodeFile[];

    constructor() {
        this.files = [
            {
                filename: 'HTML',
                content: codeHTML,
                language: 'html',
                link: 'https://stackblitz.com/edit/hpwmn8?file=src%2Fapp%2Ftest.html'
            },
            {
                filename: 'TS',
                content: codeTs,
                language: 'typescript'
            },
            {
                filename: 'CSS',
                content: codeCSS,
                language: 'css'
            }
        ];
    }
}

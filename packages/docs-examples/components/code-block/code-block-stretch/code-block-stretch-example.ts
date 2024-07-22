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

/**
 * @title Basic code-block-stretch
 */
@Component({
    selector: 'code-block-stretch-example',
    templateUrl: 'code-block-stretch-example.html',
    styleUrls: ['code-block-stretch-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class CodeBlockStretchExample {
    files: KbqCodeFile[];
    maxHeight = 185;
    isFixedHeight = true;

    constructor() {
        this.files = [
            {
                filename: '',
                content: codeTs,
                language: 'typescript'
            }
        ];
    }
}

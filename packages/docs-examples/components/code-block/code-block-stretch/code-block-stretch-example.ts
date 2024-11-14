import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqCodeBlockModule, KbqCodeFile } from '@koobiq/components/code-block';
import { KbqToggleModule } from '@koobiq/components/toggle';

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
 * @title Code-block stretch
 */
@Component({
    standalone: true,
    selector: 'code-block-stretch-example',
    imports: [
        KbqToggleModule,
        FormsModule,
        KbqCodeBlockModule
    ],
    template: `
        <kbq-toggle
            class="kbq-toggle_small"
            [(ngModel)]="isFixedHeight"
            style="margin: 10px 0"
        >
            Фиксированная высота
        </kbq-toggle>

        <kbq-code-block
            [codeFiles]="files"
            [filled]="false"
            [lineNumbers]="true"
            [maxHeight]="isFixedHeight ? maxHeight : 0"
        />
    `
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

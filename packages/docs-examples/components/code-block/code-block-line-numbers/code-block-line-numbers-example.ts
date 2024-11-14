import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqCodeBlockModule, KbqCodeFile } from '@koobiq/components/code-block';
import { KbqToggleModule } from '@koobiq/components/toggle';

const codeXML = `<?xml version="1.0" encoding="UTF-8"?>
  <breakfast_menu></breakfast_menu>
    <food></food>
      <name>Belgian Waffles</name>
      <price>$5.95</price>
      <description>Two of our famous Belgian Waffles with plenty of real maBelgian Waffles with plenty of real maple syrup</description>
      <calories>650</calories>
    </food>
  </breakfast_menu>`;

/**
 * @title Code-block line numbers
 */
@Component({
    standalone: true,
    selector: 'code-block-line-numbers-example',
    imports: [
        KbqToggleModule,
        FormsModule,
        KbqCodeBlockModule
    ],
    template: `
        <kbq-toggle
            class="kbq-toggle_small"
            [(ngModel)]="lineNumbers"
            style="margin: 10px 0"
        >
            Нумерация строк
        </kbq-toggle>

        <kbq-code-block
            [codeFiles]="files"
            [filled]="false"
            [lineNumbers]="lineNumbers"
        />
    `
})
export class CodeBlockLineNumbersExample {
    files: KbqCodeFile[];
    lineNumbers = true;

    constructor() {
        this.files = [
            {
                filename: '',
                content: codeXML,
                language: 'xml'
            }
        ];
    }
}

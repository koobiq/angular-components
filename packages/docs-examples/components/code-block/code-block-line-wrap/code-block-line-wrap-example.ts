import { Component, ViewEncapsulation } from '@angular/core';
import { KbqCodeFile } from '@koobiq/components/code-block';

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
 * @title Basic code-block-line-wrap
 */
@Component({
    selector: 'code-block-line-wrap-example',
    templateUrl: 'code-block-line-wrap-example.html',
    styleUrls: ['code-block-line-wrap-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class CodeBlockLineWrapExample {
    files: KbqCodeFile[];
    lineWrap = true;

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

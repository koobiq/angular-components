import { Component, NgModule, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KbqButtonModule } from '@koobiq/components/button';
import { ThemePalette } from '@koobiq/components/core';
import { KbqSidepanelModule } from '@koobiq/components/sidepanel';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { KBQ_CODE_BLOCK_CONFIGURATION, KbqCodeBlockModule, KbqCodeFile } from '../../components/code-block';
import { codeCSS, codeCs, codeHTML, codeHTML3, codeJs2, codeJson, codeTs, codeXML, text } from './code-files-example';

@Component({
    selector: 'app',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None,
    templateUrl: './template.html',
})
export class DemoComponent {
    @ViewChild(TemplateRef, { static: false }) template: TemplateRef<any>;

    themePalette = ThemePalette;
    files: KbqCodeFile[];
    files4: KbqCodeFile[];

    constructor() {
        this.files = [
            {
                filename: 'types.ts',
                content: codeTs,
                language: 'typescript',
            },
            {
                filename: 'index.html',
                content: codeHTML,
                language: 'html',
                link: 'https://stackblitz.com/edit/web-platform-f5jywg?file=index.html',
            },
            {
                filename: 'menu.xml',
                content: codeXML,
                language: 'xml',
            },
            {
                filename: 'app.js',
                content: codeJs2,
                language: 'javascript',
                link: 'https://stackblitz.com/edit/js-aux7gf?file=index.js',
            },
            {
                filename: 'Text.txt',
                content: text,
                language: 'txt',
            },
            {
                filename: 'response.json',
                content: codeJson,
                language: 'json',
            },
            {
                filename: 'class',
                content: codeCs,
                language: 'csharp',
            },
            {
                filename: 'smallHtml',
                content: codeHTML3,
                language: 'html',
            },
            {
                filename: 'styles.css',
                content: codeCSS,
                language: 'css',
            },
            {
                filename: 'app',
                content: codeJs2,
                language: 'javascript',
            },
        ];

        this.files4 = [
            {
                filename: '',
                content: codeJs2,
                language: 'javascript',
            },
        ];
    }
}

@NgModule({
    declarations: [DemoComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        KbqCodeBlockModule,
        KbqToggleModule,
        KbqButtonModule,
        KbqSidepanelModule,
        FormsModule,
    ],
    providers: [
        {
            provide: KBQ_CODE_BLOCK_CONFIGURATION,
            useValue: {
                softWrapOnTooltip: 'Включить перенос по словам',
                softWrapOffTooltip: 'Выключить перенос по словам',
                downloadTooltip: 'Скачать',
                copiedTooltip: '✓ Скопировано',
                copyTooltip: 'Скопировать',
                viewAllText: 'Показать все',
                viewLessText: 'Свернуть',
                openExternalSystemTooltip: 'Открыть во внешней системе',
            },
        },
    ],
    bootstrap: [DemoComponent],
})
export class DemoModule {}

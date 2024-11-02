import { ChangeDetectionStrategy, Component, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    KbqCodeBlockFile,
    KbqCodeBlockModule,
    kbqCodeBlockLocaleConfigurationProvider
} from '@koobiq/components/code-block';
import { ThemePalette } from '@koobiq/components/core';
import { codeHTML, codeJs2, codeTs, codeXML, text } from './code-files-example';

@Component({
    selector: 'app',
    standalone: true,
    imports: [
        KbqCodeBlockModule
    ],
    providers: [
        kbqCodeBlockLocaleConfigurationProvider({
            softWrapOnTooltip: '*dev* Enable word wrap',
            softWrapOffTooltip: '*dev* Disable word wrap',
            downloadTooltip: '*dev* Download',
            copiedTooltip: '*dev* ✓ Copied',
            copyTooltip: '*dev* Copy',
            viewAllText: '*dev* Show all',
            viewLessText: '*dev* Show less',
            openExternalSystemTooltip: '*dev* Open in the external system'
        })

    ],
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodeBlockDev {
    @ViewChild(TemplateRef, { static: false }) template: TemplateRef<any>;

    themePalette = ThemePalette;
    files1: KbqCodeBlockFile[] = [
        {
            filename: 'types',
            content: codeTs,
            language: 'typescript',
            link: 'koobiq.io'
        },
        {
            filename: 'index.html',
            content: codeHTML,
            language: 'html',
            link: 'https://stackblitz.com/edit/web-platform-f5jywg?file=index.html'
        },
        {
            filename: 'menu.xml',
            content: codeXML,
            language: 'xml'
        },
        {
            filename: 'app.js',
            content: codeJs2,
            language: 'javascript',
            link: 'https://stackblitz.com/edit/js-aux7gf?file=index.js'
        },
        {
            filename: 'Text.txt',
            content: text,
            language: 'txt'
        }
        // {
        //     filename: 'response.json',
        //     content: codeJson,
        //     language: 'json'
        // },
        // {
        //     filename: 'class',
        //     content: codeCs,
        //     language: 'csharp'
        // },
        // {
        //     filename: 'smallHtml',
        //     content: codeHTML3,
        //     language: 'html'
        // },
        // {
        //     filename: 'styles.css',
        //     content: codeCSS,
        //     language: 'css'
        // },
        // {
        //     filename: 'app',
        //     content: codeJs2,
        //     language: 'javascript'
        // }
    ];
    files2: KbqCodeBlockFile[] = [
        {
            filename: '',
            content: codeJs2,
            language: 'javascript'
        }
    ];
}

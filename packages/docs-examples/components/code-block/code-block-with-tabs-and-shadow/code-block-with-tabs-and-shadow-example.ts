import { AfterViewInit, ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import {
    KbqCodeBlock,
    KbqCodeBlockFile,
    kbqCodeBlockHighlightJsConfigProvider,
    KbqCodeBlockModule
} from '@koobiq/components/code-block';

/**
 * @title Code-block with tabs and shadow
 */
@Component({
    selector: 'code-block-with-tabs-and-shadow-example',
    imports: [KbqCodeBlockModule],
    template: `
        <kbq-code-block
            lineNumbers
            canToggleSoftWrap
            [activeFileIndex]="2"
            [softWrap]="true"
            [files]="files"
            [style.height.px]="350"
        />
    `,
    providers: [
        kbqCodeBlockHighlightJsConfigProvider({
            languages: {
                html: () => import('highlight.js/lib/languages/xml'),
                typescript: () => import('highlight.js/lib/languages/typescript'),
                css: () => import('highlight.js/lib/languages/css')
            }
        })
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodeBlockWithTabsAndShadowExample implements AfterViewInit {
    readonly codeBlock = viewChild.required(KbqCodeBlock);

    readonly files: KbqCodeBlockFile[] = [
        {
            language: 'html',
            filename: 'index.html',
            content: `<!DOCTYPE html>\n<html lang="en">\n\t<head>\n\t\t<title>Koobiq</title>\n\t\t<meta charset="UTF-8" />\n\t\t<base href="/">\n\t\t<meta name="viewport" content="width=device-width, initial-scale=1" />\n\t\t<link rel="icon" type="image/x-icon" href="favicon.ico" />\n\t\t<meta name="description" content="Koobiq is an open-source design system with Angular components, design tokens, icons and guidelines for building interfaces" />\n\t</head>\n\t<body>\n\t\t<app-root>Loading...</app-root>\n\t</body>\n</html>`
        },
        {
            language: 'typescript',
            filename: 'main.ts',
            content: `import { ChangeDetectionStrategy, Component } from '@angular/core';\nimport { bootstrapApplication } from '@angular/platform-browser';\nimport { KbqLink } from '@koobiq/components/link';\n\n@Component({\n\timports: [KbqLink],\n\tselector: 'app-root',\n\ttemplate: \`<a kbqLink target="_blank" href="https://koobiq.io/">Koobiq</a>\`,\n\tchangeDetection: ChangeDetectionStrategy.OnPush\n})\nexport class App {}\n\nbootstrapApplication(App).catch((error) => console.error(error));`
        },
        {
            language: 'css',
            filename: 'main.css',
            content: `body {\n\tmargin: 0;\n\tfont-family: var(--kbq-typography-text-normal-font-family);\n\tfont-size: var(--kbq-typography-text-normal-font-size);\n\tfont-weight: var(--kbq-typography-text-normal-font-weight);\n\tline-height: var(--kbq-typography-text-normal-line-height);\n\ttext-transform: var(--kbq-typography-text-normal-text-transform);\n\tfont-feature-settings: var(--kbq-typography-text-normal-font-feature-settings);\n\tletter-spacing: var(--kbq-typography-text-normal-letter-spacing);\n\tbackground: var(--kbq-background-bg);\n\tcolor: var(--kbq-foreground-contrast);\n}\n\na {\n\tcolor: var(--kbq-link-text);\n\ttext-decoration: none;\n}`
        }
    ];

    ngAfterViewInit(): void {
        this.codeBlock().scrollTo({ bottom: 0, behavior: 'instant' });
    }
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqCodeBlockFile, KbqCodeBlockModule } from '@koobiq/components/code-block';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Code-block with tabs
 */
@Component({
    standalone: true,
    selector: 'code-block-with-tabs-example',
    imports: [
        KbqCodeBlockModule,
        KbqToggleModule,
        FormsModule
    ],
    template: `
        <kbq-toggle [(ngModel)]="hideTabs">Hide tabs</kbq-toggle>
        <kbq-code-block
            [files]="files"
            [hideTabs]="hideTabs"
            activeFileIndex="1"
            lineNumbers
            canToggleSoftWrap
            canDownload
        />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodeBlockWithTabsExample {
    readonly files: KbqCodeBlockFile[] = [
        {
            language: 'html',
            filename: 'index.html',
            content: `<!DOCTYPE html>\n<html lang="en">\n\t<head>\n\t\t<title>Koobiq</title>\n\t\t<meta charset="UTF-8" />\n\t\t<base href="/">\n\t\t<link href="https://fonts.googleapis.com" rel="preconnect" />\n\t\t<link crossorigin href="https://fonts.gstatic.com" rel="preconnect" />\n\t\t<link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet" />\n\t</head>\n\t<body>\n\t\t<app-root>Loading...</app-root>\n\t</body>\n</html>`
        },
        {
            language: 'typescript',
            filename: 'main.ts',
            content: `import { ChangeDetectionStrategy, Component } from '@angular/core';\nimport { bootstrapApplication } from '@angular/platform-browser';\nimport { KbqLinkModule } from '@koobiq/components/link';\n\n@Component({\n\tstandalone: true,\n\timports: [KbqLinkModule],\n\tselector: 'app-root',\n\ttemplate: \`<a kbq-link target="_blank" href="https://koobiq.io/">Koobiq</a>\`,\n\tchangeDetection: ChangeDetectionStrategy.OnPush\n})\nexport class App {}\n\nbootstrapApplication(App).catch((error) => console.error(error));`
        },
        {
            language: 'css',
            filename: 'main.css',
            content: `body {\n\tmargin: 0;\n\tfont-family: var(--kbq-typography-text-normal-font-family);\n\tfont-size: var(--kbq-typography-text-normal-font-size);\n\tfont-weight: var(--kbq-typography-text-normal-font-weight);\n\tline-height: var(--kbq-typography-text-normal-line-height);\n\ttext-transform: var(--kbq-typography-text-normal-text-transform);\n\tfont-feature-settings: var(--kbq-typography-text-normal-font-feature-settings);\n\tletter-spacing: var(--kbq-typography-text-normal-letter-spacing);\n\tbackground: var(--kbq-background-bg);\n\tcolor: var(--kbq-foreground-contrast);\n}\n\na {\n\tcolor: var(--kbq-link-text);\n\ttext-decoration: none;\n}`
        }
    ];

    hideTabs: boolean = false;
}

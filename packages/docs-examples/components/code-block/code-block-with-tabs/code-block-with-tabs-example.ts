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
        <kbq-toggle class="layout-margin-bottom-m" [(ngModel)]="hideTabs">Hide tabs</kbq-toggle>
        <kbq-code-block [files]="files" [hideTabs]="hideTabs" activeFileIndex="1" lineNumbers canDownload />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodeBlockWithTabsExample {
    readonly files: KbqCodeBlockFile[] = [
        {
            language: 'html',
            filename: 'index.html',
            content: `<!DOCTYPE html>\n<html lang="en">\n\t<head>\n\t\t<title>Koobiq</title>\n\t\t<meta charset="UTF-8" />\n\t\t<base href="/">\n\t</head>\n\t<body>\n\t\t<app-root>Loading...</app-root>\n\t</body>\n</html>`
        },
        {
            language: 'typescript',
            filename: 'main.ts',
            content: `import { ChangeDetectionStrategy, Component } from '@angular/core';\nimport { bootstrapApplication } from '@angular/platform-browser';\n\n@Component({\n\tstandalone: true,\n\timports: [],\n\tselector: 'app-root',\n\ttemplate: \`<a target="_blank" href="https://koobiq.io/">Koobiq</a>\`,\n\tchangeDetection: ChangeDetectionStrategy.OnPush\n})\nexport class App {}\n\nbootstrapApplication(App).catch((error) => console.error(error));`
        },
        {
            language: 'css',
            filename: 'main.css',
            content: `body {\n\tfont-family: Inter, Arial, sans-serif;\n\tmargin: 0;\n}\n\na {\n\tcolor: var(--kbq-link-text);\n}`
        }
    ];

    hideTabs: boolean = false;
}

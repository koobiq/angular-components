import { afterNextRender, ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { KbqCodeBlock, KbqCodeBlockFile } from '@koobiq/components/code-block';

@Component({
    selector: 'e2e-code-block-states',
    imports: [KbqCodeBlock],
    template: `
        <!-- Single line -->
        <div>
            <kbq-code-block [files]="[singleLineFile]" />
            <kbq-code-block filled [files]="[singleLineFile]" />
        </div>

        <!-- With tabs and scrolled -->
        <div>
            <kbq-code-block
                #withTabs
                activeFileIndex="1"
                [style.height.px]="200"
                [files]="[typescriptFile, htmlFile, cssFile]"
            />
        </div>

        <!-- lineNumbers -->
        <div>
            <kbq-code-block canDownload lineNumbers [files]="[typescriptFile]" />
        </div>

        <!-- filled -->
        <div>
            <kbq-code-block filled [files]="[typescriptFile, cssFile, htmlFile]" />
        </div>

        <!-- softWrap -->
        <div>
            <kbq-code-block softWrap canToggleSoftWrap [files]="[htmlFile]" />
        </div>

        <!-- maxHeight -->
        <div>
            <kbq-code-block maxHeight="200" [files]="[cssFile, htmlFile, typescriptFile]" />
        </div>

        <!-- maxHeight filled -->
        <div>
            <kbq-code-block maxHeight="200" filled [files]="[cssFile, htmlFile]" />
        </div>

        <!-- noBorder hideTabs lineNumbers -->
        <div>
            <kbq-code-block lineNumbers noBorder hideTabs [files]="[typescriptFile]" />
        </div>

        <!-- noBorder filled -->
        <div>
            <kbq-code-block noBorder filled [files]="[typescriptFile]" />
        </div>

        <!-- hideTabs -->
        <div>
            <kbq-code-block hideTabs [files]="[typescriptFile, cssFile]" />
        </div>
    `,
    styles: `
        :host {
            display: inline-grid;
            grid-template-columns: repeat(3, 250px);
            gap: var(--kbq-size-s);
            padding: var(--kbq-size-xs);
        }

        div {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-s);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eCodeBlockStates'
    }
})
export class E2eCodeBlockStates {
    private readonly codeBlockWithTabs = viewChild.required<KbqCodeBlock>('withTabs');
    protected readonly htmlFile: KbqCodeBlockFile = {
        // For testing KBQ_CODE_BLOCK_FALLBACK_FILE_LANGUAGE
        // language: 'html',
        filename: 'index.html',
        content: `<!DOCTYPE html>\n<html lang="en">\n\t<head>\n\t\t<title>Koobiq</title>\n\t\t<meta charset="UTF-8" />\n\t\t<base href="/">\n\t\t<link href="https://fonts.googleapis.com" rel="preconnect" />\n\t\t<link crossorigin href="https://fonts.gstatic.com" rel="preconnect" />\n\t\t<link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet" />\n\t</head>\n\t<body>\n\t\t<app-root>Loading...</app-root>\n\t</body>\n</html>`
    };
    protected readonly typescriptFile: KbqCodeBlockFile = {
        language: 'typescript',
        filename: 'main.ts',
        content: `import { ChangeDetectionStrategy, Component } from '@angular/core';\nimport { bootstrapApplication } from '@angular/platform-browser';\nimport { KbqLinkModule } from '@koobiq/components/link';\n\n@Component({\n\timports: [KbqLinkModule],\n\tselector: 'app-root',\n\ttemplate: \`<a kbq-link target="_blank" href="https://koobiq.io/">Koobiq</a>\`,\n\tchangeDetection: ChangeDetectionStrategy.OnPush\n})\nexport class App {}\n\nbootstrapApplication(App).catch((error) => console.error(error));`
    };
    protected readonly cssFile: KbqCodeBlockFile = {
        language: 'css',
        // For testing KBQ_CODE_BLOCK_FALLBACK_FILE_NAME
        // filename: 'main.css',
        content: `body {\n\tmargin: 0;\n\tfont-family: var(--kbq-typography-text-normal-font-family);\n\tfont-size: var(--kbq-typography-text-normal-font-size);\n\tfont-weight: var(--kbq-typography-text-normal-font-weight);\n\tline-height: var(--kbq-typography-text-normal-line-height);\n\ttext-transform: var(--kbq-typography-text-normal-text-transform);\n\tfont-feature-settings: var(--kbq-typography-text-normal-font-feature-settings);\n\tletter-spacing: var(--kbq-typography-text-normal-letter-spacing);\n\tbackground: var(--kbq-background-bg);\n\tcolor: var(--kbq-foreground-contrast);\n}\n\na {\n\tcolor: var(--kbq-link-text);\n\ttext-decoration: none;\n}`
    };
    protected readonly singleLineFile: KbqCodeBlockFile = {
        language: 'bash',
        content: 'ng add @koobiq/components'
    };

    constructor() {
        afterNextRender(() => {
            this.codeBlockWithTabs().scrollableCodeContent.scrollTo({ top: 999 });
        });
    }
}

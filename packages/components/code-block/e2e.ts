import { afterNextRender, ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { KbqCodeBlock, KbqCodeBlockFile, kbqCodeBlockLocaleConfigurationProvider } from '@koobiq/components/code-block';
import { enUSLocaleData } from '@koobiq/components/core';
import { kbqScrollbarOptionsProvider } from '@koobiq/components/scrollbar';

const singleLineFile: KbqCodeBlockFile = {
    language: 'bash',
    content: 'ng add @koobiq/components'
};

// Three lines, each long enough to run under the actionbar of a 250px block.
const importsFile: KbqCodeBlockFile = {
    language: 'typescript',
    filename: 'main.ts',
    content: `import { ChangeDetectionStrategy, Component } from '@angular/core';\nimport { bootstrapApplication } from '@angular/platform-browser';\nimport { KbqLinkModule } from '@koobiq/components/link';`
};

const linkedImportsFile: KbqCodeBlockFile = { ...importsFile, link: 'https://koobiq.io/' };

// The URL is one token wider than the block, so soft wrap has to break inside it.
const anchorFile: KbqCodeBlockFile = {
    // For testing KBQ_CODE_BLOCK_FALLBACK_FILE_LANGUAGE
    // language: 'html',
    filename: 'index.html',
    content: `<body>\n\t<a href="https://koobiq.io/en/components/code-block/overview" kbq-link>Code block</a>\n</body>`
};

const typescriptFile: KbqCodeBlockFile = {
    language: 'typescript',
    filename: 'main.ts',
    content: `import { ChangeDetectionStrategy, Component } from '@angular/core';\nimport { bootstrapApplication } from '@angular/platform-browser';\nimport { KbqLinkModule } from '@koobiq/components/link';\n\n@Component({\n\timports: [KbqLinkModule],\n\tselector: 'app-root',\n\ttemplate: \`<a kbq-link target="_blank" href="https://koobiq.io/">Koobiq</a>\`,\n\tchangeDetection: ChangeDetectionStrategy.OnPush\n})\nexport class App {}\n\nbootstrapApplication(App).catch((error) => console.error(error));`
};

const htmlFile: KbqCodeBlockFile = {
    filename: 'index.html',
    content: `<!DOCTYPE html>\n<html lang="en">\n\t<head>\n\t\t<title>Koobiq</title>\n\t\t<meta charset="UTF-8" />\n\t\t<meta name="viewport" content="width=device-width, initial-scale=1" />\n\t\t<base href="/">\n\t\t<link href="favicon.ico" rel="icon" type="image/x-icon" />\n\t\t<link href="styles.css" rel="stylesheet" />\n\t</head>\n\t<body>\n\t\t<app-root>Loading...</app-root>\n\t</body>\n</html>`
};

const cssFile: KbqCodeBlockFile = {
    language: 'css',
    // For testing KBQ_CODE_BLOCK_FALLBACK_FILE_NAME
    // filename: 'main.css',
    content: `body {\n\tmargin: 0;\n\tfont-family: var(--kbq-typography-text-normal-font-family);\n\tfont-size: var(--kbq-typography-text-normal-font-size);\n\tfont-weight: var(--kbq-typography-text-normal-font-weight);\n\tline-height: var(--kbq-typography-text-normal-line-height);\n\ttext-transform: var(--kbq-typography-text-normal-text-transform);\n\tfont-feature-settings: var(--kbq-typography-text-normal-font-feature-settings);\n\tletter-spacing: var(--kbq-typography-text-normal-letter-spacing);\n\tbackground: var(--kbq-background-bg);\n\tcolor: var(--kbq-foreground-contrast);\n}\n\na {\n\tcolor: var(--kbq-link-text);\n\ttext-decoration: none;\n}`
};

@Component({
    selector: 'e2e-code-block-no-tabs',
    imports: [KbqCodeBlock],
    template: `
        <div class="e2e-code-block-grid" data-testid="e2eScreenshotTarget">
            <!-- A single file with no filename hides the tabs by itself -->
            <kbq-code-block [files]="[singleLineFile]" />
            <kbq-code-block filled [files]="[singleLineFile]" />
            <kbq-code-block noBorder [files]="[singleLineFile]" />

            <kbq-code-block alwaysShowActionbar [files]="[singleLineFile]" />
            <kbq-code-block alwaysShowActionbar filled [files]="[singleLineFile]" />
            <kbq-code-block alwaysShowActionbar noBorder [files]="[singleLineFile]" />

            <kbq-code-block hideTabs [files]="[importsFile]" />
            <kbq-code-block filled hideTabs [files]="[importsFile]" />
            <kbq-code-block hideTabs noBorder [files]="[importsFile]" />

            <kbq-code-block alwaysShowActionbar hideTabs [files]="[importsFile]" />
            <kbq-code-block alwaysShowActionbar filled hideTabs [files]="[importsFile]" />
            <kbq-code-block alwaysShowActionbar hideTabs noBorder [files]="[importsFile]" />
        </div>
    `,
    styles: `
        .e2e-code-block-grid {
            display: inline-grid;
            grid-template-columns: repeat(3, 250px);
            align-items: start;
            gap: var(--kbq-size-s);
            padding: var(--kbq-size-xs);
        }
    `,
    providers: [kbqCodeBlockLocaleConfigurationProvider(enUSLocaleData.codeBlock)],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eCodeBlockNoTabs'
    }
})
export class E2eCodeBlockNoTabs {
    protected readonly singleLineFile = singleLineFile;
    protected readonly importsFile = importsFile;
}

@Component({
    selector: 'e2e-code-block-tabs',
    imports: [KbqCodeBlock],
    template: `
        <div class="e2e-code-block-grid" data-testid="e2eScreenshotTarget">
            <kbq-code-block [files]="[importsFile]" />
            <kbq-code-block filled [files]="[importsFile]" />
            <kbq-code-block noBorder [files]="[importsFile]" />

            <kbq-code-block activeFileIndex="1" [files]="[importsFile, anchorFile, cssFile]" />
            <kbq-code-block activeFileIndex="1" filled [files]="[importsFile, anchorFile, cssFile]" />
            <kbq-code-block activeFileIndex="1" noBorder [files]="[importsFile, anchorFile, cssFile]" />

            <kbq-code-block canDownload canToggleSoftWrap [files]="[linkedImportsFile]" />
            <kbq-code-block canDownload canToggleSoftWrap filled [files]="[linkedImportsFile]" />
            <kbq-code-block canDownload canToggleSoftWrap noBorder [files]="[linkedImportsFile]" />
        </div>
    `,
    styles: `
        .e2e-code-block-grid {
            display: inline-grid;
            grid-template-columns: repeat(3, 250px);
            align-items: start;
            gap: var(--kbq-size-s);
            padding: var(--kbq-size-xs);
        }
    `,
    providers: [kbqCodeBlockLocaleConfigurationProvider(enUSLocaleData.codeBlock)],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eCodeBlockTabs'
    }
})
export class E2eCodeBlockTabs {
    protected readonly importsFile = importsFile;
    protected readonly linkedImportsFile = linkedImportsFile;
    protected readonly anchorFile = anchorFile;
    protected readonly cssFile = cssFile;
}

@Component({
    selector: 'e2e-code-block-line-numbers',
    imports: [KbqCodeBlock],
    template: `
        <!-- The numbers are spaced from the code by different tokens with and without the header -->
        <div class="e2e-code-block-grid" data-testid="e2eScreenshotTarget">
            <kbq-code-block lineNumbers [files]="[importsFile]" />
            <kbq-code-block hideTabs lineNumbers [files]="[importsFile]" />
        </div>
    `,
    styles: `
        .e2e-code-block-grid {
            display: inline-grid;
            grid-template-columns: repeat(2, 250px);
            align-items: start;
            gap: var(--kbq-size-s);
            padding: var(--kbq-size-xs);
        }
    `,
    providers: [kbqCodeBlockLocaleConfigurationProvider(enUSLocaleData.codeBlock)],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eCodeBlockLineNumbers'
    }
})
export class E2eCodeBlockLineNumbers {
    protected readonly importsFile = importsFile;
}

@Component({
    selector: 'e2e-code-block-soft-wrap',
    imports: [KbqCodeBlock],
    template: `
        <div class="e2e-code-block-grid" data-testid="e2eScreenshotTarget">
            <kbq-code-block canToggleSoftWrap softWrap [files]="[anchorFile]" />
        </div>
    `,
    styles: `
        .e2e-code-block-grid {
            display: inline-grid;
            grid-template-columns: 250px;
            padding: var(--kbq-size-xs);
        }
    `,
    providers: [kbqCodeBlockLocaleConfigurationProvider(enUSLocaleData.codeBlock)],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eCodeBlockSoftWrap'
    }
})
export class E2eCodeBlockSoftWrap {
    protected readonly anchorFile = anchorFile;
}

@Component({
    selector: 'e2e-code-block-view-all',
    imports: [KbqCodeBlock],
    template: `
        <div class="e2e-code-block-grid" data-testid="e2eScreenshotTarget">
            <kbq-code-block maxHeight="120" [files]="[typescriptFile]" />
            <kbq-code-block filled maxHeight="120" [files]="[typescriptFile]" />
            <kbq-code-block hideTabs maxHeight="120" [files]="[typescriptFile]" />
            <kbq-code-block filled hideTabs maxHeight="120" [files]="[typescriptFile]" />

            <kbq-code-block hideTabs maxHeight="120" viewAll [files]="[typescriptFile]" />
            <kbq-code-block filled hideTabs maxHeight="120" viewAll [files]="[typescriptFile]" />
            <!-- Code that fits the height gets no button -->
            <kbq-code-block maxHeight="120" [files]="[singleLineFile]" />
        </div>
    `,
    styles: `
        .e2e-code-block-grid {
            display: inline-grid;
            grid-template-columns: repeat(4, 250px);
            align-items: start;
            gap: var(--kbq-size-s);
            padding: var(--kbq-size-xs);
        }
    `,
    providers: [kbqCodeBlockLocaleConfigurationProvider(enUSLocaleData.codeBlock)],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eCodeBlockViewAll'
    }
})
export class E2eCodeBlockViewAll {
    protected readonly singleLineFile = singleLineFile;
    protected readonly typescriptFile = typescriptFile;
}

@Component({
    selector: 'e2e-code-block-scroll',
    imports: [KbqCodeBlock],
    template: `
        <div class="e2e-code-block-grid" data-testid="e2eScreenshotTarget">
            <kbq-code-block
                #withTabs
                activeFileIndex="1"
                data-testid="e2eCodeBlockWithTabs"
                [style.height.px]="200"
                [files]="[typescriptFile, htmlFile, cssFile]"
            />
            <!-- The scrollbar track is drawn above the actionbar -->
            <kbq-code-block alwaysShowActionbar hideTabs [style.height.px]="120" [files]="[typescriptFile]" />
            <kbq-code-block alwaysShowActionbar filled hideTabs [style.height.px]="120" [files]="[typescriptFile]" />
        </div>
    `,
    styles: `
        .e2e-code-block-grid {
            display: inline-grid;
            grid-template-columns: repeat(3, 250px);
            align-items: start;
            gap: var(--kbq-size-s);
            padding: var(--kbq-size-xs);
        }
    `,
    providers: [
        kbqCodeBlockLocaleConfigurationProvider(enUSLocaleData.codeBlock),
        // A hover track is hidden in the shot; this one shows where the scrollbar sits.
        kbqScrollbarOptionsProvider({ mode: 'always' })
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eCodeBlockScroll'
    }
})
export class E2eCodeBlockScroll {
    private readonly codeBlockWithTabs = viewChild.required<KbqCodeBlock>('withTabs');

    protected readonly typescriptFile = typescriptFile;
    protected readonly htmlFile = htmlFile;
    protected readonly cssFile = cssFile;

    constructor() {
        afterNextRender(() => this.codeBlockWithTabs().scrollTo({ top: 999 }));
    }
}

@Component({
    selector: 'e2e-code-block-scrollbar-flash',
    imports: [KbqCodeBlock],
    template: `
        <kbq-code-block
            class="e2e-code-block"
            data-testid="e2eCodeBlockFlashOverflowing"
            [style.height.px]="120"
            [files]="[longFile]"
        />

        <kbq-code-block class="e2e-code-block" data-testid="e2eCodeBlockFlashFitting" [files]="[shortFile]" />
    `,
    styles: `
        :host {
            display: flex;
            gap: var(--kbq-size-l);
            padding: var(--kbq-size-m);
        }

        .e2e-code-block {
            width: 320px;
        }
    `,
    providers: [
        kbqCodeBlockLocaleConfigurationProvider(enUSLocaleData.codeBlock),
        // The reveal lasts hideDelay and nothing brings it back, so the default second would make this
        // a race against page load rather than a test of the behaviour.
        kbqScrollbarOptionsProvider({ hideDelay: 5000 })
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eCodeBlockScrollbarFlash'
    }
})
export class E2eCodeBlockScrollbarFlash {
    protected readonly longFile: KbqCodeBlockFile = {
        language: 'typescript',
        filename: 'long.ts',
        content: Array.from({ length: 40 }, (_, index) => `const value${index} = 'a fairly long line of code';`).join(
            '\n'
        )
    };
    protected readonly shortFile: KbqCodeBlockFile = {
        language: 'bash',
        filename: 'short.sh',
        content: 'ng add @koobiq/components'
    };
}

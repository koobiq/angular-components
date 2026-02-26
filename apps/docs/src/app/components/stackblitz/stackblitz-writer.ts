import { HttpClient } from '@angular/common/http';
import { inject, Injectable, NgZone, VERSION } from '@angular/core';
import { EXAMPLE_COMPONENTS, ExampleData } from '@koobiq/docs-examples';
import { default as StackBlitzSDK } from '@stackblitz/sdk';
import { firstValueFrom, Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { docsKoobiqVersion } from '../../version';
import { docsNormalizePath } from './normalize-path';

const COPYRIGHT = `Use of this source code is governed by an MIT-style license.`;

/**
 * Path that refers to the docs-content from the "@koobiq/docs-examples" package. The
 * structure is defined in the repository, but we include the docs-content as assets in
 * the CLI configuration.
 */
const DOCS_CONTENT_PATH = 'docs-content/examples-source';
const TEMPLATE_PATH = 'assets/stackblitz/';
const PROJECT_TEMPLATE = 'node';

/**
 * Mapping from import patterns found in example `.ts` files to optional
 * dependencies that should be added to the generated StackBlitz `package.json`.
 * These are only included when the example actually uses them.
 */
const OPTIONAL_PACKAGE_JSON_DEPENDENCIES = {
    '@koobiq/components/markdown': {
        marked: '^17.0.3'
    },
    '@koobiq/components/input': {
        '@maskito/angular': '^5.0.1',
        '@maskito/kit': '^5.0.1'
    },
    '@koobiq/components/code-block': {
        'highlight.js': '^11.11.1'
    },
    '@koobiq/ag-grid-angular-theme': {
        '@koobiq/ag-grid-angular-theme': '^34.0.0',
        'ag-grid-angular': '^34.3.1',
        'ag-grid-community': '^34.3.1'
    }
} as const;

const OPTIONAL_ANGULAR_JSON_STYLES = {
    '@koobiq/ag-grid-angular-theme': [
        'node_modules/@koobiq/ag-grid-angular-theme/theme.scss'
    ]
} as const;

export const DOCS_TEMPLATE_FILES = [
    '.editorconfig',
    '.gitignore',
    '.stackblitzrc',
    'angular.json',
    'tsconfig.app.json',
    'tsconfig.json',
    'src/index.html',
    'src/main.ts',
    'src/styles.scss'
] as const;

type FileDictionary = { [path: string]: string };

/**
 * Stackblitz writer, write example files to stackblitz
 */
@Injectable({ providedIn: 'root' })
export class DocsStackblitzWriter {
    private readonly http = inject(HttpClient);
    private readonly ngZone = inject(NgZone);
    private fileCache = new Map<string, Observable<string>>();

    /**
     * Returns an HTMLFormElement that will open a new stackblitz template with the example data when
     * called with submit().
     */
    createStackBlitzForExample(exampleId: string, data: ExampleData): Promise<() => void> {
        return this.ngZone.runOutsideAngular(async () => {
            const files = await this.buildInMemoryFileDictionary(data, exampleId);
            const exampleMainFile = `src/example/${data.indexFilename}`;

            return () => {
                this.openStackBlitz({
                    files,
                    title: `Angular Components - ${data.description}`,
                    description: `${data.description}\n\nAuto-generated from: https://koobiq.io`,
                    openFile: exampleMainFile
                });
            };
        });
    }

    /**
     * The stackblitz template assets contain placeholder names for the examples:
     * "<koobiq-docs-example>" and "KoobiqDocsExample".
     * This will replace those placeholders with the names from the example metadata,
     * e.g. "<basic-button-example>" and "BasicButtonExample"
     */
    private replaceExamplePlaceholders(data: ExampleData, fileName: string, fileContent: string): string {
        if (fileName === 'src/index.html') {
            fileContent = fileContent
                .replace(/\${version}/g, `^${docsKoobiqVersion}`)
                .replace(/koobiq-docs-example/g, data.selectorName)
                .replace(/\${title}/g, data.description);
        } else if (fileName === '.stackblitzrc') {
            fileContent = fileContent.replace(/\${startCommand}/, 'npm start');
        } else if (fileName === 'src/main.ts') {
            const mainComponentName = data.componentNames[0];

            // Replace the component name in `main.ts`.
            // Replace `import {KoobiqDocsExample} from 'koobiq-docs-example'`
            // will be replaced as `import {ButtonDemo} from './button-demo'`
            fileContent = fileContent.replace(/{ KoobiqDocsExample }/g, `{${mainComponentName}}`);

            // Replace `bootstrapApplication(KoobiqDocsExample,`
            // will be replaced as `bootstrapApplication(ButtonDemo,`
            fileContent = fileContent.replace(
                /bootstrapApplication\(KoobiqDocsExample,/g,
                `bootstrapApplication(${mainComponentName},`
            );

            const dotIndex = data.indexFilename.lastIndexOf('.');
            const importFileName = data.indexFilename.slice(0, dotIndex === -1 ? undefined : dotIndex);

            fileContent = fileContent.replace(/koobiq-docs-example/g, importFileName);
        }

        return fileContent;
    }

    private appendCopyright(filename: string, content: string): string {
        if (filename.indexOf('.ts') > -1 || filename.indexOf('.css') > -1) {
            content = `${content}\n\n/**  ${COPYRIGHT} */`;
        } else if (filename.indexOf('.html') > -1) {
            content = `${content}\n\n<!-- ${COPYRIGHT} -->`;
        }

        return content;
    }

    private async buildInMemoryFileDictionary(data: ExampleData, exampleId: string): Promise<FileDictionary> {
        const result: FileDictionary = {};
        const tasks: Promise<unknown>[] = [];
        const liveExample = EXAMPLE_COMPONENTS[exampleId];
        const exampleBaseContentPath = `${DOCS_CONTENT_PATH}/${liveExample.importPath}/${exampleId}/`;

        for (const relativeFilePath of DOCS_TEMPLATE_FILES) {
            tasks.push(
                this.loadFile(TEMPLATE_PATH + relativeFilePath)
                    // Replace example placeholders in the template files.
                    .then((content) => this.replaceExamplePlaceholders(data, relativeFilePath, content))
                    .then((content) => (result[relativeFilePath] = content))
            );
        }

        for (const relativeFilePath of data.exampleFiles) {
            // Note: Since we join with paths from the example data, we normalize
            // the final target path. This is necessary because StackBlitz does
            // not and paths like `./bla.ts` would result in a directory called `.`.
            const targetPath = docsNormalizePath(`src/example/${relativeFilePath}`);

            tasks.push(
                this.loadFile(`${exampleBaseContentPath}${relativeFilePath}`)
                    // Insert a copyright footer for all example files inserted into the project.
                    .then((content) => this.appendCopyright(relativeFilePath, content))
                    .then((content) => (result[targetPath] = content))
            );
        }

        // Wait for the file dictionary to be populated. All file requests are
        // triggered concurrently to speed up the example StackBlitz generation.
        await Promise.all(tasks);

        // Resolve which optional import patterns are used in example .ts files.
        const matchedPatterns = this.resolveMatchedImportPatterns(result);

        // Generate package.json with only the deps this example needs.
        result['package.json'] = this.buildPackageJson(matchedPatterns);

        // Patch angular.json with optional styles for matched patterns.
        this.patchAngularJsonStyles(result, matchedPatterns);

        return result;
    }

    private resolveMatchedImportPatterns(files: FileDictionary): string[] {
        const tsContents = Object.entries(files)
            .filter(([path]) => path.endsWith('.ts'))
            .map(([, content]) => content);

        return Object.keys(OPTIONAL_PACKAGE_JSON_DEPENDENCIES).filter((pattern) =>
            tsContents.some((content) => content.includes(pattern))
        );
    }

    private buildPackageJson(matchedPatterns: string[]): string {
        const ngVersion = `^${VERSION.full}`;
        const koobiqVersion = `^${docsKoobiqVersion}`;

        const dependencies: Record<string, string> = {
            '@angular/animations': ngVersion,
            '@angular/cdk': ngVersion,
            '@angular/common': ngVersion,
            '@angular/compiler': ngVersion,
            '@angular/core': ngVersion,
            '@angular/forms': ngVersion,
            '@angular/platform-browser': ngVersion,
            '@angular/platform-browser-dynamic': ngVersion,
            '@angular/router': ngVersion,
            '@koobiq/angular-luxon-adapter': koobiqVersion,
            '@koobiq/cdk': koobiqVersion,
            '@koobiq/components': koobiqVersion,
            '@koobiq/date-formatter': '^3.4.0',
            '@koobiq/icons': '^11.2.0',
            luxon: '^3.7.2',
            overlayscrollbars: '2.7.3',
            rxjs: '^7.8.2',
            tslib: '^2.8.1',
            'zone.js': '~0.15.0'
        };

        for (const pattern of matchedPatterns) {
            Object.assign(dependencies, OPTIONAL_PACKAGE_JSON_DEPENDENCIES[pattern]);
        }

        return JSON.stringify(
            {
                name: 'koobiq-example',
                version: '0.0.0',
                homepage: 'https://github.com/koobiq/angular-components',
                private: true,
                license: 'MIT',
                scripts: {
                    ng: 'ng',
                    start: 'ng serve',
                    build: 'ng build',
                    watch: 'ng build --watch --configuration development'
                },
                dependencies,
                devDependencies: {
                    '@angular-devkit/build-angular': ngVersion,
                    '@angular/cli': ngVersion,
                    '@angular/compiler-cli': ngVersion,
                    '@types/luxon': '^3.7.1',
                    '@types/node': '^18.19.0',
                    typescript: '5.8.3'
                }
            },
            null,
            4
        );
    }

    private patchAngularJsonStyles(files: FileDictionary, matchedPatterns: string[]): void {
        const extraStyles: string[] = [];

        for (const pattern of matchedPatterns) {
            const styles = OPTIONAL_ANGULAR_JSON_STYLES[pattern];

            if (styles) {
                extraStyles.push(...styles);
            }
        }

        if (extraStyles.length === 0) {
            return;
        }

        const angularJson = JSON.parse(files['angular.json']);
        const styles: string[] = angularJson.projects['koobiq-docs'].architect.build.options.styles;

        styles.push(...extraStyles);
        files['angular.json'] = JSON.stringify(angularJson, null, 4);
    }

    private openStackBlitz({
        title,
        description,
        openFile,
        files
    }: {
        title: string;
        description: string;
        openFile: string;
        files: FileDictionary;
    }): void {
        StackBlitzSDK.openProject({ title, files, description, template: PROJECT_TEMPLATE }, { openFile });
    }

    private loadFile(fileUrl: string): Promise<string> {
        let stream = this.fileCache.get(fileUrl);

        if (!stream) {
            stream = this.http.get(fileUrl, { responseType: 'text' }).pipe(shareReplay(1));
            this.fileCache.set(fileUrl, stream);
        }

        return firstValueFrom(stream);
    }
}

import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone, VERSION } from '@angular/core';
import { EXAMPLE_COMPONENTS, ExampleData } from '@koobiq/docs-examples';
import { default as StackBlitzSDK } from '@stackblitz/sdk';
import { Observable, firstValueFrom } from 'rxjs';
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

export const DOCS_TEMPLATE_FILES = [
    '.editorconfig',
    '.gitignore',
    '.stackblitzrc',
    'angular.json',
    'package.json',
    'tsconfig.app.json',
    'tsconfig.json',
    'src/index.html',
    'src/main.ts',
    'src/styles.scss'
];

type FileDictionary = { [path: string]: string };

/**
 * Stackblitz writer, write example files to stackblitz
 */
@Injectable({ providedIn: 'root' })
export class DocsStackblitzWriter {
    private fileCache = new Map<string, Observable<string>>();

    constructor(
        private http: HttpClient,
        private ngZone: NgZone
    ) {}

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
        if (fileName === 'src/index.html' || fileName === 'package.json') {
            fileContent = fileContent.replace(/\${version}/g, `^${docsKoobiqVersion}`);
        }

        if (fileName === 'package.json') {
            fileContent = fileContent.replace(/\${ngVersion}/g, `^${VERSION.full}`);
        }

        if (fileName === 'src/index.html') {
            // Replace the component selector in `index,html`.
            // For example, <koobiq-docs-example></koobiq-docs-example> will be replaced as
            // <button-demo></button-demo>
            fileContent = fileContent
                .replace(/koobiq-docs-example/g, data.selectorName)
                .replace(/{{title}}/g, data.description)
                .replace(/{{version}}/g, docsKoobiqVersion);
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

        return result;
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

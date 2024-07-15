/* tslint:disable:no-console */
import { HttpClient } from '@angular/common/http';
import {
    Component,
    ElementRef,
    Input,
    NgModuleFactory,
    Type,
    ViewEncapsulation,
    ɵNgModuleFactory,
} from '@angular/core';
import { KbqCodeFile } from '@koobiq/components/code-block';
import { EXAMPLE_COMPONENTS, LiveExample } from '@koobiq/docs-examples';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

/** Preferred order for files of an example displayed in the viewer. */
const preferredExampleFileOrder = ['HTML', 'TS', 'CSS'];

interface ExampleFileData {
    filename: string;
    content: string;
    language: string;
}

@Component({
    selector: 'docs-live-example-viewer',
    templateUrl: './docs-live-example-viewer.html',
    styleUrls: ['./docs-live-example-viewer.scss'],
    host: {
        class: 'docs-live-example-viewer kbq-markdown',
    },
    encapsulation: ViewEncapsulation.None,
})
export class DocsLiveExampleViewer {
    isSourceShown: boolean = false;

    files: KbqCodeFile[] = [];

    @Input() fileOrder = ['HTML', 'TS', 'CSS'];

    /** Data for the currently selected example. */
    exampleData: LiveExample;

    /** Component type for the current example. */
    exampleComponentType: Type<any> | null = null;

    /** Module factory that declares the example component. */
    exampleModuleFactory: NgModuleFactory<any> | null = null;

    scrollIntoViewDelay = 300;

    get exampleId() {
        return this.exampleData?.selector.replace('-example', '');
    }

    /** String key of the currently displayed example. */
    @Input()
    get example() {
        return this._example;
    }

    set example(exampleName: string | null) {
        if (exampleName && exampleName !== this._example && EXAMPLE_COMPONENTS[exampleName]) {
            this._example = exampleName;
            this.exampleData = EXAMPLE_COMPONENTS[exampleName];
            this.loadExampleComponent().catch((error) =>
                console.error(`Could not load example '${exampleName}': ${error}`),
            );
            this.generateExampleTabs();
        } else {
            console.error(`Could not find example: ${exampleName}`);
        }
    }

    private _example: string | null;

    constructor(
        private readonly elementRef: ElementRef<HTMLElement>,
        private http: HttpClient,
    ) {}

    toggleSourceView() {
        this.isSourceShown = !this.isSourceShown;
    }

    /**
     * Initiates the fetching of all files listed in exampleData.files, processes them,
     * and then orders them by specified languages before pushing to the 'files' array.
     * Utilizes RxJS forkJoin to handle parallel HTTP requests.
     */
    private generateExampleTabs() {
        if (!this.exampleData) {
            return;
        }

        const docsContentPath = `docs-content/examples-source/${this.exampleData.packagePath}`;

        const observables = this.exampleData.files.map((fileName) => {
            const importPath = `${docsContentPath}/${fileName}`;
            return this.fetchCode(importPath).pipe(
                map((content) => ({
                    filename: this.determineLanguage(fileName),
                    content: content,
                    language: this.determineLanguage(fileName),
                })),
            );
        });

        forkJoin(observables).subscribe({
            next: (results: ExampleFileData[]) => {
                // Sorts the files according to the predefined preferredExampleFileOrder by language
                results.sort(
                    (a, b) =>
                        preferredExampleFileOrder.indexOf(a.language) - preferredExampleFileOrder.indexOf(b.language),
                );
                this.files.push(...results);
            },
            error: (error) => {
                console.error('Error fetching the files', error);
            },
        });
    }

    /**
     * Determines the programming language from the file extension.
     * @param fileName The name of the file, including its extension.
     * @returns The uppercase string representing the programming language.
     */
    private determineLanguage(fileName: string): string {
        const extension = fileName.split('.').pop();
        switch (extension) {
            case 'ts':
                return 'TS';
            case 'html':
                return 'HTML';
            case 'css':
                return 'CSS';
            default:
                return 'Unknown';
        }
    }

    /**
     * Fetches file content from a specified path using an HTTP GET request.
     * @param importPath The path from which to fetch the file content.
     * @returns Observable emitting the text content of the file.
     */
    private fetchCode(importPath: string): Observable<string> {
        return this.http.get(importPath, { responseType: 'text' });
    }

    private async loadExampleComponent() {
        if (this._example != null) {
            const { componentName, module } = EXAMPLE_COMPONENTS[this._example];
            // Lazily loads the example package that contains the requested example. Webpack needs to be
            // able to statically determine possible imports for proper chunk generation. Explicitly
            // specifying the path to the `fesm2015` folder as first segment instructs Webpack to generate
            // chunks for each example flat esm2015 bundle. To avoid generating unnecessary chunks for
            // source maps (which would never be loaded), we instruct Webpack to exclude source map
            // files. More details: https://webpack.js.org/api/module-methods/#magic-comments.
            // module.importSpecifier
            // @ts-ignore
            const moduleExports: any = await import(
                /* webpackExclude: /\.map$/ */
                `@koobiq/docs-examples/fesm2022/${module.importPath}`
            );
            this.exampleComponentType = moduleExports[componentName];
            // The components examples package is built with Ivy. This means that no factory files are
            // generated. To retrieve the factory of the AOT compiled module, we simply pass the module
            // class symbol to Ivy's module factory constructor. There is no equivalent for View Engine,
            // where factories are stored in separate files. Hence the API is currently Ivy-only.
            this.exampleModuleFactory = new ɵNgModuleFactory(moduleExports[module.name]);

            // Since the data is loaded asynchronously, we can't count on the native behavior
            // that scrolls the element into view automatically. We do it ourselves while giving
            // the page some time to render.
            // tslint:disable-next-line:no-typeof-undefined
            if (typeof location !== 'undefined' && location.hash.slice(1) === this._example) {
                setTimeout(() => this.elementRef.nativeElement.scrollIntoView(), this.scrollIntoViewDelay);
            }
        }
    }
}

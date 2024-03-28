/* tslint:disable:no-console */
import { HttpClient } from '@angular/common/http';
import {
    Component,
    ElementRef,
    Input,
    NgModuleFactory,
    Type,
    ViewEncapsulation,
    ɵNgModuleFactory
} from '@angular/core';
import { EXAMPLE_COMPONENTS, LiveExample } from '@koobiq/docs-examples';
import { shareReplay } from 'rxjs/operators';
import { KbqCodeFile } from '../../../../../components/code-block';


@Component({
    selector: 'docs-live-example-viewer',
    templateUrl: './docs-live-example-viewer.html',
    styleUrls: ['./docs-live-example-viewer.scss'],
    host: {
        class: 'docs-live-example-viewer kbq-markdown'
    },
    encapsulation: ViewEncapsulation.None
})
export class DocsLiveExampleViewer {
    isSourceShown: boolean = false;

    files: KbqCodeFile[] = [];

    fileExtensionRegex = /(.*)\.(\w+)/;

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
            this.loadExampleComponent()
                .catch((error) => console.error(`Could not load example '${exampleName}': ${error}`));
            this.generateExampleTabs();
        } else {
            console.error(`Could not find example: ${exampleName}`);
        }
    }

    private _example: string | null;

    constructor(
        private readonly elementRef: ElementRef<HTMLElement>,
        private http: HttpClient
    ) {}

    toggleSourceView() {
        this.isSourceShown = !this.isSourceShown;
    }

    getExampleTabNames() {
        // return new Set([...this.fileOrder, ...Object.keys(this.exampleTabs)]);
    }

    private generateExampleTabs() {
        if (!this.exampleData) { return; }

        const docsContentPath = `docs-content/examples-source/${this.exampleData.packagePath}`;

        for (const fileName of this.exampleData.files) {
            const importPath = `${docsContentPath}/${fileName}`;

            if (fileName === `${this.exampleData.selector}.ts`) {
                this.fetchCode(importPath, 'TS', 'ts');
            } else if (fileName === `${this.exampleData.selector}.css`) {
                this.fetchCode(importPath, 'CSS', 'css');
            } else if (fileName === `${this.exampleData.selector}.html`) {
                this.fetchCode(importPath, 'HTML', 'html');
            } else {
                console.error(`Unknown file: ${importPath}`);
            }
        }
    }

    private fetchCode(importPath: string, filename: string, language: string) {
        this.http
            .get(importPath, { responseType: 'text' })
            .pipe(shareReplay(1))
            .subscribe((content) => this.files.push({ filename, content, language }));
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
            `@koobiq/docs-examples/fesm2022/${module.importPath}`);
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

/* tslint:disable:no-console */
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


@Component({
    selector: 'example-viewer',
    templateUrl: './example-viewer.html',
    styleUrls: ['./example-viewer.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ExampleViewer {
    /** Data for the currently selected example. */
    exampleData: LiveExample;

    /** Component type for the current example. */
    exampleComponentType: Type<any> | null = null;

    /** Module factory that declares the example component. */
    exampleModuleFactory: NgModuleFactory<any> | null = null;

    scrollIntoViewDelay = 300;

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
        } else {
            console.error(`Could not find example: ${exampleName}`);
        }
    }

    private _example: string | null;

    constructor(
        private readonly elementRef: ElementRef<HTMLElement>
    ) {}

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

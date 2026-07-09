/* eslint-disable @typescript-eslint/naming-convention */
/**
 * Test stub for `@koobiq/docs-examples`. The real entry re-exports the ~7.5k-line auto-generated
 * `example-module.ts` (plus `import('@koobiq/docs-examples/components/*')` thunks), which the shared
 * Jest/ts-jest config cannot resolve. Docs specs only need the package's public *shape* to compile
 * and render component chrome (i18n strings) — never the example payloads — so this provides just
 * the four symbols the docs app imports. Wired in via root `tsconfig.json` paths for specs only;
 * the real app build (`tsconfig.app.json`) keeps pointing at the real package.
 */

export interface LiveExample {
    title: string;
    componentName: string;
    selector: string;
    primaryFile: string;
    files: string[];
    packagePath: string;
    additionalComponents: string[];
    importPath: string;
}

export const EXAMPLE_COMPONENTS: { [id: string]: LiveExample } = {};

export function loadExample(_id: string): Promise<any> {
    return Promise.resolve(undefined);
}

export class ExampleData {
    description!: string;
    exampleFiles!: string[];
    selectorName!: string;
    indexFilename!: string;
    componentNames!: string[];

    constructor(_example: string) {}
}

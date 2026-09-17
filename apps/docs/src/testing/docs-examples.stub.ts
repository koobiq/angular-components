/* eslint-disable @typescript-eslint/naming-convention */
/**
 * Test stub for `@koobiq/docs-examples`. The real entry re-exports the ~7.5k-line auto-generated
 * `example-module.ts`, which the shared Jest/ts-jest config cannot resolve. Docs specs only need the package's public *shape* to compile
 * and render component chrome (i18n strings) — never the example payloads — so this provides just
 * the symbols the docs app imports. Wired in via root `tsconfig.json` paths for specs only;
 * the real app build (`tsconfig.app.json`) keeps pointing at the real package.
 */

export interface LiveExample {
    title: string;
    componentName: string;
    selector: string;
    primaryFile: string;
    files: string[];
    localImportFiles: string[];
    packagePath: string;
    importPath: string;
}

export const EXAMPLE_COMPONENTS: { [id: string]: LiveExample } = {};

export class ExampleData {
    description!: string;
    exampleFiles!: string[];
    localImportFiles!: string[];
    selectorName!: string;
    indexFilename!: string;
    componentName!: string;
    isKnown = false;

    constructor(_example: string) {}
}

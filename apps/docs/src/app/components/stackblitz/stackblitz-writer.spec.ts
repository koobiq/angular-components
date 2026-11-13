import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { VERSION } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import StackBlitzSDK, { type ProjectFiles } from '@stackblitz/sdk';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join, relative, sep } from 'path';
import { compile } from 'sass';
import { satisfies } from 'semver';
import { pathToFileURL } from 'url';
import { EXAMPLE_COMPONENTS, type ExampleData, type LiveExample } from '@koobiq/docs-examples';
import { docsKoobiqVersion } from '../../version';
import {
    DOCS_STACKBLITZ_OPTIONAL_DEPENDENCIES,
    DOCS_STACKBLITZ_OPTIONAL_STYLES,
    DOCS_TEMPLATE_FILES,
    DocsStackblitzWriter
} from './stackblitz-writer';

const EXAMPLE_ID = 'basic-button-example';
const OTHER_EXAMPLE_ID = 'button-group-example';
const EXAMPLE_PACKAGE_PATH = 'components/button/basic-button-overview';

const exampleData = {
    description: 'Basic button',
    exampleFiles: ['basic-button-example.ts'],
    localImportFiles: [],
    selectorName: 'basic-button-example',
    indexFilename: 'basic-button-example.ts',
    componentName: 'BasicButtonExample'
} as unknown as ExampleData;

/** Number of HTTP requests one project build issues: the shared template files plus the example's own. */
const EXPECTED_REQUEST_COUNT = DOCS_TEMPLATE_FILES.length + exampleData.exampleFiles.length;

const REPOSITORY_ROOT = join(__dirname, '../../../../../..');
const TEMPLATE_DIR = join(__dirname, '../../../assets/stackblitz');

/** The version the repository installs, which the examples are built and tested with. */
const installedVersion = (name: string): string =>
    JSON.parse(readFileSync(join(REPOSITORY_ROOT, 'node_modules', name, 'package.json'), 'utf8')).version;

/** A file of the StackBlitz template as the docs app serves it. */
const readTemplateFile = (path: string): string => readFileSync(join(TEMPLATE_DIR, path), 'utf8');

/** Global stylesheets of an `angular.json` of the template. */
const globalStyles = (angularJson: string): string[] =>
    JSON.parse(angularJson).projects['koobiq-docs'].architect.build.options.styles;

describe(DocsStackblitzWriter.name, () => {
    let writer: DocsStackblitzWriter;
    let httpMock: HttpTestingController;

    /** Answers every in-flight file request, optionally failing the one at `failAt`. */
    const flushPendingFiles = (failAt?: number): number => {
        const requests = httpMock.match(() => true);

        requests.forEach((request, index) => {
            const { url } = request.request;

            if (index === failAt) {
                request.flush('missing', { status: 404, statusText: 'Not Found' });
            } else if (url.startsWith('assets/stackblitz/')) {
                request.flush(readTemplateFile(url.slice('assets/stackblitz/'.length)));
            } else {
                request.flush('file content');
            }
        });

        return requests.length;
    };

    /** Builds the project of an example whose source is `exampleSource` from the real template files. */
    const buildProject = async (exampleSource = 'file content'): Promise<ProjectFiles> => {
        const openProject = vi.spyOn(StackBlitzSDK, 'openProject').mockImplementation(() => undefined);
        const project = writer.createStackBlitzForExample(EXAMPLE_ID, exampleData);

        httpMock.match(({ url }) => url.startsWith('docs-content/')).forEach((source) => source.flush(exampleSource));
        flushPendingFiles();
        (await project)();

        return openProject.mock.calls[0][0].files;
    };

    beforeEach(() => {
        EXAMPLE_COMPONENTS[EXAMPLE_ID] = { packagePath: EXAMPLE_PACKAGE_PATH } as LiveExample;

        TestBed.configureTestingModule({
            providers: [DocsStackblitzWriter, provideHttpClient(), provideHttpClientTesting()]
        });

        writer = TestBed.inject(DocsStackblitzWriter);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
        Reflect.deleteProperty(EXAMPLE_COMPONENTS, EXAMPLE_ID);
        Reflect.deleteProperty(EXAMPLE_COMPONENTS, OTHER_EXAMPLE_ID);
        vi.restoreAllMocks();
    });

    it('sends every file of the template folder', () => {
        const files = readdirSync(TEMPLATE_DIR, { recursive: true, withFileTypes: true })
            // Finder leaves its own file in a folder it has shown.
            .filter((entry) => entry.isFile() && entry.name !== '.DS_Store')
            .map((entry) => relative(TEMPLATE_DIR, join(entry.parentPath, entry.name)).split(sep).join('/'));

        expect(files.sort()).toEqual([...DOCS_TEMPLATE_FILES].sort());
    });

    it('fills in every placeholder of the template', async () => {
        const files = await buildProject();
        const leftovers = Object.entries(files)
            .filter(
                ([path, content]) =>
                    path !== 'package-lock.json' && /\$\{|KoobiqDocsExample|koobiq-docs-example/.test(content)
            )
            .map(([path]) => path);

        expect(leftovers).toEqual([]);
        expect(files['src/main.ts']).toMatch(
            /import \{\s*BasicButtonExample\s*\} from '\.\/example\/basic-button-example';/
        );
        expect(files['src/main.ts']).toContain('bootstrapApplication(BasicButtonExample,');
        expect(files['src/index.html']).toContain('<basic-button-example></basic-button-example>');
    });

    it('adds an optional dependency only to an example that imports it', async () => {
        const files = await buildProject(`import { KbqMarkdownModule } from '@koobiq/components/markdown';`);
        const { dependencies } = JSON.parse(files['package.json']);
        const optional = Object.values(DOCS_STACKBLITZ_OPTIONAL_DEPENDENCIES).flatMap((packages) =>
            Object.keys(packages)
        );

        expect(optional.filter((name) => name in dependencies)).toEqual(
            Object.keys(DOCS_STACKBLITZ_OPTIONAL_DEPENDENCIES['@koobiq/components/markdown'])
        );
        expect(globalStyles(files['angular.json'])).toEqual(globalStyles(readTemplateFile('angular.json')));
    });

    it('adds the theme of the grid to the global styles of a grid example', async () => {
        const files = await buildProject(`import { KbqAgGridThemeModule } from '@koobiq/ag-grid-angular-theme';`);

        expect(globalStyles(files['angular.json'])).toEqual([
            ...globalStyles(readTemplateFile('angular.json')),
            ...DOCS_STACKBLITZ_OPTIONAL_STYLES['@koobiq/ag-grid-angular-theme']
        ]);
    });

    it('takes every global stylesheet from a file that exists', () => {
        const missing = [
            ...globalStyles(readTemplateFile('angular.json')),
            ...Object.values(DOCS_STACKBLITZ_OPTIONAL_STYLES).flat()
        ]
            // This repository builds the library instead of installing it.
            .filter((path) => !path.startsWith('node_modules/@koobiq/components/'))
            .filter(
                (path) => !existsSync(join(path.startsWith('node_modules/') ? REPOSITORY_ROOT : TEMPLATE_DIR, path))
            );

        expect(missing).toEqual([]);
    });

    it('compiles the global styles of the template with the Sass modules of the library', () => {
        const { css } = compile(join(TEMPLATE_DIR, 'src/styles.scss'), {
            importers: [
                {
                    findFileUrl: (url) =>
                        url.startsWith('@koobiq/components/')
                            ? pathToFileURL(
                                  join(REPOSITORY_ROOT, 'packages/components', url.slice('@koobiq/components/'.length))
                              )
                            : null
                }
            ]
        });

        expect(css).toContain('.layout-row');
    });

    it('pins every dependency to a range that accepts the version the repository installs', async () => {
        const files = await buildProject();
        const { dependencies, devDependencies } = JSON.parse(files['package.json']);
        // The basic example imports none of the optional dependencies, so they are added by hand.
        const ranges: Record<string, string> = Object.assign(
            {},
            dependencies,
            devDependencies,
            ...Object.values(DOCS_STACKBLITZ_OPTIONAL_DEPENDENCIES)
        );
        const behind = Object.entries(ranges)
            // The packages of this repository follow the docs build and are not installed from npm.
            .filter(([, range]) => range !== `^${docsKoobiqVersion}`)
            .map(([name, range]) => ({ name, range, installed: installedVersion(name) }))
            .filter(({ range, installed }) => !satisfies(installed, range));

        expect(behind).toEqual([]);
    });

    it('locks every dependency of the template; run docs:update-stackblitz-lock to update', () => {
        const template = JSON.parse(readTemplateFile('package.json').replace(/\${ngVersion}/g, `^${VERSION.major}`));
        const lock = JSON.parse(readTemplateFile('package-lock.json'));
        const ranges = Object.fromEntries(
            Object.entries<string>({ ...template.dependencies, ...template.devDependencies })
                // The release regenerates the lock before it publishes the Koobiq packages, so npm resolves them.
                .filter(([, range]) => range !== '${version}')
        );
        const { dependencies, devDependencies } = lock.packages[''];
        const unlocked = Object.entries(ranges)
            .filter(([name, range]) => !satisfies(lock.packages[`node_modules/${name}`]?.version ?? '0.0.0', range))
            .map(([name]) => name);

        expect(Object.keys({ ...dependencies, ...devDependencies }).sort()).toEqual(Object.keys(ranges).sort());
        expect(unlocked).toEqual([]);
    });

    it('locks every package to the public registry, which StackBlitz downloads it from', () => {
        const { packages } = JSON.parse(readTemplateFile('package-lock.json'));
        const unreachable = Object.entries<{ resolved?: string }>(packages)
            .filter(([, { resolved }]) => resolved && !resolved.startsWith('https://registry.npmjs.org/'))
            .map(([path]) => path);

        expect(unreachable).toEqual([]);
    });

    it('fetches the example sources from its directory, which is not always named after the id', async () => {
        const project = writer.createStackBlitzForExample(EXAMPLE_ID, exampleData);
        const sources = httpMock.match(({ url }) => url.startsWith('docs-content/'));

        expect(sources.map(({ request }) => request.url)).toEqual([
            `docs-content/examples-source/${EXAMPLE_PACKAGE_PATH}/basic-button-example.ts`
        ]);

        sources.forEach((source) => source.flush('file content'));
        flushPendingFiles();
        await expect(project).resolves.toBeInstanceOf(Function);
    });

    it('builds the project once and serves repeated calls from the cache', async () => {
        const first = writer.createStackBlitzForExample(EXAMPLE_ID, exampleData);

        expect(flushPendingFiles()).toBe(EXPECTED_REQUEST_COUNT);
        await expect(first).resolves.toBeInstanceOf(Function);

        const second = writer.createStackBlitzForExample(EXAMPLE_ID, exampleData);

        // Nothing new is fetched — the resolved build is reused.
        expect(flushPendingFiles()).toBe(0);
        await expect(second).resolves.toBeInstanceOf(Function);
    });

    it('fetches the template files once for the projects of all examples', async () => {
        EXAMPLE_COMPONENTS[OTHER_EXAMPLE_ID] = { packagePath: EXAMPLE_PACKAGE_PATH } as LiveExample;

        const first = writer.createStackBlitzForExample(EXAMPLE_ID, exampleData);

        flushPendingFiles();
        await first;

        const other = writer.createStackBlitzForExample(OTHER_EXAMPLE_ID, exampleData);

        expect(flushPendingFiles()).toBe(exampleData.exampleFiles.length);
        await expect(other).resolves.toBeInstanceOf(Function);
    });

    it('evicts a failed build so the next call re-fetches instead of replaying the rejection', async () => {
        const failed = writer.createStackBlitzForExample(EXAMPLE_ID, exampleData);

        // The first request is a template file.
        flushPendingFiles(0);
        await expect(failed).rejects.toBeDefined();

        // Before the eviction the rejected promise stayed in the cache and the example's
        // "Open in StackBlitz" button was dead until a full page reload.
        const retried = writer.createStackBlitzForExample(EXAMPLE_ID, exampleData);

        // The template files that did load are reused: only the failed one and the example's are fetched again.
        expect(flushPendingFiles()).toBe(1 + exampleData.exampleFiles.length);
        await expect(retried).resolves.toBeInstanceOf(Function);
    });
});

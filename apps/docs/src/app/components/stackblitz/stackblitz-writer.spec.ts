import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EXAMPLE_COMPONENTS, ExampleData, LiveExample } from '@koobiq/docs-examples';
import { DOCS_TEMPLATE_FILES, DocsStackblitzWriter } from './stackblitz-writer';

const EXAMPLE_ID = 'basic-button-example';

const exampleData = {
    description: 'Basic button',
    exampleFiles: ['basic-button-example.ts'],
    localImportFiles: [],
    selectorName: 'basic-button-example',
    indexFilename: 'basic-button-example.ts',
    componentNames: ['BasicButtonExample']
} as unknown as ExampleData;

/** Number of HTTP requests one project build issues: the shared template files plus the example's own. */
const EXPECTED_REQUEST_COUNT = DOCS_TEMPLATE_FILES.length + exampleData.exampleFiles.length;

describe(DocsStackblitzWriter.name, () => {
    let writer: DocsStackblitzWriter;
    let httpMock: HttpTestingController;

    /** Answers every in-flight file request, optionally failing the one at `failAt`. */
    const flushPendingFiles = (failAt?: number): number => {
        const requests = httpMock.match(() => true);

        requests.forEach((request, index) => {
            if (index === failAt) {
                request.flush('missing', { status: 404, statusText: 'Not Found' });
            } else {
                request.flush('file content');
            }
        });

        return requests.length;
    };

    beforeEach(() => {
        EXAMPLE_COMPONENTS[EXAMPLE_ID] = { importPath: 'button' } as LiveExample;

        TestBed.configureTestingModule({
            providers: [DocsStackblitzWriter, provideHttpClient(), provideHttpClientTesting()]
        });

        writer = TestBed.inject(DocsStackblitzWriter);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
        delete EXAMPLE_COMPONENTS[EXAMPLE_ID];
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

    it('evicts a failed build so the next call re-fetches instead of replaying the rejection', async () => {
        const failed = writer.createStackBlitzForExample(EXAMPLE_ID, exampleData);

        flushPendingFiles(0);
        await expect(failed).rejects.toBeDefined();

        // Before the eviction the rejected promise stayed in the cache and the example's
        // "Open in StackBlitz" button was dead until a full page reload.
        const retried = writer.createStackBlitzForExample(EXAMPLE_ID, exampleData);

        expect(flushPendingFiles()).toBe(EXPECTED_REQUEST_COUNT);
        await expect(retried).resolves.toBeInstanceOf(Function);
    });
});

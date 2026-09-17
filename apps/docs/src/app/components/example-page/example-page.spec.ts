import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { KbqSidepanelService } from '@koobiq/components/sidepanel';
import { EXAMPLE_COMPONENTS, LiveExample } from '@koobiq/docs-examples';
import * as docsExamplesLoader from '@koobiq/docs-examples/loader';
import { axe } from 'jest-axe';
import { DocsExamplePage } from './example-page';
import { DOCS_EXAMPLE_PAGE_ROUTES } from './example-page.routes';

const EXAMPLE_ID = 'basic-select';

@Component({
    selector: 'docs-basic-select-example',
    template: 'Basic select'
})
class BasicSelectExample {}

/** Stands in for the examples that open a sidepanel, which get its service from the docs page. */
@Component({
    selector: 'docs-sidepanel-example',
    template: ''
})
class SidepanelExample {
    readonly sidepanel = inject(KbqSidepanelService);
}

@Component({
    selector: 'docs-page-not-found',
    template: 'Page not found'
})
class PageNotFound {}

describe(DocsExamplePage.name, () => {
    let loadExampleComponent: jest.SpyInstance;

    const url = (): string => TestBed.inject(Router).url;

    const open = async (path: string): Promise<RouterTestingHarness> => {
        const harness = await RouterTestingHarness.create(path);

        // The class loads after the first render, asynchronously.
        await harness.fixture.whenStable();
        harness.detectChanges();

        return harness;
    };

    const frame = (harness: RouterTestingHarness): HTMLElement =>
        harness.routeNativeElement!.querySelector('.docs-live-example__example')!;

    beforeEach(() => {
        EXAMPLE_COMPONENTS[EXAMPLE_ID] = { title: 'Basic select' } as LiveExample;

        loadExampleComponent = jest
            .spyOn(docsExamplesLoader, 'loadExampleComponent')
            .mockResolvedValue(BasicSelectExample);

        TestBed.configureTestingModule({
            providers: [
                provideRouter([
                    { path: 'examples', children: DOCS_EXAMPLE_PAGE_ROUTES },
                    { path: '404', component: PageNotFound },
                    { path: '**', redirectTo: '404' }
                ])
            ]
        });
    });

    afterEach(() => {
        delete EXAMPLE_COMPONENTS[EXAMPLE_ID];
        jest.restoreAllMocks();
    });

    it('renders the example in its frame once its class has loaded', async () => {
        const harness = await open(`/examples/${EXAMPLE_ID}`);

        expect(loadExampleComponent).toHaveBeenCalledWith(EXAMPLE_ID);
        expect(frame(harness).classList).toContain(`docs-live-example__example_${EXAMPLE_ID}`);
        expect(frame(harness).querySelector('docs-basic-select-example')?.textContent).toBe('Basic select');
        expect(frame(harness).hasAttribute('aria-busy')).toBe(false);
    });

    it('titles the page after the example', async () => {
        const harness = await open(`/examples/${EXAMPLE_ID}`);

        expect(harness.routeDebugElement!.injector.get(ActivatedRoute).snapshot.title).toBe('Basic select');
    });

    it('provides the sidepanel service, as the docs page does', async () => {
        loadExampleComponent.mockResolvedValue(SidepanelExample);

        const harness = await open(`/examples/${EXAMPLE_ID}`);
        const example = harness.routeDebugElement!.query(By.css('docs-sidepanel-example'));

        expect(example.componentInstance.sidepanel).toBeInstanceOf(KbqSidepanelService);
    });

    // The breadcrumbs examples link to paths relative to the page they are on.
    it('stays on the page for a path below the example', async () => {
        const harness = await open(`/examples/${EXAMPLE_ID}`);
        const page = harness.routeDebugElement!.componentInstance;

        await harness.navigateByUrl(`/examples/${EXAMPLE_ID}/dashboards`);

        expect(url()).toBe(`/examples/${EXAMPLE_ID}/dashboards`);
        expect(harness.routeDebugElement!.componentInstance).toBe(page);
        expect(loadExampleComponent).toHaveBeenCalledTimes(1);
    });

    // A matrix parameter named after the id must not replace the id the route has checked.
    it('takes the id from the path, whatever the matrix parameters say', async () => {
        const harness = await open(`/examples/${EXAMPLE_ID};id=unknown`);

        expect(loadExampleComponent).toHaveBeenCalledWith(EXAMPLE_ID);
        expect(frame(harness).classList).toContain(`docs-live-example__example_${EXAMPLE_ID}`);
    });

    it.each([
        ['an unknown id', '/examples/unknown'],
        ['a key the catalogue inherits', '/examples/constructor']
    ])('sends %s to the 404 page', async (_name, path) => {
        await open(path);

        expect(url()).toBe('/404');
        expect(loadExampleComponent).not.toHaveBeenCalled();
    });

    it('stops waiting for an example that fails to load', async () => {
        loadExampleComponent.mockRejectedValue(new Error('ChunkLoadError'));

        const error = jest.spyOn(console, 'error').mockImplementation(() => {});
        const harness = await open(`/examples/${EXAMPLE_ID}`);

        expect(error).toHaveBeenCalledWith(expect.stringContaining(`Could not load example '${EXAMPLE_ID}'`));
        expect(frame(harness).hasAttribute('aria-busy')).toBe(false);
        expect(frame(harness).children).toHaveLength(0);
    });

    it('has no axe violations', async () => {
        const harness = await open(`/examples/${EXAMPLE_ID}`);

        expect(await axe(harness.routeNativeElement!)).toHaveNoViolations();
    });
});

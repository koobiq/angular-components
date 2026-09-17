import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { KbqSidepanelService } from '@koobiq/components/sidepanel';
import * as docsExamples from '@koobiq/docs-examples';
import { EXAMPLE_COMPONENTS, LiveExample } from '@koobiq/docs-examples';
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
    let loadExample: jest.SpyInstance;

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
        EXAMPLE_COMPONENTS[EXAMPLE_ID] = { componentName: 'BasicSelectExample' } as LiveExample;

        loadExample = jest.spyOn(docsExamples, 'loadExample').mockResolvedValue({ BasicSelectExample });

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

        expect(loadExample).toHaveBeenCalledWith(EXAMPLE_ID);
        expect(frame(harness).classList).toContain(`docs-live-example__example_${EXAMPLE_ID}`);
        expect(frame(harness).querySelector('docs-basic-select-example')?.textContent).toBe('Basic select');
        expect(frame(harness).hasAttribute('aria-busy')).toBe(false);
    });

    it('provides the sidepanel service, as the docs page does', async () => {
        EXAMPLE_COMPONENTS[EXAMPLE_ID].componentName = 'SidepanelExample';
        loadExample.mockResolvedValue({ SidepanelExample });

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
        expect(loadExample).toHaveBeenCalledTimes(1);
    });

    it.each([
        ['an unknown id', '/examples/unknown'],
        ['a key the catalogue inherits', '/examples/constructor'],
        ['no id', '/examples']
    ])('sends %s to the 404 page', async (_name, path) => {
        await open(path);

        expect(url()).toBe('/404');
        expect(loadExample).not.toHaveBeenCalled();
    });

    it('stops waiting for an example that fails to load', async () => {
        loadExample.mockResolvedValue({});

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

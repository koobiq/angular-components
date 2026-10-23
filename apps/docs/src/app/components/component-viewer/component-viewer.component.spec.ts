import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideClientHydration, withIncrementalHydration } from '@angular/platform-browser';
import {
    ActivatedRoute,
    convertToParamMap,
    ParamMap,
    Params,
    provideRouter,
    Router,
    UrlSegment
} from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { BehaviorSubject, map, of } from 'rxjs';
import type { MockInstance } from 'vitest';
import { DocsIntersectionObserverStub } from '../../../testing/intersection-observer.stub';
import { DocsLocale } from '../../constants/locale';
import { DocsLocaleService } from '../../services/locale';
import { DOCS_API_PAGES } from '../../services/page-resolver';
import { DocsStructureCategoryId, DocsStructureItemId } from '../../structure';
import { DocsAnchorsComponent } from '../anchors/anchors.component';
import { DocsApiEntryPoint } from '../api-page/api-page.types';
import {
    DocsComponentApiPageComponent,
    DocsComponentPageComponent,
    DocsComponentViewerComponent
} from './component-viewer.component';

const segments = (...paths: string[]): UrlSegment[] => paths.map((path) => new UrlSegment(path, {}));

const provideDocsLocale = (locale: DocsLocale) => {
    const changes = new BehaviorSubject<DocsLocale>(locale);

    return {
        provide: DocsLocaleService,
        useValue: {
            get locale() {
                return changes.value;
            },
            changes: changes.asObservable(),
            isRuLocale: changes.pipe(map((value) => value === DocsLocale.Ru))
        }
    };
};

describe(DocsComponentViewerComponent.name, () => {
    let url: BehaviorSubject<UrlSegment[]>;
    let navigate: MockInstance;

    /**
     * Creates the viewer without rendering: the bogus-id case redirects away before the template is
     * ever shown, and the route subscription under test runs in the constructor.
     */
    const createComponent = (...paths: string[]): ComponentFixture<DocsComponentViewerComponent> => {
        url = new BehaviorSubject<UrlSegment[]>(segments(...paths));

        TestBed.configureTestingModule({
            imports: [DocsComponentViewerComponent],
            providers: [
                provideRouter([]),
                provideDocsLocale(DocsLocale.En),
                { provide: ActivatedRoute, useValue: { url: url.asObservable() } }
            ]
        });

        navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

        return TestBed.createComponent(DocsComponentViewerComponent);
    };

    it('redirects to /404 without throwing when the component id is unknown', () => {
        expect(() => createComponent(DocsStructureCategoryId.Components, 'definitely-not-a-component')).not.toThrow();

        expect(navigate).toHaveBeenCalledWith(['/404']);
    });

    it('renders without throwing while the redirect is still pending', () => {
        const fixture = createComponent(DocsStructureCategoryId.Components, 'definitely-not-a-component');

        // `navigate` is async, so the template gets at least one pass with nothing resolved. It used
        // to dereference the item regardless, and Angular's `ErrorHandler` swallowed the TypeError
        // into `console.error` instead of surfacing it here.
        expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('does not redirect for a known component id', () => {
        const fixture = createComponent(DocsStructureCategoryId.Components, DocsStructureItemId.Alert);

        expect(navigate).not.toHaveBeenCalled();
        expect(fixture.componentInstance).toBeTruthy();
    });

    it('redirects again when a later emission resolves to an unknown id', () => {
        createComponent(DocsStructureCategoryId.Components, DocsStructureItemId.Alert);

        expect(navigate).not.toHaveBeenCalled();

        expect(() => url.next(segments(DocsStructureCategoryId.Components, 'gone'))).not.toThrow();

        expect(navigate).toHaveBeenCalledWith(['/404']);
    });
});

// The router waits for the page of a tab, so it starts loading while the pointer or the focus is on the link.
describe('prefetching the page of a tab', () => {
    it.each(['mouseenter', 'focus'])('loads the API of the item on %s of its tab', (type) => {
        const load = vi.fn(() => new Promise<never>(() => undefined));

        TestBed.configureTestingModule({
            imports: [DocsComponentViewerComponent],
            providers: [
                provideRouter([]),
                provideDocsLocale(DocsLocale.En),
                {
                    provide: ActivatedRoute,
                    useValue: { url: of(segments(DocsStructureCategoryId.Components, DocsStructureItemId.Alert)) }
                },
                { provide: DOCS_API_PAGES, useValue: { [DocsStructureItemId.Alert]: load } }
            ]
        });

        const fixture = TestBed.createComponent(DocsComponentViewerComponent);

        fixture.detectChanges();

        const tabs: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('[kbqTabLink]'));

        tabs.find((tab) => tab.textContent?.trim() === 'API')!.dispatchEvent(new Event(type));

        expect(load).toHaveBeenCalledTimes(1);
    });
});

/** Stands in for a page compiled from MDX. */
@Component({
    selector: 'docs-compiled-page',
    template: '<h3 class="docs-header-link kbq-markdown__h3" id="size">Size</h3>',
    changeDetection: ChangeDetectionStrategy.OnPush
})
class DocsCompiledPage {}

describe(DocsComponentPageComponent.name, () => {
    let setScrollPosition: MockInstance;

    /** The tab reads the compiled page from `data`; the anchors it renders read `fragment`. */
    const createPage = (): ComponentFixture<DocsComponentPageComponent> => {
        TestBed.configureTestingModule({
            imports: [DocsComponentPageComponent],
            providers: [
                provideRouter([]),
                provideDocsLocale(DocsLocale.En),
                { provide: ActivatedRoute, useValue: { fragment: of(null), data: of({ page: DocsCompiledPage }) } }
            ]
        });

        const fixture = TestBed.createComponent(DocsComponentPageComponent);

        fixture.detectChanges();

        return fixture;
    };

    beforeEach(() => {
        setScrollPosition = vi.spyOn(DocsAnchorsComponent.prototype, 'setScrollPosition').mockImplementation(() => {});
    });

    afterEach(() => setScrollPosition.mockRestore());

    // The overview and the examples tab share this layout, the improvement callout included.
    it('renders the compiled page as the article, followed by the improvement callout', () => {
        const article: HTMLElement = createPage().nativeElement.querySelector('.docs-component-viewer__article');

        expect(article.firstElementChild?.matches('docs-compiled-page')).toBe(true);
        expect(article.querySelector('.kbq-callout')).not.toBeNull();
    });

    it('scrolls the anchors into position once the page has rendered', () => {
        createPage();

        expect(setScrollPosition).toHaveBeenCalledTimes(1);
    });
});

const ALERT_API: DocsApiEntryPoint = {
    path: '@koobiq/components/alert',
    groups: [
        {
            id: 'api-components',
            title: 'Components',
            entries: [
                {
                    name: 'KbqAlert',
                    kind: 'component',
                    signature: 'class KbqAlert {}',
                    members: [
                        {
                            id: 'KbqAlert-title',
                            name: '[title]',
                            type: [{ text: 'string' }],
                            description: [{ type: 'html', html: '<p class="kbq-markdown__p">The title.</p>' }]
                        }
                    ]
                }
            ]
        }
    ]
};

describe(DocsComponentApiPageComponent.name, () => {
    let setScrollPosition: MockInstance;
    let scrollToElement: MockInstance;

    /** The tab reads the API from `data` and the member a link points at from the query; the anchors read `fragment`. */
    let queryParamMap: BehaviorSubject<ParamMap>;

    const createPage = (queryParams: Params = {}): ComponentFixture<DocsComponentApiPageComponent> => {
        queryParamMap = new BehaviorSubject(convertToParamMap(queryParams));

        TestBed.configureTestingModule({
            imports: [DocsComponentApiPageComponent],
            providers: [
                provideRouter([]),
                provideDocsLocale(DocsLocale.En),
                {
                    provide: ActivatedRoute,
                    useValue: {
                        fragment: of(null),
                        data: of({ page: ALERT_API }),
                        queryParamMap: queryParamMap.asObservable()
                    }
                },
                // As the app has it: the code blocks of the tab are `@defer` blocks with a `hydrate` trigger.
                provideClientHydration(withIncrementalHydration())
            ]
        });

        const fixture = TestBed.createComponent(DocsComponentApiPageComponent);

        fixture.detectChanges();

        return fixture;
    };

    beforeEach(() => {
        // Rendered in the browser alone, as a route of `RenderMode.Client` is: the flag the server sets for one.
        document.body.setAttribute('ngcm', '');
        vi.stubGlobal('IntersectionObserver', DocsIntersectionObserverStub);
        setScrollPosition = vi.spyOn(DocsAnchorsComponent.prototype, 'setScrollPosition').mockImplementation(() => {});
        scrollToElement = vi.spyOn(DocsAnchorsComponent.prototype, 'scrollToElement').mockImplementation(() => {});
    });

    afterEach(() => {
        document.body.removeAttribute('ngcm');
        setScrollPosition.mockRestore();
        scrollToElement.mockRestore();
        vi.unstubAllGlobals();
        DocsIntersectionObserverStub.reset();
    });

    it('renders the API as the article, followed by the improvement callout', () => {
        const article: HTMLElement = createPage().nativeElement.querySelector('.docs-component-viewer__article');

        expect(article.firstElementChild?.matches('docs-api-page')).toBe(true);
        expect(article.querySelector('#KbqAlert')).not.toBeNull();
        expect(article.querySelector('.kbq-callout')).not.toBeNull();
    });

    // The entries render with the view; their code blocks wait to come into view, and hold nothing up.
    it('scrolls the anchors into position once the entries have rendered', async () => {
        await createPage().whenStable();

        expect(setScrollPosition).toHaveBeenCalledTimes(1);
        expect(scrollToElement).not.toHaveBeenCalled();
    });

    it('scrolls to the member a link points at, and highlights it', async () => {
        const fixture = createPage({ member: 'KbqAlert-title' });

        await fixture.whenStable();

        const member: HTMLElement = fixture.nativeElement.querySelector('#KbqAlert-title');

        expect(scrollToElement).toHaveBeenCalledWith(member);
        expect(member.classList).toContain('docs-api__member_selected');
    });

    // The link of a member selects it and copies the address; the page stays where the reader is.
    it('highlights a member selected on the open page without scrolling to it', async () => {
        const fixture = createPage();

        await fixture.whenStable();

        queryParamMap.next(convertToParamMap({ member: 'KbqAlert-title' }));
        fixture.detectChanges();
        await fixture.whenStable();

        expect(fixture.nativeElement.querySelector('#KbqAlert-title').classList).toContain('docs-api__member_selected');
        expect(scrollToElement).not.toHaveBeenCalled();
    });
});

// The search crawler groups the records of a page by the `data-docsearch-lvl0` of the viewer.
describe('the group of a page in the search', () => {
    const open = async (path: string, locale = DocsLocale.En): Promise<RouterTestingHarness> => {
        TestBed.configureTestingModule({
            providers: [
                provideRouter([
                    {
                        path: ':category/:id',
                        component: DocsComponentViewerComponent,
                        children: [
                            { path: 'overview', component: DocsCompiledPage },
                            { path: 'api', component: DocsComponentApiPageComponent, data: { page: ALERT_API } }
                        ]
                    }
                ]),
                provideDocsLocale(locale),
                provideClientHydration(withIncrementalHydration())
            ]
        });

        const harness = await RouterTestingHarness.create();

        await harness.navigateByUrl(path);

        return harness;
    };

    const group = (harness: RouterTestingHarness): string | null =>
        harness.routeNativeElement!.getAttribute('data-docsearch-lvl0');

    beforeEach(() => {
        document.body.setAttribute('ngcm', '');
        // The code blocks of the API tab render as they come into view, which jsdom cannot tell.
        vi.stubGlobal('IntersectionObserver', DocsIntersectionObserverStub);
        vi.spyOn(DocsAnchorsComponent.prototype, 'setScrollPosition').mockImplementation(() => {});
    });

    afterEach(() => {
        document.body.removeAttribute('ngcm');
        vi.unstubAllGlobals();
        DocsIntersectionObserverStub.reset();
        vi.restoreAllMocks();
    });

    it.each([
        [DocsLocale.En, 'Components'],
        [DocsLocale.Ru, 'Компоненты']
    ])('is the category of the item in the language of the page (%s)', async (locale, category) => {
        expect(group(await open('/components/alert/overview', locale))).toBe(category);
    });

    it('is the API on the API tab, and the category again once the reader leaves it', async () => {
        const harness = await open('/components/alert/api');

        expect(group(harness)).toBe('API');

        await harness.navigateByUrl('/components/alert/overview');

        expect(group(harness)).toBe('Components');
    });
});

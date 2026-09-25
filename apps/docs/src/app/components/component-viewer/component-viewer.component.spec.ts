import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router, UrlSegment } from '@angular/router';
import { BehaviorSubject, map, of } from 'rxjs';
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
    let navigate: jest.SpyInstance;

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

        navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

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
        const load = jest.fn(() => new Promise<never>(() => undefined));

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
    let setScrollPosition: jest.SpyInstance;

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
        setScrollPosition = jest.spyOn(DocsAnchorsComponent.prototype, 'setScrollPosition').mockImplementation();
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
    entries: [{ name: 'KbqAlert', kind: 'component', signature: 'class KbqAlert {}' }]
};

describe(DocsComponentApiPageComponent.name, () => {
    let setScrollPosition: jest.SpyInstance;

    /** The tab reads the API from `data`; the anchors it renders read `fragment`. */
    const createPage = (): ComponentFixture<DocsComponentApiPageComponent> => {
        TestBed.configureTestingModule({
            imports: [DocsComponentApiPageComponent],
            providers: [
                provideRouter([]),
                provideDocsLocale(DocsLocale.En),
                { provide: ActivatedRoute, useValue: { fragment: of(null), data: of({ page: ALERT_API }) } }
            ]
        });

        const fixture = TestBed.createComponent(DocsComponentApiPageComponent);

        fixture.detectChanges();

        return fixture;
    };

    beforeEach(() => {
        setScrollPosition = jest.spyOn(DocsAnchorsComponent.prototype, 'setScrollPosition').mockImplementation();
    });

    afterEach(() => setScrollPosition.mockRestore());

    it('renders the API as the article, followed by the improvement callout', () => {
        const article: HTMLElement = createPage().nativeElement.querySelector('.docs-component-viewer__article');

        expect(article.firstElementChild?.matches('docs-api-page')).toBe(true);
        expect(article.querySelector('#KbqAlert')).not.toBeNull();
        expect(article.querySelector('.kbq-callout')).not.toBeNull();
    });

    // A signature is a code block, and the page is stable once highlight.js has loaded to highlight it.
    it('scrolls the anchors into position once the entries have rendered', async () => {
        await createPage().whenStable();

        expect(setScrollPosition).toHaveBeenCalledTimes(1);
    });
});

import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router, UrlSegment } from '@angular/router';
import { KbqScrollbar } from '@koobiq/components/scrollbar';
import { BehaviorSubject, map, of } from 'rxjs';
import { DocsLocale } from '../../constants/locale';
import { DocsLocaleService } from '../../services/locale';
import { DocsStructureCategoryId, DocsStructureItemId } from '../../structure';
import { DocsAnchorsComponent } from '../anchors/anchors.component';
import { DocsComponentViewerComponent, DocsOverviewComponentBase } from './component-viewer.component';

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

/**
 * Stands in for the real overview/API/examples pages: they differ only in which document they load,
 * while the anchors view query under test lives on the shared base class.
 */
@Component({
    selector: 'docs-overview-base-host',
    imports: [DocsAnchorsComponent],
    template: `
        @if (showAnchors()) {
            <docs-anchors [headerSelectors]="'.docs-header-link'" />
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class DocsOverviewBaseHostComponent extends DocsOverviewComponentBase {
    /** Whether the anchor list is rendered, mirroring a document that has (not) loaded yet. */
    readonly showAnchors = signal(false);
}

describe(DocsOverviewComponentBase.name, () => {
    let setScrollPosition: jest.SpyInstance;

    /** The base class reads `parent.url`, and the anchors it queries read `fragment`. */
    const provideOverviewRoute = () => {
        const url = of(segments(DocsStructureCategoryId.Components, DocsStructureItemId.Alert));

        return { provide: ActivatedRoute, useValue: { url, fragment: of(null), parent: { url } } };
    };

    const createHost = (
        withAnchors: boolean,
        scrollbar?: Pick<KbqScrollbar, 'update'>
    ): ComponentFixture<DocsOverviewBaseHostComponent> => {
        TestBed.configureTestingModule({
            imports: [DocsOverviewBaseHostComponent],
            providers: [
                provideRouter([]),
                provideDocsLocale(DocsLocale.En),
                provideOverviewRoute(),
                ...(scrollbar ? [{ provide: KbqScrollbar, useValue: scrollbar }] : [])
            ]
        });

        const fixture = TestBed.createComponent(DocsOverviewBaseHostComponent);

        fixture.componentInstance.showAnchors.set(withAnchors);
        fixture.detectChanges();

        return fixture;
    };

    beforeEach(() => {
        setScrollPosition = jest.spyOn(DocsAnchorsComponent.prototype, 'setScrollPosition').mockImplementation();
    });

    afterEach(() => setScrollPosition.mockRestore());

    it('scrolls the rendered anchors into position', () => {
        const { componentInstance } = createHost(true);

        componentInstance.scrollToSelectedContentSection();
        componentInstance.showDocumentLostAlert();

        expect(setScrollPosition).toHaveBeenCalledTimes(2);
    });

    it('no-ops while the anchors are not rendered yet', () => {
        const { componentInstance } = createHost(false);

        // The query is deliberately optional: the anchor list belongs to the subclass template and
        // is absent until the document has loaded. Tightening it to `.required` would throw here.
        expect(() => componentInstance.scrollToSelectedContentSection()).not.toThrow();
        expect(() => componentInstance.showDocumentLostAlert()).not.toThrow();

        expect(setScrollPosition).not.toHaveBeenCalled();
    });

    it("re-measures the ancestor docs-component-viewer's KbqScrollbar once the document content settles", () => {
        const scrollbar: Pick<KbqScrollbar, 'update'> = { update: jest.fn() };
        const { componentInstance } = createHost(true, scrollbar);

        componentInstance.scrollToSelectedContentSection();
        componentInstance.showDocumentLostAlert();

        // `KbqScrollbar` only re-measures on its own outer resize, not on content-only changes (see
        // its own `update()` docs) — nothing else would tell it this routed content just changed.
        expect(scrollbar.update).toHaveBeenCalledTimes(2);
    });

    it('does not throw when there is no ancestor KbqScrollbar to update (e.g. this base class used outside docs-component-viewer)', () => {
        const { componentInstance } = createHost(true);

        expect(() => componentInstance.scrollToSelectedContentSection()).not.toThrow();
    });
});

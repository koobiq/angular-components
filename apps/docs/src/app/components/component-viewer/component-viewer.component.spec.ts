import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router, UrlSegment } from '@angular/router';
import { BehaviorSubject, map } from 'rxjs';
import { DocsLocale } from '../../constants/locale';
import { DocsLocaleService } from '../../services/locale';
import { DocsStructureCategoryId, DocsStructureItemId } from '../../structure';
import { DocsComponentViewerComponent } from './component-viewer.component';

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

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideLocationMocks } from '@angular/common/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { axe } from 'jest-axe';
import { BehaviorSubject, map, of } from 'rxjs';
import { DocsLocale } from '../../constants/locale';
import { DocsLocaleService } from '../../services/locale';
import { DocsIconsViewerComponent } from './icons-viewer.component';

/** Search input debounce the component applies before recomputing the icon list. */
const SEARCH_DEBOUNCE_TIME = 300;

const ICONS_METADATA = {
    'square-multiple-o_16': { codepoint: '61697', tags: ['copy'], description: 'Copy' },
    'north-east_24': { codepoint: '61698', tags: ['arrow'], description: 'Arrow' }
};

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

describe(DocsIconsViewerComponent.name, () => {
    let fixture: ComponentFixture<DocsIconsViewerComponent>;
    let httpMock: HttpTestingController;

    const cells = (): HTMLElement[] =>
        Array.from(fixture.nativeElement.querySelectorAll('.docs-icons-viewer__table-cell'));

    /** Renders the grid: flushes the metadata request and lets the debounced search pipeline emit. */
    const renderIcons = () => {
        httpMock.expectOne('assets/SVGIcons/kbq-icons-info.json').flush(ICONS_METADATA);
        fixture.detectChanges();
        tick(SEARCH_DEBOUNCE_TIME);
        fixture.detectChanges();
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [DocsIconsViewerComponent],
            providers: [
                provideDocsLocale(DocsLocale.En),
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRouter([]),
                provideLocationMocks(),
                { provide: ActivatedRoute, useValue: { queryParamMap: of({ params: {} }), queryParams: of({}) } }
            ]
        });

        fixture = TestBed.createComponent(DocsIconsViewerComponent);
        httpMock = TestBed.inject(HttpTestingController);
        fixture.detectChanges();
    });

    afterEach(() => httpMock.verify());

    it('has no axe violations', fakeAsync(async () => {
        renderIcons();

        expect(cells().length).toBe(Object.keys(ICONS_METADATA).length);
        expect(await axe(fixture.nativeElement)).toHaveNoViolations();
    }));

    // The cells used to be bare <div>s with a click handler: no button semantics, no Space (A11Y-02).
    it('exposes each icon cell as a labelled, focusable button', fakeAsync(() => {
        renderIcons();

        for (const cell of cells()) {
            expect(cell.getAttribute('role')).toBe('button');
            expect(cell.getAttribute('tabindex')).toBe('0');
            expect(cell.getAttribute('aria-label')).toBeTruthy();
        }
    }));

    it.each([
        ['click', () => new MouseEvent('click', { bubbles: true })],
        ['Enter', () => new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })],
        ['Space', () => new KeyboardEvent('keydown', { key: ' ', bubbles: true })]
    ])(
        'activates an icon cell on %s',
        fakeAsync((_name: string, createEvent: () => Event) => {
            const navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

            renderIcons();
            cells()[0].dispatchEvent(createEvent());

            expect(navigate).toHaveBeenCalled();
        })
    );

    // Typing is not navigation: pushing a history entry per debounced keystroke made "Back" walk the
    // query letter by letter instead of leaving the page.
    it('replaces the history entry when writing the search query to the URL', fakeAsync(() => {
        const navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

        renderIcons();
        fixture.componentInstance.searchControl.setValue('copy');
        tick(SEARCH_DEBOUNCE_TIME);

        expect(navigate).toHaveBeenCalledWith(
            [],
            expect.objectContaining({ queryParams: { s: 'copy' }, replaceUrl: true })
        );
    }));
});

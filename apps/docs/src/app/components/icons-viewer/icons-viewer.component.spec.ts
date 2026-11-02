import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideLocationMocks } from '@angular/common/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, ParamMap, provideRouter, Router } from '@angular/router';
import { KbqModalRef, KbqModalService } from '@koobiq/components/modal';
import { BehaviorSubject, map, NEVER } from 'rxjs';
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
    let queryParamMap: BehaviorSubject<ParamMap>;

    const cells = (): HTMLElement[] =>
        Array.from(fixture.nativeElement.querySelectorAll('.docs-icons-viewer__table-cell'));

    /** Renders the grid: flushes the metadata request and lets the debounced search pipeline emit. */
    const renderIcons = async () => {
        httpMock.expectOne('assets/SVGIcons/kbq-icons-info.json').flush(ICONS_METADATA);
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_TIME);
        fixture.detectChanges();
    };

    beforeEach(() => {
        vi.useFakeTimers();

        queryParamMap = new BehaviorSubject(convertToParamMap({}));

        TestBed.configureTestingModule({
            imports: [DocsIconsViewerComponent],
            providers: [
                provideDocsLocale(DocsLocale.En),
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRouter([]),
                provideLocationMocks(),
                { provide: ActivatedRoute, useValue: { queryParamMap } }
            ]
        });

        fixture = TestBed.createComponent(DocsIconsViewerComponent);
        httpMock = TestBed.inject(HttpTestingController);
        fixture.detectChanges();
    });

    afterEach(() => {
        vi.useRealTimers();
        httpMock.verify();
    });

    it('has no axe violations', async () => {
        await renderIcons();

        expect(cells().length).toBe(Object.keys(ICONS_METADATA).length);

        // axe-core schedules its checks on timers.
        vi.useRealTimers();

        await expect(fixture.nativeElement).toHaveNoViolations();
    });

    // The cells used to be bare <div>s with a click handler: no button semantics, no Space (A11Y-02).
    it('exposes each icon cell as a labelled, focusable button', async () => {
        await renderIcons();

        for (const cell of cells()) {
            expect(cell.getAttribute('role')).toBe('button');
            expect(cell.getAttribute('tabindex')).toBe('0');
            expect(cell.getAttribute('aria-label')).toBeTruthy();
        }
    });

    it.each([
        ['click', () => new MouseEvent('click', { bubbles: true })],
        ['Enter', () => new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })],
        ['Space', () => new KeyboardEvent('keydown', { key: ' ', bubbles: true })]
    ])('activates an icon cell on %s', async (_name: string, createEvent: () => Event) => {
        const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

        await renderIcons();
        cells()[0].dispatchEvent(createEvent());

        expect(navigate).toHaveBeenCalled();
    });

    // Typing is not navigation: pushing a history entry per debounced keystroke made "Back" walk the
    // query letter by letter instead of leaving the page.
    it('replaces the history entry when writing the search query to the URL', async () => {
        const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

        await renderIcons();
        fixture.componentInstance.searchControl.setValue('copy');
        await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_TIME);

        expect(navigate).toHaveBeenCalledWith(
            [],
            expect.objectContaining({ queryParams: { s: 'copy' }, replaceUrl: true })
        );
    });

    it('fills the search from the URL without writing it back', async () => {
        const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

        await renderIcons();
        queryParamMap.next(convertToParamMap({ s: 'copy' }));
        await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_TIME);

        expect(fixture.componentInstance.searchControl.value).toBe('copy');
        expect(navigate).not.toHaveBeenCalled();
    });

    it('opens the preview of the icon whose id is in the URL', async () => {
        const open = vi
            .spyOn(TestBed.inject(KbqModalService), 'open')
            .mockReturnValue({ afterClose: NEVER } as unknown as KbqModalRef);

        await renderIcons();
        queryParamMap.next(convertToParamMap({ id: 'north-east_24' }));

        expect(open).toHaveBeenCalledWith(
            expect.objectContaining({ data: { iconItem: expect.objectContaining({ id: 'north-east_24' }) } })
        );
    });
});

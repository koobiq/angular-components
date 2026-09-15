import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideLocationMocks } from '@angular/common/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { axe } from 'jest-axe';
import { BehaviorSubject, map } from 'rxjs';
import { DocsLocale } from '../../constants/locale';
import { DocsLocaleService } from '../../services/locale';
import { DocsMigrationGuide } from './docs-migration-guide';

/**
 * A miniature of what `tools/markdown-to-html/migration` produces: an upgrade-plan list and three
 * steps at three releases.
 */
const GUIDE_HTML = `
    <div id="how-to-upgrade" class="docs-header-link kbq-markdown__h2" data-docs-migration-title>
        How to upgrade from Koobiq 17
    </div>
    <section class="docs-migration-section docs-migration-framing">
        <div id="upgrade-plan" class="docs-header-link kbq-markdown__h3">Upgrade plan</div>
        <ol class="kbq-markdown__ol">
            <li data-docs-migration-step="1">to 18.6</li>
            <li data-docs-migration-step="2">to 20.2</li>
            <li data-docs-migration-step="3">to 21.0</li>
        </ol>
    </section>
    <section class="docs-migration-section docs-migration-step" data-docs-migration-step="1" data-docs-migration-version="18.6.0">
        <div id="step-one" class="docs-header-link kbq-markdown__h3">Step one</div>
    </section>
    <section class="docs-migration-section docs-migration-step" data-docs-migration-step="2" data-docs-migration-version="20.2.0">
        <div id="step-two" class="docs-header-link kbq-markdown__h3">Step two</div>
    </section>
    <section class="docs-migration-section docs-migration-step" data-docs-migration-step="3" data-docs-migration-version="21.0.0">
        <div id="step-three" class="docs-header-link kbq-markdown__h3">Step three</div>
    </section>
    <section class="docs-migration-section docs-migration-framing">
        <div id="after-the-migration" class="docs-header-link kbq-markdown__h3">After the migration</div>
    </section>
`;

const provideDocsLocale = () => {
    const changes = new BehaviorSubject<DocsLocale>(DocsLocale.Ru);

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

/** The guide's own URL: the base class reads the doc item from the parent route's segments. */
const ROUTE = '/main/migration/overview';

describe(DocsMigrationGuide.name, () => {
    let harness: RouterTestingHarness;
    let httpMock: HttpTestingController;
    let router: Router;

    const host = (): HTMLElement => harness.routeNativeElement!;

    const steps = (): HTMLElement[] => Array.from(host().querySelectorAll<HTMLElement>('.docs-migration-step'));

    const visibleStepIds = (): string[] =>
        steps()
            .filter((step) => !step.hidden)
            .map((step) => step.getAttribute('data-docs-migration-step')!);

    /** Flushes the guide document, which is what makes the component read the DOM and filter it. */
    const render = async () => {
        httpMock.expectOne('docs-content/overviews/migration.ru.html').flush(GUIDE_HTML);
        // `DocsLiveExampleComponent` only upgrades and announces the document after render.
        await harness.fixture.whenStable();
        harness.detectChanges();
    };

    const pick = async (params: Record<string, string>, fragment?: string) => {
        const query = new URLSearchParams(params).toString();

        await harness.navigateByUrl(`${ROUTE}?${query}${fragment ? `#${fragment}` : ''}`);
        harness.detectChanges();
    };

    beforeEach(async () => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRouter([
                    { path: 'main/migration', children: [{ path: 'overview', component: DocsMigrationGuide }] }
                ]),
                provideLocationMocks(),
                provideDocsLocale()
            ]
        });

        harness = await RouterTestingHarness.create();
        httpMock = TestBed.inject(HttpTestingController);
        router = TestBed.inject(Router);

        await harness.navigateByUrl(ROUTE, DocsMigrationGuide);
    });

    afterEach(() => {
        // The anchor list arms a 2s resize watch when a fragment is in play; without an explicit
        // destroy it outlives the test and keeps the Jest worker alive.
        harness.fixture.destroy();
        httpMock.verify();
    });

    it('should show every step when no range is picked', async () => {
        await render();

        expect(visibleStepIds()).toEqual(['1', '2', '3']);
    });

    // Half-open: the release you are on is behind you, the one you are going to is what you came for.
    it('should hide the steps outside the picked range', async () => {
        await render();
        await pick({ from: '20.2.0', to: '21.0.0' });

        expect(visibleStepIds()).toEqual(['3']);
    });

    it('should hide the upgrade-plan items of the steps it hid', async () => {
        await render();
        await pick({ from: '20.2.0', to: '21.0.0' });

        const visiblePlanItems = Array.from(
            host().querySelectorAll<HTMLElement>('li[data-docs-migration-step]')
        ).filter((item) => !item.hidden);

        expect(visiblePlanItems.map((item) => item.getAttribute('data-docs-migration-step'))).toEqual(['3']);
    });

    // The range has to survive a reload and a shared link, and `replaceUrl` keeps narrowing a
    // filter out of the history so "Back" leaves the page instead of walking the picks.
    it('should record the picked range in the URL', async () => {
        await render();

        const guide = harness.routeDebugElement!.componentInstance as DocsMigrationGuide;

        guide['from'].set('20.2.0');
        guide['onRangeChange']();
        await harness.fixture.whenStable();

        expect(router.url).toContain('from=20.2.0');
    });

    // An upgrade only moves forward, so a link that spells a downgrade is read as "from X onwards"
    // rather than shown as a pair the pickers themselves refuse to offer.
    it('should drop a destination that a shared link puts below the start', async () => {
        await render();
        await pick({ from: '21.0.0', to: '18.6.0' });

        const guide = harness.routeDebugElement!.componentInstance as DocsMigrationGuide;

        expect(guide['from']()).toBe('21.0.0');
        expect(guide['to']()).toBeNull();
        expect(router.url).not.toContain('to=');
    });

    // "How to upgrade from Koobiq 17" describes an upgrade nobody starting later is doing.
    it('should drop the guide title once the start is past the release it names', async () => {
        await render();

        const title = (): HTMLElement => host().querySelector('[data-docs-migration-title]')!;

        expect(title().hidden).toBe(false);

        await pick({ from: '20.2.0' });
        expect(title().hidden).toBe(true);

        // Starting at the release the title names keeps it true.
        await pick({ from: '17' });
        expect(title().hidden).toBe(false);
    });

    // A reader who followed an anchor has to land on something, whatever the range says.
    it('should keep the step the URL fragment points at', async () => {
        await render();
        await pick({ from: '20.2.0', to: '21.0.0' }, 'step-one');

        expect(visibleStepIds()).toContain('1');
    });

    // 19 gates no step of its own, so upgrading 18.6 → 19 is a real range with nothing in it.
    it('should say so when the picked range has no steps', async () => {
        await render();
        await pick({ from: '18.6.0', to: '19' });

        expect(visibleStepIds()).toEqual([]);
        expect(host().querySelector('kbq-empty-state')).toBeTruthy();
    });

    // An empty plan and "now rebuild and run your tests" under "nothing to upgrade" reads as a
    // broken page, so the framing goes with the steps — and comes back with them.
    it('should hide the upgrade plan and the closing note only while nothing is in range', async () => {
        await render();

        const framing = (): HTMLElement[] =>
            Array.from(host().querySelectorAll<HTMLElement>('.docs-migration-framing'));

        expect(framing().map((section) => section.hidden)).toEqual([false, false]);

        await pick({ from: '18.6.0', to: '19' });
        expect(framing().map((section) => section.hidden)).toEqual([true, true]);

        await pick({ from: '20.2.0', to: '21.0.0' });
        expect(framing().map((section) => section.hidden)).toEqual([false, false]);
    });

    // The gates come from the guide, so a release that rewrites a step retires the value some
    // older link still carries. Filtering on it would hide everything and explain nothing.
    it('should forget a range the picker cannot offer', async () => {
        await render();
        await pick({ from: 'v20.2.0', to: '20.4.0' });

        const guide = harness.routeDebugElement!.componentInstance as DocsMigrationGuide;

        expect(guide['from']()).toBeNull();
        expect(guide['to']()).toBeNull();
        expect(visibleStepIds()).toEqual(['1', '2', '3']);
        expect(router.url).not.toContain('from=');
    });

    // A repeated key arrives as an array, which used to reach the version parser and throw out of
    // a computed — i.e. take the page down rather than degrade.
    it('should survive a query parameter spelled twice', async () => {
        await render();
        await harness.navigateByUrl(`${ROUTE}?from=18.6.0&from=20.2.0`);
        harness.detectChanges();

        expect(visibleStepIds()).toEqual(['3']);
    });

    // Clicking the outline changes only the fragment, so the filter has to re-run for it: the step
    // being linked to has to appear, and the one pinned before has to be let go.
    it('should move the fragment pin when only the fragment changes', async () => {
        await render();
        await pick({ from: '20.2.0', to: '21.0.0' }, 'step-one');

        expect(visibleStepIds()).toEqual(['1', '3']);

        await pick({ from: '20.2.0', to: '21.0.0' }, 'step-two');
        expect(visibleStepIds()).toEqual(['2', '3']);
    });

    it('should have no accessibility violations', async () => {
        await render();

        expect(await axe(host())).toHaveNoViolations();
    });
});

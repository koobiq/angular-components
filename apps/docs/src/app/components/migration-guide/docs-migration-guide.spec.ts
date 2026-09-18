import { provideLocationMocks } from '@angular/common/testing';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRouteSnapshot, Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { KbqStateSavingService } from '@koobiq/components/core';
import { axe } from 'jest-axe';
import { BehaviorSubject, map } from 'rxjs';
import { DocsLocale } from '../../constants/locale';
import { DOCS_TRANSLATIONS } from '../../services/i18n';
import { DocsLocaleService } from '../../services/locale';
import { DocsMigrationGuide } from './docs-migration-guide';
import { DocsMigrationProgress } from './docs-migration-progress';

/**
 * A miniature of the page `tools/docs-pages/migration` lays the guide out into: an intro, an
 * upgrade-plan list and three steps at three releases.
 */
const GUIDE_TEMPLATE = `
        <section class="docs-migration-framing docs-migration-intro" data-docs-migration-release="20.3.0">
            <h2 id="how-to-upgrade" class="docs-header-link kbq-markdown__h2" data-docs-migration-title>
                How to upgrade from Koobiq 17
            </h2>
            <p>Apply the breaking changes step by step.</p>
        </section>
        <section class="docs-migration-section docs-migration-framing">
            <h3 id="upgrade-plan" class="docs-header-link kbq-markdown__h3">Upgrade plan</h3>
            <ul class="kbq-markdown__ul">
                <li data-docs-migration-step="step-one">to 18.6</li>
                <li data-docs-migration-step="step-two">to 20.2</li>
                <li data-docs-migration-step="step-three">to 21.0</li>
            </ul>
        </section>
        <section class="docs-migration-section docs-migration-step" data-docs-migration-version="18.6.0">
            <h3 id="step-one" class="docs-header-link kbq-markdown__h3">Step one</h3>
            <div data-docs-migration-done></div>
        </section>
        <section
            class="docs-migration-section docs-migration-step"
            data-docs-migration-version="20.2.0"
            data-docs-migration-components="button button-group"
        >
            <h3 id="step-two" class="docs-header-link kbq-markdown__h3">Step two</h3>
            <div data-docs-migration-done></div>
        </section>
        <section class="docs-migration-section docs-migration-step" data-docs-migration-version="21.0.0">
            <h3 id="step-three" class="docs-header-link kbq-markdown__h3">Step three</h3>
            <div data-docs-migration-done></div>
            <p>Components went through a review.</p>
            <div class="docs-migration-component" data-docs-migration-components="alert">
                <h4 id="alert" class="docs-header-link kbq-markdown__h4">Alert</h4>
            </div>
            <div class="docs-migration-component" data-docs-migration-components="select">
                <h4 id="select" class="docs-header-link kbq-markdown__h4">Select</h4>
            </div>
            <div class="docs-migration-component" data-docs-migration-components="tag tag-list">
                <h4 id="tags" class="docs-header-link kbq-markdown__h4">Tags</h4>
            </div>
        </section>
        <section class="docs-migration-section docs-migration-framing">
            <h3 id="after-the-migration" class="docs-header-link kbq-markdown__h3">After the migration</h3>
        </section>
    `;

@Component({
    selector: 'docs-guide-page',
    template: GUIDE_TEMPLATE,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
class GuidePage {}

/** The guide as a page of its own, which is what the route shows after a switch of language. */
@Component({
    selector: 'docs-other-guide-page',
    template: GUIDE_TEMPLATE,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
class OtherGuidePage {}

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

const ROUTE = '/main/migration/overview';

const DONE_KEY = 'docs-migration-done';

describe(DocsMigrationGuide.name, () => {
    let harness: RouterTestingHarness;
    let router: Router;

    const host = (): HTMLElement => harness.routeNativeElement!;

    const steps = (): HTMLElement[] => Array.from(host().querySelectorAll<HTMLElement>('.docs-migration-step'));

    const visibleReleases = (): string[] =>
        steps()
            .filter((step) => !step.hidden)
            .map((step) => step.getAttribute('data-docs-migration-version')!);

    const visiblePlanItems = (): string[] =>
        Array.from(host().querySelectorAll<HTMLElement>('li[data-docs-migration-step]'))
            .filter((item) => !item.hidden)
            .map((item) => item.getAttribute('data-docs-migration-step')!);

    /** The intro, the upgrade plan and the closing note, in document order. */
    const framingHidden = (): boolean[] =>
        Array.from(host().querySelectorAll<HTMLElement>('.docs-migration-framing')).map((section) => section.hidden);

    const emptyStateTitle = (): string | undefined =>
        host().querySelector('[kbq-empty-state-title]')?.textContent?.trim();

    /** The line above the pickers that says what they are for, or `undefined` while it is hidden. */
    const promptText = (): string | undefined => {
        const prompt = host().querySelector<HTMLElement>('.docs-migration-guide__prompt');

        return prompt && !prompt.hidden ? prompt.textContent!.trim() : undefined;
    };

    /** Settles the render that has the component read the page and filter it. */
    const render = async () => {
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
                provideRouter([
                    {
                        path: 'main/:id',
                        children: [
                            {
                                path: 'overview',
                                component: DocsMigrationGuide,
                                // Stands in for `docsPageResolver`, which resolves another page per language.
                                resolve: {
                                    page: (route: ActivatedRouteSnapshot) =>
                                        route.queryParamMap.get('page') === 'other' ? OtherGuidePage : GuidePage
                                },
                                runGuardsAndResolvers: 'paramsOrQueryParamsChange'
                            }
                        ]
                    },
                    { path: 'elsewhere', children: [] }
                ]),
                provideLocationMocks(),
                provideNoopAnimations(),
                provideDocsLocale()
            ]
        });

        harness = await RouterTestingHarness.create();
        router = TestBed.inject(Router);

        await harness.navigateByUrl(ROUTE, DocsMigrationGuide);
    });

    afterEach(() => {
        // Web storage outlives the test, and the marks are kept there.
        TestBed.inject(KbqStateSavingService).remove(DONE_KEY);
        // The done marks are attached to the application rather than to this view; destroying the
        // page is what releases them.
        harness.fixture.destroy();
    });

    // The guide as a whole answers nobody's upgrade: the page opens on the pickers alone, and a start
    // without a destination is not an upgrade yet either.
    it('should show nothing of the guide until both versions are picked', async () => {
        await render();

        expect(visibleReleases()).toEqual([]);
        expect(framingHidden()).toEqual([true, true, true]);

        const halves: Record<string, string>[] = [{ from: '17' }, { to: '21.0.0' }];

        for (const half of halves) {
            await pick(half);

            expect(visibleReleases()).toEqual([]);
            expect(framingHidden()).toEqual([true, true, true]);
            expect(host().querySelector('.docs-migration-guide__commands')).toBeNull();
        }

        await pick({ from: '17', to: '21.0.0' });

        expect(visibleReleases()).toEqual(['18.6.0', '20.2.0', '21.0.0']);
        expect(framingHidden()).toEqual([false, false, false]);
        expect(emptyStateTitle()).toBeUndefined();
    });

    // The pickers keep the line that says what they are for: taken away once a version is picked, it
    // would shift everything below it.
    it('should keep the prompt above the pickers whatever is picked', async () => {
        await render();

        expect(promptText()).toBe(DOCS_TRANSLATIONS.migrationPickPrompt.ru);

        await pick({ from: '17', to: '21.0.0' });

        expect(promptText()).toBe(DOCS_TRANSLATIONS.migrationPickPrompt.ru);
    });

    // The stylesheet keeps the prerendered guide from showing in full while the client catches up.
    it('should let go of the guide once it has been filtered', async () => {
        await render();

        expect(host().classList).toContain('docs-migration-guide_ready');
    });

    // Half-open: the release you are on is behind you, the one you are going to is what you came for.
    it('should hide the steps outside the picked range', async () => {
        await render();
        await pick({ from: '20.2.0', to: '21.0.0' });

        expect(visibleReleases()).toEqual(['21.0.0']);
    });

    it('should hide the upgrade-plan items of the steps it hid', async () => {
        await render();
        await pick({ from: '20.2.0', to: '21.0.0' });

        expect(visiblePlanItems()).toEqual(['step-three']);
    });

    describe('components', () => {
        /** By heading id. */
        const visibleSubsections = (): string[] =>
            Array.from(host().querySelectorAll<HTMLElement>('.docs-migration-component'))
                .filter((subsection) => !subsection.hidden)
                .map((subsection) => subsection.firstElementChild!.id);

        // A step naming no component concerns every project; one made of subsections concerns theirs.
        it('should hide the steps and subsections about components the reader does not use', async () => {
            await render();
            await pick({ from: '17', to: '21.0.0', components: 'select' });

            expect(visibleReleases()).toEqual(['18.6.0', '21.0.0']);
            expect(visibleSubsections()).toEqual(['select']);
            expect(visiblePlanItems()).toEqual(['step-one', 'step-three']);

            await pick({ from: '17', to: '21.0.0', components: 'button' });

            expect(visibleReleases()).toEqual(['18.6.0', '20.2.0']);
            expect(visibleSubsections()).toEqual([]);
        });

        it('should show a subsection to a reader of any component it names', async () => {
            await render();
            await pick({ from: '17', to: '21.0.0', components: 'tag-list' });

            expect(visibleReleases()).toEqual(['18.6.0', '21.0.0']);
            expect(visibleSubsections()).toEqual(['tags']);
        });

        it('should show every subsection while no component is picked', async () => {
            await render();
            await pick({ from: '17', to: '21.0.0' });

            expect(visibleSubsections()).toEqual(['alert', 'select', 'tags']);
        });

        it('should offer the components the guide tags, by their docs names, and forget one it does not', async () => {
            await render();
            await pick({ from: '17', to: '21.0.0', components: 'select,no-such-component' });

            const guide = harness.routeDebugElement!.componentInstance as DocsMigrationGuide;

            expect(guide['componentChoices']().map(({ value }) => value)).toEqual([
                'alert',
                'button',
                'button-group',
                'select',
                'tag',
                'tag-list'
            ]);
            expect(guide['components']()).toEqual(['select']);
            expect(decodeURIComponent(router.url)).toContain('components=select');
            expect(router.url).not.toContain('no-such-component');
        });

        // Following an anchor into a subsection has to land on it, whatever was picked.
        it('should keep the subsection the URL fragment points at', async () => {
            await render();
            await pick({ from: '17', to: '21.0.0', components: 'select' }, 'alert');

            expect(visibleSubsections()).toEqual(['alert', 'select']);
        });
    });

    // Most readers are on the latest release, whether or not a step lands in it; the one above it
    // is what the guide prepares for, and has to say so wherever it is offered.
    it('should offer the latest release and mark the unreleased one in both pickers', async () => {
        await render();

        /** Opens a picker, reads its options and closes it again. */
        const options = async (picker: number): Promise<string[]> => {
            const toggle = async () => {
                host().querySelectorAll<HTMLElement>('.docs-migration-guide__range-row kbq-select')[picker].click();
                harness.detectChanges();
                await harness.fixture.whenStable();
            };

            await toggle();

            const labels = Array.from(document.querySelectorAll('.cdk-overlay-container kbq-option')).map((option) =>
                option.textContent!.replace(/\s+/g, ' ').trim()
            );

            await toggle();

            return labels;
        };

        const unreleased = `21.0.0 ${DOCS_TRANSLATIONS.migrationUnreleased.ru}`;

        expect(await options(0)).toEqual(['17.x', '18.6.0', '19.x', '20.2.0', '20.3.0', unreleased]);
        expect(await options(1)).toEqual(['17.x', '18.6.0', '19.x', '20.2.0', '20.3.0', unreleased]);
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

    // "How to upgrade from Koobiq 17" describes the whole document; the page shows one upgrade.
    it('should title the guide after the picked range', async () => {
        await render();

        const title = (): HTMLElement => host().querySelector('[data-docs-migration-title]')!;

        await pick({ from: '19', to: '21.0.0' });
        expect(title().textContent!.trim()).toBe('Обновление с 19.x на 21.0.0');
        // Links to the guide point at the heading's id.
        expect(title().id).toBe('how-to-upgrade');

        // A start alone names no upgrade yet.
        await pick({ from: '20.2.0' });
        expect(title().textContent!.trim()).toBe('How to upgrade from Koobiq 17');
    });

    // `ng update` crosses one major at a time, so the page spells out the run for each.
    it('should list one update command per major the upgrade passes through', async () => {
        await render();

        const commands = () =>
            Array.from(host().querySelectorAll('.docs-migration-guide__command')).map((command) => ({
                major: command.firstElementChild!.textContent!.trim(),
                code: command.querySelector('kbq-code-block')!.textContent!.trim()
            }));

        expect(commands()).toEqual([]);

        await pick({ from: '18.6.0', to: '21.0.0' });

        expect(commands().map(({ major }) => major)).toEqual(['Koobiq 19', 'Koobiq 20', 'Koobiq 21']);
        expect(commands()[0].code).toContain(
            'ng update @angular/core@19 @angular/cli@19 @angular/cdk@19 @koobiq/cdk@19 @koobiq/components@19'
        );
        expect(host().querySelector('.docs-migration-guide__commands kbq-alert')).toBeTruthy();
        expect(await axe(host())).toHaveNoViolations();

        await pick({ from: '20.2.0', to: '21.0.0' });

        expect(commands()).toHaveLength(1);
        expect(host().querySelector('.docs-migration-guide__commands kbq-alert')).toBeNull();
    });

    describe('done marks', () => {
        const marks = (): HTMLInputElement[] =>
            Array.from(host().querySelectorAll<HTMLInputElement>('docs-migration-step-done input[type="checkbox"]'));

        const progress = (): string | undefined =>
            host().querySelector('.docs-migration-guide__progress')?.textContent?.trim();

        it('should mount one under every step heading, named after its step', async () => {
            await render();

            const labels = Array.from(
                host().querySelectorAll('.docs-migration-step [data-docs-migration-done] .kbq-checkbox-label')
            ).map((label) => label.textContent!.replace(/\s+/g, ' ').trim());

            expect(labels).toEqual(['Выполнено: Step one', 'Выполнено: Step two', 'Выполнено: Step three']);
        });

        it('should count the steps on screen and remember the ones marked done', async () => {
            await render();
            await pick({ from: '17', to: '21.0.0' });

            expect(progress()).toBe('Выполнено 0 из 3');

            marks()[1].click();
            harness.detectChanges();

            expect(progress()).toBe('Выполнено 1 из 3');
            expect(TestBed.inject(KbqStateSavingService).read(DONE_KEY)).toEqual(['step-two']);

            // Only what is on screen counts: step two is behind a start of 20.2.0.
            await pick({ from: '20.2.0', to: '21.0.0' });
            expect(progress()).toBe('Выполнено 0 из 1');
        });

        // The store is web storage, which a reader can write to by hand.
        it('should restore the marks a previous visit left, ignoring anything but step ids', async () => {
            await render();

            const stateSaving = TestBed.inject(KbqStateSavingService);

            stateSaving.write(DONE_KEY, ['step-one', 42, null, 'step-three']);

            const restored = TestBed.runInInjectionContext(() => new DocsMigrationProgress());

            expect([...restored.done()]).toEqual(['step-one', 'step-three']);

            restored.mark('step-one', false);
            restored.mark('step-three', false);

            expect(stateSaving.read(DONE_KEY)).toBeNull();
        });
    });

    // Switching the language renders the guide's other page, which has to be read afresh: the marks and
    // the filter would otherwise stay with the page that is gone.
    it('should read the guide again when the route shows another page of it', async () => {
        await render();
        await pick({ from: '20.2.0', to: '21.0.0', page: 'other' });
        await render();

        expect(host().querySelector('docs-guide-page')).toBeNull();
        expect(host().querySelector('docs-other-guide-page')).not.toBeNull();
        expect(visibleReleases()).toEqual(['21.0.0']);
        expect(host().querySelectorAll('docs-migration-step-done')).toHaveLength(3);
    });

    // What the dev server does when a module of the page loads: its view is rendered anew inside the
    // host it had, which is left in place.
    it('should read the guide again when its page renders anew in the same host', async () => {
        await render();
        await pick({ from: '20.2.0', to: '21.0.0' });

        host().querySelector('docs-guide-page')!.innerHTML = GUIDE_TEMPLATE;
        await render();

        expect(visibleReleases()).toEqual(['21.0.0']);
        expect(host().querySelectorAll('docs-migration-step-done')).toHaveLength(3);
    });

    // A reader who followed an anchor has to land on something, whatever the range says.
    it('should keep the step the URL fragment points at', async () => {
        await render();
        await pick({ from: '20.2.0', to: '21.0.0' }, 'step-one');

        expect(visibleReleases()).toContain('18.6.0');
    });

    // A shared link to a step usually carries no range at all.
    it('should show the step the URL fragment points at before a start is picked', async () => {
        await render();
        await pick({}, 'step-two');

        expect(visibleReleases()).toEqual(['20.2.0']);
        expect(framingHidden()).toEqual([true, true, true]);
    });

    // The page has no anchors, which is what jumps to a linked heading on every other page.
    it('should scroll to the step a link points at once the guide has rendered', async () => {
        // jsdom lays nothing out and has no `scrollIntoView` to spy on.
        const scrollIntoView = jest.fn();

        Element.prototype.scrollIntoView = scrollIntoView;

        try {
            // Arriving from another page, as a link does: the guide renders anew.
            await harness.navigateByUrl('/elsewhere');
            await harness.navigateByUrl(`${ROUTE}#step-two`);
            await render();

            expect(scrollIntoView.mock.contexts).toEqual([host().querySelector('#step-two')]);
        } finally {
            delete (Element.prototype as Partial<Element>).scrollIntoView;
        }
    });

    // 19 gates no step of its own, so upgrading 18.6 → 19 is a real range with nothing in it.
    it('should say so when the picked range has no steps', async () => {
        await render();
        await pick({ from: '18.6.0', to: '19' });

        expect(visibleReleases()).toEqual([]);
        expect(host().querySelector('kbq-empty-state')).toBeTruthy();
    });

    // An empty plan and "now rebuild and run your tests" under "nothing to upgrade" reads as a
    // broken page, so the framing goes with the steps — and comes back with them.
    it('should hide the framing while nothing is in range', async () => {
        await render();
        await pick({ from: '18.6.0', to: '19' });

        expect(framingHidden()).toEqual([true, true, true]);
        expect(emptyStateTitle()).toBe(DOCS_TRANSLATIONS.migrationNothingTitle.ru);

        await pick({ from: '20.2.0', to: '21.0.0' });
        expect(framingHidden()).toEqual([false, false, false]);
    });

    // The gates come from the guide, so a release that rewrites a step retires the value some
    // older link still carries. Filtering on it would hide everything and explain nothing.
    it('should forget a range the picker cannot offer', async () => {
        await render();
        await pick({ from: 'v20.2.0', to: '20.4.0' });

        const guide = harness.routeDebugElement!.componentInstance as DocsMigrationGuide;

        expect(guide['from']()).toBeNull();
        expect(guide['to']()).toBeNull();
        expect(visibleReleases()).toEqual([]);
        expect(router.url).not.toContain('from=');
    });

    // A repeated key arrives as an array, which used to reach the version parser and throw out of
    // a computed — i.e. take the page down rather than degrade.
    it('should survive a query parameter spelled twice', async () => {
        await render();
        await harness.navigateByUrl(`${ROUTE}?from=18.6.0&from=20.2.0&to=21.0.0`);
        harness.detectChanges();

        expect(visibleReleases()).toEqual(['21.0.0']);
    });

    // Clicking the outline changes only the fragment, so the filter has to re-run for it: the step
    // being linked to has to appear, and the one pinned before has to be let go.
    it('should move the fragment pin when only the fragment changes', async () => {
        await render();
        await pick({ from: '20.2.0', to: '21.0.0' }, 'step-one');

        expect(visibleReleases()).toEqual(['18.6.0', '21.0.0']);

        await pick({ from: '20.2.0', to: '21.0.0' }, 'step-two');
        expect(visibleReleases()).toEqual(['20.2.0', '21.0.0']);
    });

    it('should have no accessibility violations', async () => {
        await render();

        expect(await axe(host())).toHaveNoViolations();
    });
});

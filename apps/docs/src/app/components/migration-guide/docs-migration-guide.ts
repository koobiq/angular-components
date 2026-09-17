import { ComponentPortal, DomPortalOutlet } from '@angular/cdk/portal';
import { DOCUMENT, NgComponentOutlet } from '@angular/common';
import {
    ApplicationRef,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    ElementRef,
    Injector,
    Type,
    ViewEncapsulation,
    afterEveryRender,
    afterNextRender,
    computed,
    effect,
    inject,
    signal,
    viewChild
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { KbqAlertModule } from '@koobiq/components/alert';
import { KbqCodeBlockModule } from '@koobiq/components/code-block';
import { createSearchPredicate, kbqInjectNativeElement } from '@koobiq/components/core';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';
import { map } from 'rxjs/operators';
import { DOCS_MIGRATION_PROGRESS_LABEL, DOCS_MIGRATION_RANGE_TITLE } from '../../services/i18n';
import { DocsLocaleState } from '../../services/locale';
import { docsGetItems } from '../../structure';
import { DocsComponentViewerWrapperComponent } from '../component-viewer/component-viewer-wrapper';
import {
    DOCS_MIGRATION_COMPONENTS_ATTR,
    DOCS_MIGRATION_COMPONENT_SELECTOR,
    DOCS_MIGRATION_DONE_ATTR,
    DOCS_MIGRATION_FRAMING_SELECTOR,
    DOCS_MIGRATION_STEP_ATTR,
    DOCS_MIGRATION_STEP_SELECTOR,
    DOCS_MIGRATION_TITLE_ATTR,
    DOCS_MIGRATION_VERSION_ATTR
} from '../live-example/markdown-content';
import { DocsMigrationProgress } from './docs-migration-progress';
import { DocsMigrationStepDone } from './docs-migration-step-done';
import {
    DocsMigrationVersionOption,
    DocsVersion,
    docsBuildMigrationVersionOptions,
    docsMigrationFromChoices,
    docsMigrationKnownValue,
    docsMigrationNormalizeTo,
    docsMigrationStepApplies,
    docsMigrationToChoices,
    docsMigrationUpdateCommand,
    docsMigrationUpdateMajors,
    docsParseVersion
} from './migration-versions';

/**
 * A query parameter as a single value. The router hands back an array when a key repeats
 * (`?from=18.6.0&from=20.2.0`), and an array reaching the version parser throws out of a computed,
 * i.e. takes the whole page down rather than degrading. The last spelling wins, as it does in a
 * query string.
 */
const readParam = (value: unknown): string | null => {
    const raw = Array.isArray(value) ? value[value.length - 1] : value;

    return typeof raw === 'string' ? raw : null;
};

/** `?components=button,select` as a list; empty for none. */
const readListParam = (value: unknown): string[] => readParam(value)?.split(',').filter(Boolean) ?? [];

/** The components a step or a subsection names in its attribute; empty for a step that concerns every project. */
const componentsOf = (element: Element): string[] =>
    element.getAttribute(DOCS_MIGRATION_COMPONENTS_ATTR)?.split(' ').filter(Boolean) ?? [];

/**
 * The migration guide narrowed to the upgrade the reader is actually doing: pick the release you
 * are on, the one you are going to and the components you use, and only the steps that apply remain.
 *
 * The guide itself is the page compiled from its MDX, as every other page is; the build lays its
 * steps out in sections tagged with the release each one lands in and the components it concerns
 * (`tools/docs-pages/migration`). So the page ships complete — crawlers and a reader without
 * JavaScript see all of it — and the filter only hides what the picks leave out, after hydration.
 */
@Component({
    selector: 'docs-migration-guide',
    imports: [
        DocsComponentViewerWrapperComponent,
        KbqAlertModule,
        KbqCodeBlockModule,
        KbqEmptyStateModule,
        KbqFormFieldModule,
        KbqIconModule,
        KbqInputModule,
        KbqSelectModule,
        NgComponentOutlet,
        ReactiveFormsModule
    ],
    templateUrl: './docs-migration-guide.html',
    styleUrls: ['./docs-migration-guide.scss'],
    providers: [DocsMigrationProgress],
    changeDetection: ChangeDetectionStrategy.OnPush,
    // The guide is a page component rendered through an outlet, so the step styles have to reach
    // nodes this component's template never declared.
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'docs-component-tab docs-migration-guide'
    }
})
export class DocsMigrationGuide extends DocsLocaleState {
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly document = inject<Document>(DOCUMENT);

    /** The page `docsPageResolver` compiled from the guide's MDX for the route. */
    protected readonly page = toSignal(this.route.data.pipe(map(({ page }): Type<unknown> => page)), {
        requireSync: true
    });

    private readonly article = viewChild.required<ElementRef<HTMLElement>>('article');

    private readonly host = kbqInjectNativeElement();
    private readonly appRef = inject(ApplicationRef);
    private readonly injector = inject(Injector);
    private readonly progress = inject(DocsMigrationProgress);

    /** The reader's "done" marks mounted into the rendered guide, released whenever it renders again. */
    private doneMarks: DomPortalOutlet[] = [];

    /** The rendered page the steps were last read from. */
    private readPage: Element | null = null;

    /** Steps of the rendered guide. Empty until the browser has read the page, i.e. always on the server. */
    private readonly steps = signal<HTMLElement[]>([]);
    /** The intro, the upgrade plan and the closing note, which frame whatever steps are shown. */
    private readonly framingSections = signal<HTMLElement[]>([]);
    /** The title as the guide spells it, keyed by its text node: a re-render brings a new one. */
    private readonly documentTitles = new WeakMap<Node, string>();

    protected readonly from = signal<string | null>(null);
    protected readonly to = signal<string | null>(null);
    /** Docs item ids of the components the reader uses; empty for no narrowing by component. */
    protected readonly components = signal<string[]>([]);

    /** Every component a step of the guide is tagged with, read from the page. */
    private readonly componentIds = signal<string[]>([]);
    /** The components as the picker names them: the docs site's own names, in the reader's language. */
    private readonly componentOptions = computed(() => {
        const names = new Map(docsGetItems().map(({ id, name }) => [id as string, name[this.locale()]]));

        return this.componentIds()
            .map((value) => ({ value, label: names.get(value) ?? value }))
            .sort((a, b) => a.label.localeCompare(b.label, this.locale()));
    });

    protected readonly componentSearch = new FormControl('', { nonNullable: true });
    private readonly componentQuery = toSignal(this.componentSearch.valueChanges, { initialValue: '' });
    protected readonly componentChoices = computed(() => {
        const matches = createSearchPredicate(this.componentQuery());
        const picked = new Set(this.components());

        // A picked component stays listed whatever the search says: the select keeps only the values
        // it has an option for, so the next pick would silently drop it.
        return this.componentOptions().filter(({ value, label }) => picked.has(value) || matches(label));
    });

    /**
     * Tracked as a signal rather than read off `route.snapshot`: following a link to another step
     * changes only the fragment, and the filter has to re-run for it — both to reveal the step being
     * linked to and to let go of the one it was pinning before.
     */
    private readonly fragment = signal<string | null>(null);

    private readonly versionOptions = signal<DocsMigrationVersionOption[]>([]);
    /** The releases the guide's steps are filed at, one per step. */
    private readonly stepReleases = signal<DocsVersion[]>([]);

    protected readonly fromChoices = computed(() => docsMigrationFromChoices(this.versionOptions(), this.to()));
    protected readonly toChoices = computed(() => docsMigrationToChoices(this.versionOptions(), this.from()));

    /** Hidden until the page has been read, which is what makes the server and client agree. */
    protected readonly ready = computed(() => this.versionOptions().length > 0);
    /** Heading ids of the steps on screen, or `null` before the page has been filtered at all. */
    private readonly shownSteps = signal<string[] | null>(null);
    /** The guide as a whole answers nobody's upgrade, so nothing of it shows until both ends of one are picked. */
    protected readonly awaitingRange = computed(() => this.ready() && !(this.from() && this.to()));
    protected readonly nothingToDo = computed(() => !!this.from() && !!this.to() && this.shownSteps()?.length === 0);

    /** How many of the steps on screen the reader has marked done. */
    protected readonly progressLabel = computed(() => {
        const shown = this.shownSteps();
        const done = this.progress.done();

        return shown?.length
            ? DOCS_MIGRATION_PROGRESS_LABEL[this.locale()](shown.filter((id) => done.has(id)).length, shown.length)
            : null;
    });

    /** One `ng update` per major the picked upgrade passes through, in the order they have to run. */
    protected readonly updateCommands = computed(() => {
        const from = this.from();
        const to = this.to();

        if (!from || !to) {
            return [];
        }

        const start = docsParseVersion(from);

        return docsMigrationUpdateMajors(start, docsParseVersion(to), this.stepReleases()).map((major) => ({
            major,
            command: docsMigrationUpdateCommand(major, major > start[0])
        }));
    });

    constructor() {
        super();

        this.route.queryParams.pipe(takeUntilDestroyed()).subscribe((params: Params) => {
            const requestedFrom = readParam(params.from);
            const requestedTo = readParam(params.to);
            const requestedComponents = readListParam(params.components);
            const from = this.knownValue(requestedFrom);
            const to = docsMigrationNormalizeTo(from, this.knownValue(requestedTo));
            const components = this.knownComponents(requestedComponents);

            this.from.set(from);
            this.to.set(to);
            this.components.set(components);

            // The link spelled a downgrade, or named a release or a component the pickers do not
            // offer. Rewriting it keeps what the address bar says and what the pickers show from
            // disagreeing; the next emission matches, so this cannot loop.
            if (from !== requestedFrom || to !== requestedTo || components.length !== requestedComponents.length) {
                this.syncUrl();
            }
        });

        this.route.fragment.pipe(takeUntilDestroyed()).subscribe((fragment) => this.fragment.set(fragment));

        inject(DestroyRef).onDestroy(() => this.releaseDoneMarks());

        // A render hook, so it only ever runs in the browser, after hydration: the prerendered page is
        // never filtered. Compared after every render rather than tracked through `page()`: the page
        // element is what the steps are read from, and a new one also comes without a new page type,
        // when the dev server replaces this view.
        afterEveryRender(() => {
            const page = this.article().nativeElement.firstElementChild;

            if (page && page !== this.readPage) {
                this.readPage = page;
                this.onPageRendered();
            }
        });

        // A pure consequence of the picked range, so it re-runs for a URL change and for a pick
        // alike. It is inert until `onPageRendered` has found the steps.
        effect(() => this.applyFilter());
    }

    private onPageRendered(): void {
        const content = this.article().nativeElement;
        const steps = Array.from(content.querySelectorAll<HTMLElement>(DOCS_MIGRATION_STEP_SELECTOR));
        const releases = steps.map((step) => step.getAttribute(DOCS_MIGRATION_VERSION_ATTR) ?? '');
        const options = docsBuildMigrationVersionOptions([...new Set(releases)]);

        this.steps.set(steps);
        this.stepReleases.set(releases.map(docsParseVersion));
        this.framingSections.set(Array.from(content.querySelectorAll<HTMLElement>(DOCS_MIGRATION_FRAMING_SELECTOR)));
        this.versionOptions.set(options);
        this.componentIds.set([
            ...new Set(
                [...steps, ...Array.from(content.querySelectorAll(DOCS_MIGRATION_COMPONENT_SELECTOR))].flatMap(
                    (element) => componentsOf(element)
                )
            )
        ]);

        this.mountDoneMarks(steps);
        this.dropUnknownRange();
        this.reveal();

        // Applied here and not left to the effect, which lands later: by then the guide is painted
        // in full, so a filtered link shows all of it before collapsing to the picked range — and
        // anything sampling the DOM in between reads the unfiltered page.
        this.applyFilter();

        // After the render the options above cause, so the panel over the guide has its final height.
        afterNextRender(() => this.scrollToFragment(), { injector: this.injector });
    }

    /**
     * Mounts the reader's "done" mark under each step's heading. A page compiled from MDX declares
     * no component of its own, so the marks are attached into the hosts the build leaves for them.
     */
    private mountDoneMarks(steps: readonly HTMLElement[]): void {
        this.releaseDoneMarks();

        for (const step of steps) {
            const host = step.querySelector<HTMLElement>(`[${DOCS_MIGRATION_DONE_ATTR}]`);
            const heading = step.firstElementChild;

            if (!host || !heading) continue;

            const outlet = new DomPortalOutlet(host, this.appRef, this.injector);
            const mark = outlet.attach(new ComponentPortal(DocsMigrationStepDone));

            mark.setInput('step', heading.id);
            mark.setInput('title', heading.textContent?.trim() ?? '');
            // Rendered now rather than on the next tick, so a jump to a linked step lands with every
            // step above it at full height.
            mark.changeDetectorRef.detectChanges();

            this.doneMarks.push(outlet);
        }
    }

    private releaseDoneMarks(): void {
        this.doneMarks.forEach((outlet) => outlet.dispose());
        this.doneMarks = [];
    }

    /**
     * Other pages leave the jump to a linked heading to their anchors, which this page does not have.
     * The browser's own jump happened before the filter revealed the step, so it found nothing to land on.
     */
    private scrollToFragment(): void {
        const fragment = this.fragment();

        if (fragment) {
            this.document.getElementById(fragment)?.scrollIntoView({ behavior: 'instant' });
        }
    }

    /**
     * Lets go of the guide the stylesheet holds back until it is filtered, so the prerendered guide
     * never shows in full first. Set on the element rather than bound: a host binding lands with the
     * next change detection, after the jump to a linked step has measured a guide that is not displayed.
     */
    private reveal(): void {
        this.host.classList.add('docs-migration-guide_ready');
    }

    /**
     * A picked value, kept only if the picker can show it. The gates are read from the guide, so a
     * release that rewrites a step retires values that older links still carry, and an unrecognised
     * one parses as "above everything" — it would empty the page while the pickers looked untouched.
     *
     * Until the page has been read there is nothing to check against, so the value is taken on trust
     * and re-examined by `dropUnknownRange`.
     */
    private knownValue(value: string | null): string | null {
        const options = this.versionOptions();

        return options.length ? docsMigrationKnownValue(options, value) : value;
    }

    /** The picked components the guide tags, taken on trust until the page has been read, as with versions. */
    private knownComponents(components: readonly string[]): string[] {
        const known = this.componentIds();

        return known.length ? components.filter((component) => known.includes(component)) : [...components];
    }

    /** Re-examines the range and the components the URL arrived with, now that the options are known. */
    private dropUnknownRange(): void {
        const from = this.knownValue(this.from());
        const to = docsMigrationNormalizeTo(from, this.knownValue(this.to()));
        const components = this.knownComponents(this.components());

        if (from === this.from() && to === this.to() && components.length === this.components().length) {
            return;
        }

        this.from.set(from);
        this.to.set(to);
        this.components.set(components);

        this.syncUrl();
    }

    protected onRangeChange(): void {
        // Narrowing the other end of the range can leave the picked value on the wrong side of it.
        this.to.set(docsMigrationNormalizeTo(this.from(), this.to()));
        this.syncUrl();
    }

    /**
     * Shows the steps in range that concern a picked component and hides the rest, along with their
     * upgrade-plan items — a plan still promising steps that are no longer below it is worse than no
     * plan.
     */
    private applyFilter(): void {
        const steps = this.steps();

        if (!steps.length) {
            return;
        }

        const from = this.from() ? docsParseVersion(this.from()!) : null;
        const to = this.to() ? docsParseVersion(this.to()!) : null;
        const picked = new Set(this.components());
        // Naming no component means concerning every project.
        const concernsPicked = (element: HTMLElement) => {
            const components = componentsOf(element);

            return !picked.size || !components.length || components.some((component) => picked.has(component));
        };
        // A step whose anchor the reader followed stays visible whatever the filter says, or the
        // deep link lands on nothing.
        const fragment = this.fragment();
        // Looked up by id rather than matched by selector: the heading ids carry `.`, `(` and `)`,
        // which are valid in an id and not in an unescaped selector.
        const target = fragment ? this.document.getElementById(fragment) : null;
        const pinned = (element: HTMLElement) => !!target && element.contains(target);

        const plannedSteps = new Set<string>();
        const shownSteps: string[] = [];

        for (const step of steps) {
            // The heading opens the section.
            const id = step.firstElementChild?.id ?? '';
            const release = step.getAttribute(DOCS_MIGRATION_VERSION_ATTR) ?? '';
            const subsections = Array.from(
                step.querySelectorAll<HTMLElement>(`:scope > ${DOCS_MIGRATION_COMPONENT_SELECTOR}`)
            );

            for (const subsection of subsections) {
                subsection.hidden = !concernsPicked(subsection) && !pinned(subsection);
            }

            // A step made of subsections concerns whatever they do.
            const relevant = subsections.length ? subsections.some(concernsPicked) : concernsPicked(step);
            const planned = !!from && !!to && relevant && docsMigrationStepApplies(docsParseVersion(release), from, to);
            const shown = planned || pinned(step);

            step.hidden = !shown;

            if (planned) {
                plannedSteps.add(id);
            }

            if (shown) {
                shownSteps.push(id);
            }
        }

        // A step pinned by its anchor does not bring its plan item back: the plan lists the upgrade
        // the pickers describe, not the steps a link happens to point at.
        this.togglePlanItems(plannedSteps);
        this.updateTitle();

        // The framing describes an upgrade, and until both ends are picked, or with an empty range,
        // there is none. Left up, it puts an empty plan and "now rebuild and run your tests" under a
        // panel that has just said to pick a version, or that there is nothing to do.
        const unframed = !from || !to || !shownSteps.length;

        this.framingSections().forEach((section) => (section.hidden = unframed));
        this.shownSteps.set(shownSteps);
    }

    /**
     * The guide opens with "How to upgrade from Koobiq 17", which describes the whole document. What
     * the page shows is the reader's own upgrade, so the title names that one — and goes back to
     * the guide's own words when there is none.
     */
    private updateTitle(): void {
        const title = this.article().nativeElement.querySelector<HTMLElement>(`[${DOCS_MIGRATION_TITLE_ATTR}]`);
        // Only the text is rewritten: the heading keeps its id, which links to the guide point at.
        const text = title?.lastChild;

        if (!text || text.nodeType !== text.TEXT_NODE) {
            return;
        }

        if (!this.documentTitles.has(text)) {
            this.documentTitles.set(text, text.textContent ?? '');
        }

        const labelOf = (value: string) =>
            this.versionOptions().find((option) => option.value === value)?.label ?? value;
        const from = this.from();
        const to = this.to();

        text.textContent =
            from && to
                ? DOCS_MIGRATION_RANGE_TITLE[this.locale()](labelOf(from), labelOf(to))
                : this.documentTitles.get(text)!;
    }

    private togglePlanItems(steps: ReadonlySet<string>): void {
        this.article()
            .nativeElement.querySelectorAll<HTMLElement>(`li[${DOCS_MIGRATION_STEP_ATTR}]`)
            .forEach((item) => (item.hidden = !steps.has(item.getAttribute(DOCS_MIGRATION_STEP_ATTR)!)));
    }

    private syncUrl(): void {
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
                from: this.from() || undefined,
                to: this.to() || undefined,
                components: this.components().join(',') || undefined
            },
            queryParamsHandling: 'merge',
            // Narrowing the range must not drop the anchor the reader arrived on: without this the
            // router writes an empty fragment, and the link they would copy loses its step.
            preserveFragment: true,
            // Narrowing a range is not navigation: without this, "Back" walks the picks one by one
            // instead of leaving the page.
            replaceUrl: true
        });
    }
}

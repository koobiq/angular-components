import { DOCUMENT } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    ViewEncapsulation,
    computed,
    effect,
    inject,
    signal,
    viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqSelectModule } from '@koobiq/components/select';
import { DocsStructureMigrationTab } from '../../structure';
import { DocsAnchorsComponent } from '../anchors/anchors.component';
import { DocsOverviewComponentBase } from '../component-viewer/component-viewer.component';
import { DocsLiveExampleComponent } from '../live-example/docs-live-example';
import {
    DOCS_MIGRATION_FRAMING_SELECTOR,
    DOCS_MIGRATION_STEP_ATTR,
    DOCS_MIGRATION_STEP_SELECTOR,
    DOCS_MIGRATION_TITLE_ATTR,
    DOCS_MIGRATION_VERSION_ATTR
} from '../live-example/markdown-content';
import {
    DocsMigrationVersionOption,
    docsBuildMigrationVersionOptions,
    docsMigrationFromChoices,
    docsMigrationKnownValue,
    docsMigrationNormalizeTo,
    docsMigrationStepApplies,
    docsMigrationToChoices,
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

/**
 * The migration guide narrowed to the upgrade the reader is actually doing: pick the release you
 * are on and the one you are going to, and only the steps in between remain.
 *
 * The guide itself is the prebuilt document every other docs page loads; the build wraps each of
 * its steps in a section tagged with the release it lands in (`tools/markdown-to-html/migration`).
 * So the page ships complete — crawlers and a reader without JavaScript see all of it, the same way
 * the unfiltered page at `../full` does — and the filter only hides what the picked range leaves
 * out, after hydration.
 */
@Component({
    selector: 'docs-migration-guide',
    imports: [
        DocsAnchorsComponent,
        DocsLiveExampleComponent,
        KbqDividerModule,
        KbqEmptyStateModule,
        KbqFormFieldModule,
        KbqIconModule,
        KbqLinkModule,
        KbqSelectModule,
        RouterLink
    ],
    templateUrl: './docs-migration-guide.html',
    styleUrls: ['./docs-migration-guide.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    // The guide arrives as `innerHTML` inside a child component, so the step styles have to reach
    // nodes this component's template never declared.
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'docs-component-overview docs-migration-guide'
    }
})
export class DocsMigrationGuide extends DocsOverviewComponentBase {
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly document = inject<Document>(DOCUMENT);

    private readonly liveExample = viewChild.required(DocsLiveExampleComponent);
    // Optional: the anchor list is absent until the document has rendered.
    private readonly anchorList = viewChild(DocsAnchorsComponent);

    /** Steps of the rendered guide. Empty until the document reaches the DOM, i.e. always on the server. */
    private readonly steps = signal<HTMLElement[]>([]);
    /** The upgrade plan and the closing note, which only an empty range hides. */
    private readonly framingSections = signal<HTMLElement[]>([]);

    protected readonly from = signal<string | null>(null);
    protected readonly to = signal<string | null>(null);

    /**
     * Tracked as a signal rather than read off `route.snapshot`: clicking the outline changes only
     * the fragment, and the filter has to re-run for it — both to reveal the step being linked to
     * and to let go of the one it was pinning before.
     */
    private readonly fragment = signal<string | null>(null);

    private readonly versionOptions = signal<DocsMigrationVersionOption[]>([]);

    protected readonly fromChoices = computed(() => docsMigrationFromChoices(this.versionOptions(), this.to()));
    protected readonly toChoices = computed(() => docsMigrationToChoices(this.versionOptions(), this.from()));

    /** Hidden until the document has been read, which is what makes the server and client agree. */
    protected readonly ready = computed(() => this.versionOptions().length > 0);
    /** Steps the picked range leaves, or `null` before the document has been filtered at all. */
    protected readonly visibleSteps = signal<number | null>(null);
    protected readonly nothingToDo = computed(() => this.visibleSteps() === 0);

    /** The unfiltered guide, linked from here because this page only ever shows a slice of it. */
    protected readonly fullGuideTab = DocsStructureMigrationTab.Full;

    get docItemUrl(): string | null {
        return this.componentDocItem ? `docs-content/overviews/migration.${this.locale()}.html` : null;
    }

    constructor() {
        super();

        this.route.queryParams.pipe(takeUntilDestroyed()).subscribe((params: Params) => {
            const requestedFrom = readParam(params.from);
            const requestedTo = readParam(params.to);
            const from = this.knownValue(requestedFrom);
            const to = docsMigrationNormalizeTo(from, this.knownValue(requestedTo));

            this.from.set(from);
            this.to.set(to);

            // The link spelled a downgrade, or named a release the picker does not offer. Rewriting
            // it keeps what the address bar says and what the pickers show from disagreeing; the
            // next emission matches, so this cannot loop.
            if (from !== requestedFrom || to !== requestedTo) {
                this.syncUrl();
            }
        });

        this.route.fragment.pipe(takeUntilDestroyed()).subscribe((fragment) => this.fragment.set(fragment));

        // A pure consequence of the picked range, so it re-runs for a URL change and for a pick
        // alike. It is inert until `onContentRendered` has found the steps, which only happens in
        // the browser — the prerendered document is never filtered.
        effect(() => this.applyFilter());
    }

    protected onContentRendered(): void {
        const content = this.liveExample().nativeElement;
        const steps = Array.from(content.querySelectorAll<HTMLElement>(DOCS_MIGRATION_STEP_SELECTOR));
        const options = docsBuildMigrationVersionOptions([
            ...new Set(steps.map((step) => step.getAttribute(DOCS_MIGRATION_VERSION_ATTR) ?? ''))
        ]);

        this.steps.set(steps);
        this.framingSections.set(Array.from(content.querySelectorAll<HTMLElement>(DOCS_MIGRATION_FRAMING_SELECTOR)));
        this.versionOptions.set(options);

        this.dropUnknownRange();

        // Applied here and not left to the effect, which lands a task later: by then the guide is
        // painted in full, so a filtered link shows all of it before collapsing to the picked
        // range — and anything sampling the DOM in between reads the unfiltered page.
        this.applyFilter();

        this.scrollToSelectedContentSection();
    }

    /**
     * A picked value, kept only if the picker can show it. The gates are read from the guide, so a
     * release that rewrites a step retires values that older links still carry, and an unrecognised
     * one parses as "above everything" — it would empty the page while the pickers looked untouched.
     *
     * Until the document has rendered there is nothing to check against, so the value is taken on
     * trust and re-examined by `dropUnknownRange`.
     */
    private knownValue(value: string | null): string | null {
        const options = this.versionOptions();

        return options.length ? docsMigrationKnownValue(options, value) : value;
    }

    /** Re-examines the range the URL arrived with, now that the options are known. */
    private dropUnknownRange(): void {
        const from = this.knownValue(this.from());
        const to = docsMigrationNormalizeTo(from, this.knownValue(this.to()));

        if (from === this.from() && to === this.to()) {
            return;
        }

        this.from.set(from);
        this.to.set(to);

        this.syncUrl();
    }

    protected onRangeChange(): void {
        // Narrowing the other end of the range can leave the picked value on the wrong side of it.
        this.to.set(docsMigrationNormalizeTo(this.from(), this.to()));
        this.syncUrl();
    }

    /**
     * Shows the steps in range and hides the rest, along with their upgrade-plan items — a plan
     * still promising steps that are no longer below it is worse than no plan.
     */
    private applyFilter(): void {
        const steps = this.steps();

        if (!steps.length) {
            return;
        }

        const from = this.from() ? docsParseVersion(this.from()!) : null;
        const to = this.to() ? docsParseVersion(this.to()!) : null;
        // A step whose anchor the reader followed stays visible whatever the range says, or the
        // deep link lands on nothing.
        const fragment = this.fragment();
        // Looked up by id rather than matched by selector: the heading ids carry `.`, `(` and `)`,
        // which are valid in an id and not in an unescaped selector.
        const target = fragment ? this.document.getElementById(fragment) : null;

        const visible = new Set<string>();

        for (const step of steps) {
            const version = docsParseVersion(step.getAttribute(DOCS_MIGRATION_VERSION_ATTR) ?? '');
            const shown = docsMigrationStepApplies(version, from, to) || (!!target && step.contains(target));

            step.hidden = !shown;

            if (shown) {
                visible.add(step.getAttribute(DOCS_MIGRATION_STEP_ATTR)!);
            }
        }

        this.togglePlanItems(visible);
        this.toggleTitle();

        const nothingToDo = visible.size === 0;

        // The plan and the closing note describe an upgrade that is not happening. Left up, they
        // put an empty numbered list and "now rebuild and run your tests" under a panel that has
        // just said there is nothing to do.
        this.framingSections().forEach((section) => (section.hidden = nothingToDo));
        this.visibleSteps.set(visible.size);
        this.anchorList()?.refresh();
    }

    /**
     * The guide opens with "How to upgrade from Koobiq 17" — the release the whole document starts
     * from. Once the reader starts somewhere later that describes an upgrade they are not doing, and
     * the pickers right above already say which one they are, so the title goes.
     */
    private toggleTitle(): void {
        const title = this.liveExample().nativeElement.querySelector<HTMLElement>(`[${DOCS_MIGRATION_TITLE_ATTR}]`);
        const from = this.from();
        // The lowest offered release is the one the title names, so starting there keeps it true.
        const floor = this.versionOptions()[0]?.value;

        if (title) {
            title.hidden = !!from && from !== floor;
        }
    }

    private togglePlanItems(visible: ReadonlySet<string>): void {
        this.liveExample()
            .nativeElement.querySelectorAll<HTMLElement>(`li[${DOCS_MIGRATION_STEP_ATTR}]`)
            .forEach((item) => (item.hidden = !visible.has(item.getAttribute(DOCS_MIGRATION_STEP_ATTR)!)));
    }

    private syncUrl(): void {
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { from: this.from() || undefined, to: this.to() || undefined },
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

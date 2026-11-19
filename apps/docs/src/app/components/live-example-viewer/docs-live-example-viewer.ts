import { NgComponentOutlet } from '@angular/common';
import {
    afterEveryRender,
    afterNextRender,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    computed,
    effect,
    ElementRef,
    inject,
    Injector,
    input,
    linkedSignal,
    signal,
    type Type,
    untracked,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, map, type Observable } from 'rxjs';
import { KbqButtonModule } from '@koobiq/components/button';
import { type KbqCodeBlockFile, KbqCodeBlockModule } from '@koobiq/components/code-block';
import { kbqInjectNativeElement, KbqStateSavingService } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLink } from '@koobiq/components/link';
import { KbqModalService } from '@koobiq/components/modal';
import { KbqSidepanelService } from '@koobiq/components/sidepanel';
import { KbqSkeleton } from '@koobiq/components/skeleton';
import { KbqToastService } from '@koobiq/components/toast';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { EXAMPLE_COMPONENTS } from '@koobiq/docs-examples';
import { DocsLocaleState } from 'src/app/services/locale';
import {
    DOCS_CODE_EXAMPLE_PARAM,
    DOCS_CODE_FILE_PARAM,
    DOCS_CODE_LINES_PARAM,
    DOCS_WITHOUT_CODE_LINES
} from '../../constants/code-lines';
import { docsExamplePageUrl } from '../../constants/example-page';
import { DocsDocumentLoader } from '../../services/document-loader';
import { DocsFullscreenService } from '../../services/fullscreen';
import { DocsStackblitzButtonComponent } from '../stackblitz/stackblitz-button';

/** Preferred order for files of an example displayed in the viewer. */
const preferredExampleFileOrder = ['HTML', 'TS', 'CSS'];

interface ExampleFileData {
    filename: string;
    content: string;
    language: string;
}

/** Lines of the source of an example, from the first to the last. */
type DocsCodeLines = [first: number, last: number];

/** Loads the class of an example that cannot render on the server, so the page does not carry its code. */
export interface DocsExampleLoader {
    load(): Promise<Type<unknown>>;
}

const isLoader = (component: Type<unknown> | DocsExampleLoader): component is DocsExampleLoader =>
    typeof component !== 'function';

@Component({
    selector: 'docs-live-example-viewer',
    imports: [
        DocsStackblitzButtonComponent,
        KbqLink,
        KbqCodeBlockModule,
        NgComponentOutlet,
        KbqButtonModule,
        KbqToolTipModule,
        KbqIconModule,
        KbqSkeleton
    ],
    templateUrl: './docs-live-example-viewer.html',
    styleUrl: './docs-live-example-viewer.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'docs-live-example-viewer kbq-markdown'
    }
})
export class DocsLiveExampleViewerComponent extends DocsLocaleState {
    /**
     * Key of the example to display, resolved against `EXAMPLE_COMPONENTS`. Pages pass only keys the catalogue has:
     * their compiler fails the build on any other.
     */
    readonly example = input.required<string>();

    /**
     * Class of the example component, or the loader of an example that cannot render on the server. That one is
     * loaded once the page has rendered in the browser; until then a skeleton holds its place, on the server too,
     * so hydration finds the same markup.
     */
    readonly component = input.required<Type<unknown> | DocsExampleLoader>();

    protected readonly isSourceShown = signal(false);

    /** The source files of the example, once they have loaded. */
    private readonly sourceFiles = signal<KbqCodeBlockFile[]>([]);

    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly queryParams = toSignal(this.route.queryParamMap, { requireSync: true });

    /** The file, by its extension, and the lines of the source that the address names, when it names this example. */
    private readonly linkedLines = computed(() => {
        const params = this.queryParams();
        const lines = this.parseLines(params.get(DOCS_CODE_LINES_PARAM));

        return params.get(DOCS_CODE_EXAMPLE_PARAM) === this.example() && lines
            ? { file: params.get(DOCS_CODE_FILE_PARAM), lines }
            : null;
    });

    /** Index of the source file the address names, or `-1`. */
    private readonly linkedFileIndex = computed(() => {
        const link = this.linkedLines();

        return link ? this.sourceFiles().findIndex(({ language }) => language?.toLowerCase() === link.file) : -1;
    });

    /** The source files, with the lines the address names marked in their file. */
    readonly files = computed(() => {
        const index = this.linkedFileIndex();
        const lines = this.linkedLines()?.lines;

        return this.sourceFiles().map((file, fileIndex) =>
            fileIndex === index && lines ? { ...file, markedLines: [lines] } : file
        );
    });

    /** The source file on screen: the one the address names, until the reader picks another. */
    protected readonly activeFileIndex = linkedSignal<number, number>({
        source: this.linkedFileIndex,
        // An address that stops naming a file leaves the reader on the one they are reading.
        computation: (index, previous) => (index >= 0 ? index : (previous?.value ?? 0))
    });

    /** The lines the reader has selected last: the address that names them next does not scroll to them. */
    private sharedLines: string | null = null;

    /** Set while the source scrolls to the lines the address names once they are marked. */
    private scrollsToLinkedLines = false;

    private readonly sourceCode = viewChild<unknown, ElementRef<HTMLElement>>('sourceCode', { read: ElementRef });

    /** Data for the currently selected example: the example-page routes only accept a known example id. */
    readonly exampleData = computed(() => EXAMPLE_COMPONENTS[this.example()]!);

    protected readonly exampleId = computed(() => this.exampleData().selector.replace('-example', ''));

    /**
     * A plain `href` rather than a `routerLink`: the router does not open a new tab, and before hydration event
     * replay would swallow the click on a router link.
     */
    protected readonly examplePageUrl = computed(() => docsExamplePageUrl(this.example()));

    /** Set to `false` by `reload()` to tear the example down. */
    private readonly isExampleAttached = signal(true);

    /** Class of an example given as a loader, once it has loaded. */
    private readonly loadedComponent = signal<Type<unknown> | null>(null);

    /** Set when the loader rejects, so a chunk that never arrives does not leave the reader waiting. */
    private readonly hasFailedToLoad = signal(false);

    /** Whether the example waits for its class to load, which a skeleton shows. */
    protected readonly isLoading = computed(
        () => isLoader(this.component()) && !this.loadedComponent() && !this.hasFailedToLoad()
    );

    /** Component type for the current example. */
    protected readonly exampleComponentType = computed(() => {
        const component = this.component();

        if (!this.isExampleAttached()) return null;

        return isLoader(component) ? this.loadedComponent() : component;
    });

    readonly exampleElement = viewChild.required<ElementRef<HTMLElement>>('exampleElement');

    private readonly documentLoader = inject(DocsDocumentLoader);
    private readonly cdr = inject(ChangeDetectorRef);
    private readonly host = kbqInjectNativeElement();
    private readonly fullscreen = inject(DocsFullscreenService);
    private readonly sidepanelService = inject(KbqSidepanelService, { optional: true });
    private readonly modalService = inject(KbqModalService, { optional: true });
    private readonly toastService = inject(KbqToastService, { optional: true });
    private readonly stateSaving = inject(KbqStateSavingService);
    private readonly injector = inject(Injector);

    protected readonly fullscreenAvailable = this.fullscreen.available;
    protected readonly isFullscreen = computed(() => this.fullscreen.element() === this.host);

    constructor() {
        super();

        // Render hooks do not run on the server, which leaves an example given as a loader to the browser.
        afterNextRender(() => this.loadComponent());

        // After hydration, which the source shown would not find in the markup of the server.
        afterNextRender(() => this.followLinkedLines());

        afterEveryRender(() => {
            const line = this.scrollsToLinkedLines
                ? this.sourceCode()?.nativeElement.querySelector('.kbq-code-block__line_marked')
                : null;

            if (!line) return;

            this.scrollsToLinkedLines = false;
            line.scrollIntoView({ block: 'center', behavior: 'instant' });
        });

        // Start over whenever the key changes (replaces a side-effecting `@Input` setter).
        effect(() => {
            this.example();

            untracked(() => this.resetExample());
        });
    }

    toggleSourceView() {
        this.isSourceShown.update((isShown) => !isShown);

        // On demand rather than with the example: fetched while rendering on the server, the sources
        // would be serialized into the page by the HTTP transfer cache.
        if (this.isSourceShown() && this.sourceFiles().length === 0) {
            this.generateExampleTabs();
        }

        if (!this.isSourceShown() && this.linkedLines()) {
            this.sharedLines = null;
            this.navigateToLines(null);
        }
    }

    /** Puts the lines the reader has selected in the source into the address of the page, or takes them out of it. */
    protected shareLines(files: KbqCodeBlockFile[]): void {
        const file = files[this.activeFileIndex()];
        const [mark] = file?.markedLines ?? [];
        const lines: DocsCodeLines | null = typeof mark === 'number' ? [mark, mark] : Array.isArray(mark) ? mark : null;

        // Unmarked lines of another example than the one the address names leave the address to it.
        if (!lines && !this.linkedLines()) return;

        this.sharedLines = lines && this.linkKey(file?.language, lines);
        // Lines a link named but the source could not mark are not scrolled to on the reader's own selection.
        this.scrollsToLinkedLines = false;
        this.navigateToLines(lines && { file: file?.language?.toLowerCase(), lines });
    }

    /**
     * Shows the source of the example when the address names lines of it, and scrolls to them, unless the reader has
     * just selected them.
     */
    private followLinkedLines(): void {
        effect(
            () => {
                const link = this.linkedLines();

                if (!link) return;

                untracked(() => {
                    const file = this.sourceFiles()[this.linkedFileIndex()];

                    if (this.linkKey(file?.language, link.lines) === this.sharedLines) return;

                    this.scrollsToLinkedLines = true;

                    if (!this.isSourceShown()) this.toggleSourceView();
                });
            },
            { injector: this.injector }
        );
    }

    private navigateToLines(link: { file: string | undefined; lines: DocsCodeLines } | null): void {
        void this.router.navigate([], {
            relativeTo: this.route,
            queryParams: link
                ? {
                      [DOCS_CODE_EXAMPLE_PARAM]: this.example(),
                      [DOCS_CODE_FILE_PARAM]: link.file,
                      [DOCS_CODE_LINES_PARAM]: this.formatLines(link.lines)
                  }
                : DOCS_WITHOUT_CODE_LINES,
            queryParamsHandling: 'merge',
            replaceUrl: true
        });
    }

    /** Lines as the address names them: `12` or `12-14`. */
    private parseLines(value: string | null): DocsCodeLines | null {
        const match = value?.match(/^([1-9]\d*)(?:-([1-9]\d*))?$/);

        if (!match) return null;

        const first = Number(match[1]);
        const last = Number(match[2] ?? match[1]);

        return [Math.min(first, last), Math.max(first, last)];
    }

    private formatLines([first, last]: DocsCodeLines): string {
        return first === last ? `${first}` : `${first}-${last}`;
    }

    /** Lines of a file, as the reader's own selection is told from a link. */
    private linkKey(language: string | undefined, lines: DocsCodeLines): string {
        return `${language}:${this.formatLines(lines)}`;
    }

    protected toggleFullscreen(): Promise<void> {
        return this.fullscreen.toggle(this.host);
    }

    protected reload(): void {
        // Before the example is torn down, because destroying it unregisters the components below. A
        // component that persists would otherwise restore the state this button just promised to reset.
        this.clearPersistedExampleState(this.exampleElement().nativeElement);

        // Checking the view in between destroys the example, so attaching it again creates a new instance.
        this.isExampleAttached.set(false);
        this.cdr.detectChanges();

        this.sidepanelService?.closeAll();
        this.modalService?.closeAll();
        this.toastService?.toasts.forEach(({ instance }) => this.toastService?.hide(instance.id));

        this.isExampleAttached.set(true);
    }

    /**
     * Removes what the components inside this example have persisted, so "reset state" really resets it.
     *
     * Scoped to the example's own element: the documentation site persists state of its own, and the
     * other examples on the page are nobody's business here. A component that persists through a service
     * rather than a host element — a sidepanel, which reports a `null` host — cannot be located this way
     * and keeps its entry; those examples carry a reset button of their own.
     */
    private clearPersistedExampleState(exampleHost: HTMLElement): void {
        this.stateSaving
            .components()
            .filter(({ host }) => !!host && exampleHost.contains(host))
            .forEach((ref) => ref.clear());
    }

    /** Rebuilds the shown source tabs of the example. */
    private resetExample(): void {
        this.sourceFiles.set([]);
        this.activeFileIndex.set(0);

        if (this.isSourceShown()) {
            this.generateExampleTabs();
        }
    }

    private loadComponent(): void {
        const component = this.component();

        if (!isLoader(component)) return;

        component
            .load()
            .then((type) => this.loadedComponent.set(type))
            .catch((error) => {
                // The chunk of an example is gone after a deploy, for one. Drop the skeleton and `aria-busy`
                // rather than announce "busy" to a screen reader for as long as the page stays open.
                this.hasFailedToLoad.set(true);
                console.error(`Could not load example '${this.example()}': ${error}`);
            });
    }

    /**
     * Initiates the fetching of all files listed in exampleData.files, processes them,
     * and then orders them by specified languages before pushing to the 'files' array.
     * Utilizes RxJS forkJoin to handle parallel HTTP requests.
     */
    private generateExampleTabs() {
        const exampleData = this.exampleData();

        if (!exampleData) return;

        const docsContentPath = `docs-content/examples-source/${exampleData.packagePath}`;

        const observables = exampleData.files.map((fileName) => {
            const language = this.determineLanguage(fileName);
            const importPath = `${docsContentPath}/${fileName}`;

            return this.fetchCode(importPath).pipe(
                map((content) => ({
                    filename: language,
                    content: content,
                    language
                }))
            );
        });

        forkJoin(observables).subscribe({
            next: (results: ExampleFileData[]) => {
                // Sorts the files according to the predefined preferredExampleFileOrder by language
                results.sort(
                    (a, b) =>
                        preferredExampleFileOrder.indexOf(a.language) - preferredExampleFileOrder.indexOf(b.language)
                );
                // Assign rather than append: showing the source again for the same example would
                // otherwise duplicate every source tab.
                this.sourceFiles.set(this.prepareCodeFiles(results));
            },
            error: (error: unknown) => {
                console.error('Error fetching the files', error);
            }
        });
    }

    /**
     * Determines the programming language from the file extension.
     * @param fileName The name of the file, including its extension.
     * @returns The uppercase string representing the programming language.
     */
    private determineLanguage(fileName: string): string {
        const extension = fileName.split('.').pop();

        switch (extension) {
            case 'ts':
                return 'TS';
            case 'html':
                return 'HTML';
            case 'css':
                return 'CSS';
            default:
                return 'Unknown';
        }
    }

    /** Fetches the content of a file from the specified import path. */
    private fetchCode(importPath: string): Observable<string> {
        return this.documentLoader.get(importPath);
    }

    private prepareCodeFiles(codeFiles: ExampleFileData[]) {
        const filteredFiles = codeFiles.filter((file) => file.content);

        if (filteredFiles.length === 1) {
            /* If there is only one non-empty document in the example, then show the block without tabs */
            filteredFiles[0]!.filename = '';
        }

        return filteredFiles;
    }
}

import { NgComponentOutlet } from '@angular/common';
import {
    afterNextRender,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    computed,
    effect,
    ElementRef,
    inject,
    input,
    signal,
    Type,
    untracked,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqCodeBlockFile, KbqCodeBlockModule } from '@koobiq/components/code-block';
import { kbqInjectNativeElement, KbqStateSavingService } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqModalService } from '@koobiq/components/modal';
import { KbqSidepanelService } from '@koobiq/components/sidepanel';
import { KbqSkeleton } from '@koobiq/components/skeleton';
import { KbqToastService } from '@koobiq/components/toast';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { EXAMPLE_COMPONENTS } from '@koobiq/docs-examples';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DocsLocaleState } from 'src/app/services/locale';
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
        KbqLinkModule,
        KbqCodeBlockModule,
        NgComponentOutlet,
        KbqButtonModule,
        KbqToolTipModule,
        KbqIconModule,
        KbqSkeleton
    ],
    templateUrl: './docs-live-example-viewer.html',
    styleUrls: ['./docs-live-example-viewer.scss'],
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

    files: KbqCodeBlockFile[] = [];

    /** Data for the currently selected example. */
    readonly exampleData = computed(() => EXAMPLE_COMPONENTS[this.example()]);

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

    protected readonly fullscreenAvailable = this.fullscreen.available;
    protected readonly isFullscreen = computed(() => this.fullscreen.element() === this.host);

    constructor() {
        super();

        // Render hooks do not run on the server, which leaves an example given as a loader to the browser.
        afterNextRender(() => this.loadComponent());

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
        if (this.isSourceShown() && this.files.length === 0) {
            this.generateExampleTabs();
        }
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
        this.files = [];

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
                this.files = this.prepareCodeFiles(results);
                // Files arrive from async HTTP; under OnPush the code panel needs an explicit check.
                this.cdr.markForCheck();
            },
            error: (error) => {
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
            filteredFiles[0].filename = '';
        }

        return filteredFiles;
    }
}

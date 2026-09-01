import { NgComponentOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    computed,
    effect,
    ElementRef,
    inject,
    input,
    NgZone,
    signal,
    Type,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqCodeBlockFile, KbqCodeBlockModule } from '@koobiq/components/code-block';
import { KBQ_WINDOW, kbqInjectNativeElement } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqModalService } from '@koobiq/components/modal';
import { KbqSidepanelService } from '@koobiq/components/sidepanel';
import { KbqToastService } from '@koobiq/components/toast';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { EXAMPLE_COMPONENTS, LiveExample, loadExample } from '@koobiq/docs-examples';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DocsLocaleState } from 'src/app/services/locale';
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

@Component({
    selector: 'docs-live-example-viewer',
    imports: [
        DocsStackblitzButtonComponent,
        KbqLinkModule,
        KbqCodeBlockModule,
        NgComponentOutlet,
        KbqButtonModule,
        KbqToolTipModule,
        KbqIconModule
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
     * Key of the example to display, resolved against `EXAMPLE_COMPONENTS`. Set declaratively from a
     * template, or with `ComponentRef.setInput` by the viewers that attach this component through a
     * portal.
     */
    readonly example = input<string | null>(null);

    protected readonly isSourceShown = signal(false);

    files: KbqCodeBlockFile[] = [];

    /** Data for the currently selected example. */
    exampleData: LiveExample;

    /** Component type for the current example. */
    exampleComponentType: Type<unknown> | null = null;

    exampleHeight = signal<number | null>(null);

    get exampleId() {
        return this.exampleData?.selector.replace('-example', '');
    }

    readonly exampleElement = viewChild<ElementRef<HTMLElement>>('exampleElement');

    private readonly documentLoader = inject(DocsDocumentLoader);
    private readonly cdr = inject(ChangeDetectorRef);
    private readonly ngZone = inject(NgZone);
    private readonly window = inject(KBQ_WINDOW);
    private readonly host = kbqInjectNativeElement();
    private readonly fullscreen = inject(DocsFullscreenService);
    private readonly sidepanelService = inject(KbqSidepanelService, { optional: true });
    private readonly modalService = inject(KbqModalService, { optional: true });
    private readonly toastService = inject(KbqToastService, { optional: true });

    protected readonly fullscreenAvailable = this.fullscreen.available;
    protected readonly isFullscreen = computed(() => this.fullscreen.element() === this.host);

    constructor() {
        super();

        // Load whenever the key changes (replaces a side-effecting `@Input` setter). The effect only
        // reacts to an actual change, so `reload()` re-invokes the loader directly instead.
        effect(() => this.loadExample(this.example()));
    }

    toggleSourceView() {
        this.isSourceShown.update((isShown) => !isShown);
    }

    protected toggleFullscreen(): Promise<void> {
        return this.fullscreen.toggle(this.host);
    }

    protected reload(): void {
        const exampleElement = this.exampleElement();

        if (exampleElement) {
            const style = this.window.getComputedStyle(exampleElement.nativeElement);
            const height =
                exampleElement.nativeElement.clientHeight -
                parseFloat(style.paddingTop) -
                parseFloat(style.paddingBottom);

            this.exampleHeight.set(height);
        }

        this.exampleComponentType = null;

        this.sidepanelService?.closeAll();
        this.modalService?.closeAll();
        this.toastService?.toasts.forEach(({ instance }) => this.toastService?.hide(instance.id));

        this.loadExample(this.example());
    }

    /** Resolves the example metadata, instantiates its component and (re)builds the source tabs. */
    private loadExample(exampleName: string | null): void {
        // `null` is the "no example requested yet" default — nothing to load and nothing to report.
        if (exampleName === null) {
            return;
        }

        if (!EXAMPLE_COMPONENTS[exampleName]) {
            console.error(`Could not find example: ${exampleName}`);

            return;
        }

        this.exampleData = EXAMPLE_COMPONENTS[exampleName];

        this.loadExampleComponent(exampleName)
            .then(() => this.exampleHeight.set(null))
            .catch((error) => console.error(`Could not load example '${exampleName}': ${error}`));

        this.generateExampleTabs();
    }

    /**
     * Initiates the fetching of all files listed in exampleData.files, processes them,
     * and then orders them by specified languages before pushing to the 'files' array.
     * Utilizes RxJS forkJoin to handle parallel HTTP requests.
     */
    private generateExampleTabs() {
        if (!this.exampleData) {
            return;
        }

        const docsContentPath = `docs-content/examples-source/${this.exampleData.packagePath}`;

        const observables = this.exampleData.files.map((fileName) => {
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
                // Assign rather than append: `reload()` runs this again for the same example, and
                // appending would duplicate every source tab.
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

    private loadExampleComponent(exampleName: string): Promise<void> {
        const { componentName } = this.exampleData;

        // Run inside Angular zone so zone.js tracks the dynamic import Promise.
        // This ensures ngZone.onStable fires only after the example module is loaded
        // and the component is rendered — preventing premature anchor scroll.
        return this.ngZone.run(async () => {
            const moduleExports = await loadExample(exampleName);

            this.exampleComponentType = moduleExports[componentName];

            this.cdr.markForCheck();
        });
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

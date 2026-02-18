import { NgComponentOutlet } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    inject,
    Input,
    signal,
    Type,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { KbqCodeBlockFile, KbqCodeBlockModule } from '@koobiq/components/code-block';
import { KBQ_WINDOW } from '@koobiq/components/core';
import { KbqDivider } from '@koobiq/components/divider';
import { KbqIconButton } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqModalService } from '@koobiq/components/modal';
import { KbqSidepanelService } from '@koobiq/components/sidepanel';
import { KbqToastService } from '@koobiq/components/toast';
import { EXAMPLE_COMPONENTS, LiveExample, loadExample } from '@koobiq/docs-examples';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DocsLocaleState } from 'src/app/services/locale';
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
        KbqIconButton,
        KbqDivider
    ],
    templateUrl: './docs-live-example-viewer.html',
    styleUrls: ['./docs-live-example-viewer.scss'],
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'docs-live-example-viewer kbq-markdown'
    }
})
export class DocsLiveExampleViewerComponent extends DocsLocaleState {
    isSourceShown: boolean = false;

    files: KbqCodeBlockFile[] = [];

    @Input() fileOrder = ['HTML', 'TS', 'CSS'];

    /** Data for the currently selected example. */
    exampleData: LiveExample;

    /** Component type for the current example. */
    exampleComponentType: Type<any> | null = null;

    exampleHeight = signal<number | null>(null);

    get exampleId() {
        return this.exampleData?.selector.replace('-example', '');
    }

    /** String key of the currently displayed example. */
    @Input()
    get example() {
        return this._example;
    }

    set example(exampleName: string | null) {
        if (exampleName && exampleName !== this._example && EXAMPLE_COMPONENTS[exampleName]) {
            this._example = exampleName;
            this.exampleData = EXAMPLE_COMPONENTS[exampleName];
            this.loadExampleComponent()
                .then(() => this.exampleHeight.set(null))
                .catch((error) => console.error(`Could not load example '${exampleName}': ${error}`));
            this.generateExampleTabs();
        } else {
            console.error(`Could not find example: ${exampleName}`);
        }
    }

    private _example: string | null;

    @ViewChild('exampleElement') exampleElement: ElementRef<HTMLElement>;

    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly httpClient = inject(HttpClient);
    private readonly cdr = inject(ChangeDetectorRef);
    private readonly window = inject(KBQ_WINDOW);
    private readonly sidepanelService = inject(KbqSidepanelService, { optional: true });
    private readonly modalService = inject(KbqModalService, { optional: true });
    private readonly toastService = inject(KbqToastService, { optional: true });

    toggleSourceView() {
        this.isSourceShown = !this.isSourceShown;
    }

    protected reload(): void {
        const previous = this.example;

        const style = this.window.getComputedStyle(this.exampleElement.nativeElement);
        const height =
            this.exampleElement.nativeElement.clientHeight -
            parseFloat(style.paddingTop) -
            parseFloat(style.paddingBottom);

        this.exampleHeight.set(height);

        this._example = '';
        this.exampleComponentType = null;

        this.sidepanelService?.closeAll();
        this.modalService?.closeAll();
        this.toastService?.toasts.forEach(({ instance }) => this.toastService?.hide(instance.id));

        this.example = previous;
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
                this.files.push(...this.prepareCodeFiles(results));
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

    /**
     * Fetches file content from a specified path using an HTTP GET request.
     * @param importPath The path from which to fetch the file content.
     * @returns Observable emitting the text content of the file.
     */
    private fetchCode(importPath: string): Observable<string> {
        return this.httpClient.get(importPath, { responseType: 'text' });
    }

    private async loadExampleComponent() {
        if (this._example != null) {
            const { componentName } = this.exampleData;
            // Lazily loads the example package that contains the requested example.
            const moduleExports = await loadExample(this._example);

            this.exampleComponentType = moduleExports[componentName];

            // Since the data is loaded asynchronously, we can't count on the native behavior
            // that scrolls the element into view automatically. We do it ourselves while giving
            // the page some time to render.
            if (typeof this.window.location !== 'undefined' && this.window.location.hash.slice(1) === this._example) {
                setTimeout(() => this.elementRef.nativeElement.scrollIntoView(), 300);
            }

            this.cdr.markForCheck();
        }
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

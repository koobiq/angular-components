import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqCodeBlockFile, KbqCodeBlockModule } from '@koobiq/components/code-block';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { DocsNextContent, DocsNextExampleFile } from '../services/content';
import { DocsNextSiteState } from '../services/site-state';

const LANGUAGES: Record<string, string> = { ts: 'typescript', html: 'html', css: 'css', scss: 'scss' };

/**
 * Frame of an interactive example (Figma: 14 Live Example v4; spec/examples). The prototype keeps the viewing area
 * static: the live example comes with the example hosts of stage 4. The code is hidden until "Show code".
 */
@Component({
    selector: 'docs-next-example-frame',
    imports: [KbqButtonModule, KbqCodeBlockModule, KbqIconModule, KbqLinkModule, KbqToolTipModule],
    templateUrl: './example-frame.html',
    styleUrl: './example-frame.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsNextExampleFrame {
    protected readonly state = inject(DocsNextSiteState);

    readonly exampleId = input.required<string>();
    readonly exampleTitle = input.required<string>();
    /** Where the source files of the example are loaded from, when its page has them. */
    readonly sources = input<string>();

    private readonly content = inject(DocsNextContent);
    private readonly files = signal<DocsNextExampleFile[]>([]);

    protected readonly codeVisible = signal(false);
    /** The source files are on their way after the code was asked for. */
    protected readonly codeLoading = signal(false);
    protected readonly codeFiles = computed<KbqCodeBlockFile[]>(() =>
        this.files().map(({ name, content }) => ({
            filename: name,
            content,
            language: LANGUAGES[name.split('.').at(-1) ?? ''] ?? 'plaintext'
        }))
    );

    protected toggleCode(): void {
        this.codeVisible.update((visible) => !visible);

        if (this.codeVisible()) this.loadFiles();
    }

    /** Starts the load of the source files when the pointer or the focus comes to "Show code", so they may be there when it is pressed. */
    protected loadFiles(): void {
        const sources = this.sources();

        if (!sources || this.files().length) return;

        this.codeLoading.set(true);
        this.content.loadExampleSources(sources).subscribe((files) => {
            this.files.set(files?.[this.exampleId()] ?? []);
            this.codeLoading.set(false);
        });
    }
}

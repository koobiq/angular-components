import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqCodeBlockFile, KbqCodeBlockModule } from '@koobiq/components/code-block';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { DocsNextExampleFile } from '../services/content';
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
    readonly files = input<DocsNextExampleFile[]>([]);

    protected readonly codeVisible = signal(false);
    protected readonly codeFiles = computed<KbqCodeBlockFile[]>(() =>
        this.files().map(({ name, content }) => ({
            filename: name,
            content,
            language: LANGUAGES[name.split('.').at(-1) ?? ''] ?? 'plaintext'
        }))
    );
}

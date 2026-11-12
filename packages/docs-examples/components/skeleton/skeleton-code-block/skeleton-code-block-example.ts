import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    KbqCodeBlockFile,
    kbqCodeBlockHighlightJsConfigProvider,
    KbqCodeBlockModule
} from '@koobiq/components/code-block';
import { KbqSkeleton } from '@koobiq/components/skeleton';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Skeleton in place of a code block
 */
@Component({
    selector: 'skeleton-code-block-example',
    imports: [KbqSkeleton, KbqCodeBlockModule, KbqToggleModule, FormsModule],
    template: `
        <kbq-toggle [(ngModel)]="loading">{{ t().loading }}</kbq-toggle>

        @if (loading()) {
            <kbq-skeleton [style.height.px]="98" />
        } @else {
            <kbq-code-block lineNumbers [files]="files" />
        }
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-xl);
            padding: var(--kbq-size-xl);
        }
    `,
    providers: [
        kbqCodeBlockHighlightJsConfigProvider({
            languages: {
                javascript: () => import('highlight.js/lib/languages/javascript')
            }
        })
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonCodeBlockExample extends BaseLocalizedExample<ExampleTranslation> {
    protected readonly loading = model(true);

    protected readonly files: KbqCodeBlockFile[] = [
        {
            content: `function getVulnerabilities() {\n\treturn ['BruteForce', 'Complex Attack', 'DDoS', 'HIPS alert', 'IDS/IPS Alert', 'Zero-Day Exploit', 'XSS', 'Malware', 'Ransomware', 'Phishing'];\n};`,
            language: 'javascript'
        }
    ];

    constructor() {
        super(TRANSLATIONS);
    }
}

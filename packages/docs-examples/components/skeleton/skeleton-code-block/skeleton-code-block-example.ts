import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    KbqCodeBlockFile,
    kbqCodeBlockHighlightJsConfigProvider,
    KbqCodeBlockModule
} from '@koobiq/components/code-block';
import { KbqSkeleton } from '@koobiq/components/skeleton';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Skeleton in place of a code block
 */
@Component({
    selector: 'skeleton-code-block-example',
    imports: [KbqSkeleton, KbqCodeBlockModule, KbqToggleModule, FormsModule],
    template: `
        <kbq-toggle [(ngModel)]="loading">Loading</kbq-toggle>

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
            core: () => import('highlight.js/lib/core'),
            languages: {
                javascript: () => import('highlight.js/lib/languages/javascript')
            }
        })
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonCodeBlockExample {
    protected readonly loading = model(true);
    protected readonly files: KbqCodeBlockFile[] = [
        {
            content: `function getVulnerabilities() {\n\treturn ['BruteForce', 'Complex Attack', 'DDoS', 'HIPS alert', 'IDS/IPS Alert', 'Zero-Day Exploit', 'XSS', 'Malware', 'Ransomware', 'Phishing'];\n};`,
            language: 'javascript'
        }
    ];
}

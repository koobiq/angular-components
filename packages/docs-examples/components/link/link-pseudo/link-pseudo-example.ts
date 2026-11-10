import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KbqLinkModule } from '@koobiq/components/link';

/**
 * @title Link pseudo
 */
@Component({
    selector: 'link-pseudo-example',
    imports: [KbqLinkModule],
    template: `
        <span
            kbq-link
            pseudo
            role="button"
            (click)="runScan()"
            (keydown.enter)="runScan()"
            (keydown.space)="$event.preventDefault()"
            (keyup.space)="runScan()"
        >
            Run scan
        </span>
        <span>Scans run: {{ scans() }}</span>
    `,
    styles: `
        :host {
            display: flex;
            gap: var(--kbq-size-m);
            padding: var(--kbq-size-l);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkPseudoExample {
    protected readonly scans = signal(0);

    protected runScan(): void {
        this.scans.update((count) => count + 1);
    }
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { KbqFlagModule, KbqFlagShape } from '@koobiq/components/flag';

// A minimal inline SVG (Norway-like) is enough to exercise shape/shadow decoration without
// depending on a flag data package in the e2e app.
const sampleFlag = `<svg viewBox="0 0 22 16" xmlns="http://www.w3.org/2000/svg">
    <rect width="22" height="16" fill="#ef2b2d" />
    <rect x="6" width="4" height="16" fill="#fff" />
    <rect y="6" width="22" height="4" fill="#fff" />
    <rect x="7" width="2" height="16" fill="#002868" />
    <rect y="7" width="22" height="2" fill="#002868" />
</svg>`;

@Component({
    selector: 'e2e-flag-styles',
    imports: [KbqFlagModule],
    template: `
        <div>
            @for (shape of shapes; track shape) {
                <kbq-flag [shape]="shape" [innerHTML]="flag" />
            }
        </div>
        <div>
            <kbq-flag shadow="none" [innerHTML]="flag" />
            <kbq-flag shadow="inset" [innerHTML]="flag" />
            <kbq-flag stylized [innerHTML]="flag" />
            <kbq-flag empty />
        </div>
    `,
    styles: `
        :host {
            display: inline-flex;
            flex-direction: column;
            gap: var(--kbq-size-l);
            padding: var(--kbq-size-l);
            font-size: 48px;
        }

        :host > div {
            display: flex;
            align-items: center;
            gap: var(--kbq-size-l);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eFlagStyles'
    }
})
export class E2eFlagStyles {
    private readonly sanitizer = inject(DomSanitizer);
    protected readonly flag = this.sanitizer.bypassSecurityTrustHtml(sampleFlag);
    protected readonly shapes: KbqFlagShape[] = ['rectangle', 'square', 'circle'];
}

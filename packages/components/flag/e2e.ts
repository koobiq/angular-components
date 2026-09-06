import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { KbqFlagModule, KbqFlagShape } from '@koobiq/components/flag';

// A minimal inline SVG (Norway-like) is enough to exercise shape/shadow decoration without
// depending on a flag data package in the e2e app. Its 11:8 ratio matches none of the shapes, so
// every cell has to crop rather than letterbox.
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
                <kbq-flag decorative [shape]="shape" [svg]="flag" />
            }
            <!-- The same flag delivered as an image: it must crop exactly like the inline svg above. -->
            <kbq-flag decorative shape="square">
                <img alt="" [src]="flagSrc" />
            </kbq-flag>
        </div>
        <div>
            <kbq-flag decorative shadow="none" [svg]="flag" />
            <kbq-flag decorative shadow="inset" [svg]="flag" />
            <kbq-flag decorative empty />
            <kbq-flag decorative empty shape="circle" />
        </div>
        <div>
            <kbq-flag decorative class="e2e-flag-ratio" [svg]="flag" />
            <kbq-flag decorative class="e2e-flag-radius" [svg]="flag" />
        </div>
        <p class="e2e-flag-inline">
            <kbq-flag decorative [svg]="flag" />
            Norway borders
            <kbq-flag decorative [svg]="flag" />
            Sweden.
        </p>
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

        /* Both tokens are overridable from a plain class, without extra specificity. */
        .e2e-flag-ratio {
            --kbq-flag-aspect-ratio: 4 / 3;
        }

        .e2e-flag-radius {
            --kbq-flag-border-radius: var(--kbq-size-s);
        }

        /* The primary documented use: a flag sitting inline in body text. */
        .e2e-flag-inline {
            margin: 0;
            font-size: 16px;
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
    protected readonly flagSrc = `data:image/svg+xml;utf8,${encodeURIComponent(sampleFlag)}`;
    protected readonly shapes: KbqFlagShape[] = ['rectangle', 'square', 'circle'];
}

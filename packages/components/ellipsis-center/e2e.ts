import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqEllipsisCenterDirective } from './ellipsis-center.directive';

/**
 * Bare hosts — no file upload, no breadcrumbs, no host-supplied styles. The directive now ships its own
 * layout contract through `_CdkPrivateStyleLoader`, and nothing else in the e2e suite can tell whether that
 * loader fired: the file upload fixtures render inside a `.kbq-file-upload` wrapper, so they would pass on a
 * build where the styles never load.
 *
 * The split itself is the assertion. Without `white-space: pre` on the start span the text wraps inside the
 * cell instead of overflowing it, `scrollWidth` collapses onto `clientWidth`, and the directive concludes
 * everything fits — leaving the text unsplit and the tooltip disabled. Every case below is therefore a
 * behavioural check on the contract, not a screenshot of it.
 */
@Component({
    selector: 'e2e-ellipsis-center-overflow',
    imports: [KbqEllipsisCenterDirective],
    template: `
        <div class="cell">
            <span data-testid="ellipsisTruncated" [kbqEllipsisCenter]="longName"></span>
        </div>

        <div class="wide">
            <span data-testid="ellipsisFits" [kbqEllipsisCenter]="shortName"></span>
        </div>

        <div class="cell">
            <span
                data-testid="ellipsisBelowMinVisibleLength"
                [kbqEllipsisCenter]="shortEnoughToOverflow"
                [minVisibleLength]="80"
            ></span>
        </div>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
            padding: 16px;
            font-family: Arial, sans-serif;
            font-size: 14px;
        }

        /* Narrow enough that the name cannot fit, and a flex container so the host is a flex item — the
           arrangement the contract's min-width and max-width exist for. */
        .cell {
            display: flex;
            width: 200px;
        }

        .wide {
            display: flex;
            width: 600px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eEllipsisCenterOverflow'
    }
})
export class E2eEllipsisCenterOverflow {
    readonly longName = 'annual-report-for-the-fiscal-year-2024-final-approved.pdf';
    readonly shortName = 'report.pdf';

    /**
     * Overflows the cell — long enough that the two halves would be measurably different from the whole —
     * while staying under the `minVisibleLength` above, so it must still not be split.
     */
    readonly shortEnoughToOverflow = 'quarterly-summary-report-2024-final.pdf';
}

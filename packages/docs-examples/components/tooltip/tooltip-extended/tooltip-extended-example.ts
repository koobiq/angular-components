import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqDivider } from '@koobiq/components/divider';
import { KbqTable, KbqTableCellContent } from '@koobiq/components/table';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';

/**
 * @title Tooltip extended
 */
@Component({
    selector: 'tooltip-extended-example',
    imports: [
        KbqButtonModule,
        KbqTooltipTrigger,
        KbqDivider,
        KbqTable,
        KbqTableCellContent
    ],
    template: `
        <button
            kbq-button
            [kbqTooltip]="tooltipContent"
            [kbqTooltipClass]="'example__custom-extended-tooltip'"
            [kbqTooltipColor]="extendedTooltipPreferredColor"
            [kbqTrigger]="'click'"
            [kbqPlacement]="'bottom'"
        >
            Button with extended tooltip
        </button>

        <ng-template #tooltipContent>
            <div
                class="layout-row layout-gap-xs layout-padding-top-m layout-padding-bottom-s layout-padding-left-l layout-padding-right-l"
            >
                <span class="kbq-text-normal-strong">Confidence</span>
                <span class="kbq-mono-normal" style="color: var(--kbq-foreground-warning)">0,0001</span>
            </div>
            <kbq-divider />
            <table kbq-table class="layout-padding-bottom-l">
                <thead>
                    <tr>
                        <th class="layout-padding-left-l">Incident Type</th>
                        <th>Detected</th>
                        <th class="layout-padding-right-l">Updated</th>
                    </tr>
                </thead>
                <tbody>
                    @for (row of data; track $index) {
                        <tr>
                            <td class="layout-padding-left-l">{{ row.type }}</td>
                            <td class="kbq-tabular-normal">{{ row.detected }}</td>
                            <td class="kbq-tabular-normal layout-padding-right-l">{{ row.updated }}</td>
                        </tr>
                    }
                </tbody>
            </table>
        </ng-template>
    `,
    styles: `
        ::ng-deep .example__custom-extended-tooltip.kbq-tooltip {
            --kbq-tooltip-size-max-width: 480px;
            --kbq-tooltip-size-padding-vertical: 0;
            --kbq-tooltip-size-padding-horizontal: 0;
            width: 480px;
        }

        table {
            width: 100%;
        }

        tr > td {
            font-variant-numeric: slashed-zero;

            &:first-child {
                width: 45%;
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipExtendedExample {
    protected readonly extendedTooltipPreferredColor = KbqComponentColors.ContrastFade;

    protected readonly data = [
        {
            type: 'Malware Infection',
            detected: 'Feb 18, 15:30',
            updated: 'Feb 18, 15:33'
        },
        {
            type: 'Phishing Attack',
            detected: 'Feb 18, 15:33',
            updated: 'Feb 18, 15:33'
        },
        {
            type: 'Data Breach',
            detected: 'Feb 18, 15:33',
            updated: 'Feb 18, 15:33'
        },
        {
            type: 'DoS/DDoS Attack',
            detected: 'Feb 18, 15:33',
            updated: 'Feb 18, 15:33'
        }
    ];
}

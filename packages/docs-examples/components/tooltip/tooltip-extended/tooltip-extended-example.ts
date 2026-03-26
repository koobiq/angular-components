import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqDivider } from '@koobiq/components/divider';
import { KbqLink } from '@koobiq/components/link';
import { KbqTableModule } from '@koobiq/components/table';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Tooltip extended
 */
@Component({
    selector: 'tooltip-extended-example',
    imports: [
        KbqButtonModule,
        KbqToolTipModule,
        KbqDivider,
        KbqTableModule,
        KbqLink,
        NgOptimizedImage
    ],
    template: `
        <p class="layout-margin-no-top layout-margin-no-bottom">
            A low Earth orbit (LEO) is an
            <a
                kbq-link
                href="https://en.wikipedia.org/wiki/Geocentric_orbit"
                [kbqTooltip]="tooltipContent"
                [kbqTooltipClass]="'example__custom-tooltip'"
                [kbqTooltipArrow]="true"
                [kbqTooltipColor]="extendedTooltipPreferredColor"
            >
                orbit around
            </a>
            Earth with a period of 128 minutes or less (making at least 11.25 orbits per day) and an eccentricity less
            than 0.25. Most of the artificial objects in outer space are in LEO, peaking in number at an altitude around
            800 km (500 mi), while the farthest in LEO, before medium Earth orbit (MEO), have an altitude of 2,000
            kilometers, about one-third of the radius of Earth and near the beginning of the inner Van Allen radiation
            belt.
        </p>

        <button
            kbq-button
            [kbqTooltip]="tableContent"
            [kbqTooltipClass]="'example__custom-extended-tooltip'"
            [kbqTooltipColor]="extendedTooltipPreferredColor"
            [ignoreTooltipPointerEvents]="false"
        >
            Table Data
        </button>

        <ng-template #tooltipContent>
            <img
                class="example__custom-tooltip-img"
                ngSrc="./assets/images/tooltip/tooltip-example.webp"
                srcset="./assets/images/tooltip/tooltip-example@2x.webp 2x"
                width="296"
                height="222"
                alt="tooltip-example"
            />
            <div>
                A geocentric orbit, also known as an Earth-centered orbit, is the curved trajectory of an object, such
                as the Moon or thousands of artificial satellites and debris, around the planet Earth.
            </div>
        </ng-template>

        <ng-template #tableContent>
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
        ::ng-deep .example__custom-tooltip.kbq-tooltip {
            --kbq-tooltip-size-max-width: 320px;
            width: 320px;
        }

        ::ng-deep .example__custom-tooltip-img {
            border-radius: var(--kbq-size-xxs);
            background: #000101;
            min-width: 296px;
            min-height: 222px;
        }

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
    host: {
        class: 'layout-margin-5xl layout-column layout-align-center-start layout-gap-l'
    },
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

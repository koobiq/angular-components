import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Tooltip extended
 */
@Component({
    selector: 'tooltip-extended-example',
    imports: [
        KbqButtonModule,
        KbqToolTipModule
    ],
    template: `
        <button
            kbq-button
            [kbqTooltip]="tooltipContent"
            [kbqTooltipClass]="'custom-tooltip'"
            [kbqTooltipColor]="extendedTooltipPreferredColor"
        >
            Button with extended tooltip
        </button>

        <ng-template #tooltipContent>
            <div class="kbq-subheading">Extended tooltip header</div>
            <div>
                In computing, a denial-of-service attack (DoS attack) is a cyber-attack in which the perpetrator seeks
                to make a machine or network resource unavailable to its intended users by temporarily or indefinitely
                disrupting services of a host connected to a network. Denial of service is typically accomplished by
                flooding the targeted machine or resource with superfluous requests in an attempt to overload systems
                and prevent some or all legitimate requests from being fulfilled. The range of attacks varies widely,
                spanning from inundating a server with millions of requests to slow its performance, overwhelming a
                server with a substantial amount of invalid data, to submitting requests with an illegitimate IP
                address.
            </div>
        </ng-template>
    `,
    styles: `
        .custom-tooltip {
            max-width: 485px !important;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipExtendedExample {
    protected readonly extendedTooltipPreferredColor = KbqComponentColors.ContrastFade;
}

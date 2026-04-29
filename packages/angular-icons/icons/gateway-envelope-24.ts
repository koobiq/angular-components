import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-gateway-envelope-24,[kbqGatewayEnvelope24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M23 13.257a1.886 1.886 0 0 1-1.886 1.886h-7.857v1.832A3.145 3.145 0 0 1 12 23a3.143 3.143 0 0 1-1.257-6.025v-1.832H2.886A1.886 1.886 0 0 1 1 13.257V6.43l11 5.305 11-5.305z"
                />
                <path
                    d="M7.13 18.6a5.04 5.04 0 0 0 0 2.514H1.314A.315.315 0 0 1 1 20.799v-1.884c0-.174.141-.315.315-.315zM22.685 18.6c.174 0 .315.141.315.315v1.884c0 .174-.14.315-.315.315h-5.814a5.04 5.04 0 0 0 0-2.514zM21.114 1C22.155 1 23 1.845 23 2.886v1.45L12 9.643 1 4.336v-1.45C1 1.845 1.845 1 2.886 1z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqGatewayEnvelope24 extends KbqSvgIcon {}

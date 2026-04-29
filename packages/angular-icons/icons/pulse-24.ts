import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-pulse-24,[kbqPulse24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M11.94.837c.044-.145.252-.14.29.006l3.614 14.092 1.199-3.977a.3.3 0 0 1 .287-.212h6.37a.3.3 0 0 1 .3.298v1.79a.3.3 0 0 1-.3.299h-4.807l-3.081 10.742c-.044.144-.252.14-.29-.006L11.905 9.233 8.487 20.516a.15.15 0 0 1-.284.008L5.076 11.97l-.501.997a.3.3 0 0 1-.269.165H.3a.3.3 0 0 1-.3-.299v-1.79a.3.3 0 0 1 .3-.298h2.708l2.26-4.496a.15.15 0 0 1 .276.016l2.599 7.11z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqPulse24 extends KbqSvgIcon {}

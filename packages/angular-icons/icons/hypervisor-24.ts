import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-hypervisor-24,[kbqHypervisor24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M21.45 4.5a.3.3 0 0 1 .3.3v3.9a.3.3 0 0 1-.3.3h-3.9a.3.3 0 0 1-.3-.3V4.8a.3.3 0 0 1 .3-.3zM13.95 4.5a.3.3 0 0 1 .3.3v3.9a.3.3 0 0 1-.3.3h-3.9a.3.3 0 0 1-.3-.3V4.8a.3.3 0 0 1 .3-.3zM6.45 4.5a.3.3 0 0 1 .3.3v3.9a.3.3 0 0 1-.3.3h-3.9a.3.3 0 0 1-.3-.3V4.8a.3.3 0 0 1 .3-.3zM1.8 12A1.8 1.8 0 0 0 0 13.8v8.4A1.8 1.8 0 0 0 1.8 24h20.4a1.8 1.8 0 0 0 1.8-1.8v-8.4a1.8 1.8 0 0 0-1.8-1.8zm2.7 5.25a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3M21 16.5a.3.3 0 0 1-.3.3h-8.4a.3.3 0 0 1-.3-.3v-1.2a.3.3 0 0 1 .3-.3h8.4a.3.3 0 0 1 .3.3zm-9 4.2v-1.2a.3.3 0 0 1 .3-.3h8.4a.3.3 0 0 1 .3.3v1.2a.3.3 0 0 1-.3.3h-8.4a.3.3 0 0 1-.3-.3"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqHypervisor24 extends KbqSvgIcon {}

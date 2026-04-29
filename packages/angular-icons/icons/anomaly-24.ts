import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-anomaly-24,[kbqAnomaly24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M1.5 1.8a.3.3 0 0 1 .3-.3h8.874a.3.3 0 0 1 .3.3v8.874a.3.3 0 0 1-.3.3H1.8a.3.3 0 0 1-.3-.3zM1.5 13.326a.3.3 0 0 1 .3-.3h8.874a.3.3 0 0 1 .3.3V22.2a.3.3 0 0 1-.3.3H1.8a.3.3 0 0 1-.3-.3zM13.026 6.237a4.737 4.737 0 1 1 9.474 0 4.737 4.737 0 0 1-9.474 0M13.026 13.326a.3.3 0 0 1 .3-.3H22.2a.3.3 0 0 1 .3.3V22.2a.3.3 0 0 1-.3.3h-8.874a.3.3 0 0 1-.3-.3z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqAnomaly24 extends KbqSvgIcon {}

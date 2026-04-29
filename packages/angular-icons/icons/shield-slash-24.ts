import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-shield-slash-24,[kbqShieldSlash24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M21.145 22.417a.303.303 0 0 1-.43 0L.09 1.79a.303.303 0 0 1 0-.43L1.36.09a.303.303 0 0 1 .429 0l1.414 1.414Q3.25 1.5 3.3 1.5h17.4c.994 0 1.8.808 1.8 1.804v14.109a.3.3 0 0 1-.143.256l-1.848 1.139 1.908 1.908a.303.303 0 0 1 0 .429zM1.5 17.413V5.747l15.33 15.329-4.673 2.88a.3.3 0 0 1-.314 0l-10.2-6.287a.3.3 0 0 1-.143-.256"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqShieldSlash24 extends KbqSvgIcon {}

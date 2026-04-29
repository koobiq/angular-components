import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-speaker-wave-16,[kbqSpeakerWave16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M12.989 5.934a5.4 5.4 0 0 0-1.032-1.608.206.206 0 0 1 .003-.286l.848-.848a.196.196 0 0 1 .281.002 7 7 0 0 1 0 9.612.196.196 0 0 1-.28.002l-.85-.848a.206.206 0 0 1-.002-.286 5.4 5.4 0 0 0 1.032-5.74"
                />
                <path
                    d="M10.495 6.967a2.7 2.7 0 0 0-.45-.73.21.21 0 0 1 .006-.288l.848-.848a.193.193 0 0 1 .28.003 4.3 4.3 0 0 1 0 5.792.193.193 0 0 1-.28.003l-.848-.848a.21.21 0 0 1-.006-.288 2.7 2.7 0 0 0 .45-2.796M2.2 10.5H5l3.38 3.47c.063.064.17.019.17-.072V2.102c0-.09-.107-.136-.17-.072L5 5.5H2.2A1.2 1.2 0 0 0 1 6.7v2.6a1.2 1.2 0 0 0 1.2 1.2"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqSpeakerWave16 extends KbqSvgIcon {}

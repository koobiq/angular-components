import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-rectangle-vertical-bolt-24,[kbqRectangleVerticalBolt24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M4.8 0A1.8 1.8 0 0 0 3 1.8v20.4A1.8 1.8 0 0 0 4.8 24h14.4a1.8 1.8 0 0 0 1.8-1.8V1.8A1.8 1.8 0 0 0 19.2 0zm5.064 4.5h4.292c.108 0 .182.136.144.263l-1.663 5.572h3.709c.133 0 .203.2.114.324l-6.26 8.776c-.11.153-.309.014-.264-.184l1.36-5.999H7.653c-.105 0-.18-.13-.146-.256l2.21-8.363c.021-.08.08-.133.146-.133"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqRectangleVerticalBolt24 extends KbqSvgIcon {}

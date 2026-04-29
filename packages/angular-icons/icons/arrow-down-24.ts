import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrow-down-24,[kbqArrowDown24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="m13.18 17.997 5.257-5.28a.297.297 0 0 1 .422 0l1.278 1.284a.304.304 0 0 1 0 .428l-7.95 7.983a.297.297 0 0 1-.423 0l-7.95-7.983a.304.304 0 0 1 0-.428l1.278-1.283a.297.297 0 0 1 .422 0l5.258 5.279V1.802a.3.3 0 0 1 .299-.302h1.81a.3.3 0 0 1 .298.302z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowDown24 extends KbqSvgIcon {}

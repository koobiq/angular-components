import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqGripVertical24]',
    template: `
        <svg:g>
            <svg:path
                d="M5.7 1.8a.3.3 0 0 1 .3-.3h4.125a.3.3 0 0 1 .3.3v4.246a.3.3 0 0 1-.3.3H6a.3.3 0 0 1-.3-.3zM5.7 9.877a.3.3 0 0 1 .3-.3h4.125a.3.3 0 0 1 .3.3v4.246a.3.3 0 0 1-.3.3H6a.3.3 0 0 1-.3-.3zM5.7 17.954a.3.3 0 0 1 .3-.3h4.125a.3.3 0 0 1 .3.3V22.2a.3.3 0 0 1-.3.3H6a.3.3 0 0 1-.3-.3zM13.575 1.8a.3.3 0 0 1 .3-.3H18a.3.3 0 0 1 .3.3v4.246a.3.3 0 0 1-.3.3h-4.125a.3.3 0 0 1-.3-.3zM13.575 9.877a.3.3 0 0 1 .3-.3H18a.3.3 0 0 1 .3.3v4.246a.3.3 0 0 1-.3.3h-4.125a.3.3 0 0 1-.3-.3zM13.575 17.954a.3.3 0 0 1 .3-.3H18a.3.3 0 0 1 .3.3V22.2a.3.3 0 0 1-.3.3h-4.125a.3.3 0 0 1-.3-.3z"
            />
        </svg:g>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 24 24',
        width: '24',
        height: '24'
    }
})
export class KbqGripVertical24 extends KbqSvgIcon {}

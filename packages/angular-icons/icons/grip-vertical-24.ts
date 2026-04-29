import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-grip-vertical-24,[kbqGripVertical24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M5.7 1.8a.3.3 0 0 1 .3-.3h4.125a.3.3 0 0 1 .3.3v4.246a.3.3 0 0 1-.3.3H6a.3.3 0 0 1-.3-.3zM5.7 9.877a.3.3 0 0 1 .3-.3h4.125a.3.3 0 0 1 .3.3v4.246a.3.3 0 0 1-.3.3H6a.3.3 0 0 1-.3-.3zM5.7 17.954a.3.3 0 0 1 .3-.3h4.125a.3.3 0 0 1 .3.3V22.2a.3.3 0 0 1-.3.3H6a.3.3 0 0 1-.3-.3zM13.575 1.8a.3.3 0 0 1 .3-.3H18a.3.3 0 0 1 .3.3v4.246a.3.3 0 0 1-.3.3h-4.125a.3.3 0 0 1-.3-.3zM13.575 9.877a.3.3 0 0 1 .3-.3H18a.3.3 0 0 1 .3.3v4.246a.3.3 0 0 1-.3.3h-4.125a.3.3 0 0 1-.3-.3zM13.575 17.954a.3.3 0 0 1 .3-.3H18a.3.3 0 0 1 .3.3V22.2a.3.3 0 0 1-.3.3h-4.125a.3.3 0 0 1-.3-.3z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqGripVertical24 extends KbqSvgIcon {}

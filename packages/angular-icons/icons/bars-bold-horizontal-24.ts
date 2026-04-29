import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-bars-bold-horizontal-24,[kbqBarsBoldHorizontal24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M3 2.07C3 .927 3.806 0 4.8 0h14.4c.994 0 1.8.927 1.8 2.07v2.76c0 1.143-.806 2.07-1.8 2.07H4.8C3.806 6.9 3 5.973 3 4.83zM3 10.77c0-1.143.806-2.07 1.8-2.07h14.4c.994 0 1.8.927 1.8 2.07v2.76c0 1.143-.806 2.07-1.8 2.07H4.8c-.994 0-1.8-.927-1.8-2.07zM4.8 17.4c-.994 0-1.8.886-1.8 1.98v2.64C3 23.113 3.806 24 4.8 24h14.4c.994 0 1.8-.887 1.8-1.98v-2.64c0-1.094-.806-1.98-1.8-1.98z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqBarsBoldHorizontal24 extends KbqSvgIcon {}

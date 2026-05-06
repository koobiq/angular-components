import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqRectangleIp424]',
    template: `
        <svg:g>
            <svg:path
                d="M17.902 9.364V13.3h-2.513v-.073l2.44-3.862zM8.335 11.922V8.83h1.322c1.132 0 1.68.616 1.68 1.54 0 .919-.548 1.552-1.67 1.552z"
            />
            <svg:path
                d="M0 4.8A1.8 1.8 0 0 1 1.8 3h20.4A1.8 1.8 0 0 1 24 4.8v14.4a1.8 1.8 0 0 1-1.8 1.8H1.8A1.8 1.8 0 0 1 0 19.2zm13.415 8.526v1.344c0 .11.09.2.2.2h4.25v1.43c0 .11.09.2.2.2h1.475a.2.2 0 0 0 .2-.2v-1.43h.95a.2.2 0 0 0 .2-.2v-1.171a.2.2 0 0 0-.2-.2h-.95V7.427a.2.2 0 0 0-.2-.2h-2.144a.2.2 0 0 0-.169.093zM6.375 16.3c0 .11.089.2.2.2h1.56a.2.2 0 0 0 .2-.2v-2.807h1.648c2.133 0 3.373-1.272 3.373-3.124 0-1.842-1.218-3.142-3.323-3.142H6.574a.2.2 0 0 0-.2.2zm-1.559.2a.2.2 0 0 0 .2-.2V7.427a.2.2 0 0 0-.2-.2h-1.56a.2.2 0 0 0-.2.2V16.3c0 .11.09.2.2.2z"
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
export class KbqRectangleIp424 extends KbqSvgIcon {}

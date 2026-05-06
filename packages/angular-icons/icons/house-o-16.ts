import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqHouseO16]',
    template: `
        <svg:path
            d="M11.6 9.4H4.4v4H2.6V7.736L8 3.107l5.4 4.629V13.4h-1.8zM1.42 6.64a1.2 1.2 0 0 0-.42.912V14.8c0 .11.09.2.2.2h4.6a.2.2 0 0 0 .2-.2V11h4v3.8c0 .11.09.2.2.2h4.6a.2.2 0 0 0 .2-.2V7.552a1.2 1.2 0 0 0-.42-.911L8.13 1.11a.2.2 0 0 0-.26 0z"
        />
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 16 16',
        width: '16',
        height: '16'
    }
})
export class KbqHouseO16 extends KbqSvgIcon {}

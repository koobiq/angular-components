import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqPencilOnLine16]',
    template: `
        <svg:path
            d="M12.009.837c-.45-.45-1.18-.45-1.63 0l-.823.824 3.799 3.798.823-.823c.45-.45.45-1.18 0-1.63zm.53 5.437L8.742 2.475 3.515 7.701 7.314 11.5zm-10.535 6.51a.192.192 0 0 0 .228.227l4.1-.863-3.465-3.465zM1 15.8c0 .11.09.2.2.2h13.6a.2.2 0 0 0 .2-.2V14a.2.2 0 0 0-.2-.2H1.2a.2.2 0 0 0-.2.2z"
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
export class KbqPencilOnLine16 extends KbqSvgIcon {}

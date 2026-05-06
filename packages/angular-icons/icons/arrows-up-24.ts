import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowsUp24]',
    template: `
        <svg:path
            d="M8.109 1.588a.3.3 0 0 0-.426 0l-6.47 6.463a.3.3 0 0 0 0 .427L2.497 9.76a.3.3 0 0 0 .425 0l3.767-3.762v16.201c0 .167.134.302.3.302h1.815a.3.3 0 0 0 .301-.302V5.997l3.766 3.762a.3.3 0 0 0 .426 0l1.282-1.28a.3.3 0 0 0 0-.428zM15.197 22.5a.3.3 0 0 1-.301-.302V10.722l2.416-2.415v13.891a.3.3 0 0 1-.3.302zm2.116-16.503v2.225l-4.031-4.027 2.61-2.607a.3.3 0 0 1 .425 0l6.47 6.463a.3.3 0 0 1 0 .427L21.504 9.76a.3.3 0 0 1-.425 0z"
        />
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
export class KbqArrowsUp24 extends KbqSvgIcon {}

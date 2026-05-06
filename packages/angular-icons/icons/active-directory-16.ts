import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqActiveDirectory16]',
    template: `
        <svg:path
            d="M6 3c0 .421.13.812.352 1.134l-2.65 3.393a2 2 0 1 0 .496 3.475l1.903 1.37a2 2 0 1 0 3.799 0l1.902-1.37a2 2 0 1 0 .496-3.475l-2.65-3.393A2 2 0 1 0 6 3m2.6 1.908q.051-.015.102-.035l2.65 3.393a1.99 1.99 0 0 0-.251 1.762l-1.903 1.37a2 2 0 0 0-.598-.306zm-1.2 0v6.184c-.218.068-.42.172-.598.306L4.9 10.028a2 2 0 0 0-.251-1.762l2.65-3.393q.051.02.102.035"
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
export class KbqActiveDirectory16 extends KbqSvgIcon {}

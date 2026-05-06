import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqScale16]',
    template: `
        <svg:path
            d="M12.006 13.61a.2.2 0 0 0-.2-.2H8.804l.023-8.8 3.383-1.044v2.398h-2.002c-.11 0-.2.089-.194.198a2.97 2.97 0 0 0 .873 1.909 3.01 3.01 0 0 0 2.123.873c.796 0 1.56-.314 2.123-.873a2.97 2.97 0 0 0 .873-1.909.19.19 0 0 0-.194-.198h-2.001V1.677a.2.2 0 0 0-.26-.19L8.827 2.947V1.199a.2.2 0 0 0-.2-.199H7.426a.2.2 0 0 0-.2.199V3.44L2.342 4.948a.2.2 0 0 0-.14.19v3.806H.2c-.11 0-.2.089-.193.198a2.97 2.97 0 0 0 .872 1.91 3.01 3.01 0 0 0 2.123.872c.797 0 1.56-.314 2.123-.873a2.97 2.97 0 0 0 .873-1.909.19.19 0 0 0-.193-.198H3.803V6.308c0-.087.057-.164.14-.19l3.283-1.013-.024 8.306H4.2a.2.2 0 0 0-.2.198v1.192a.2.2 0 0 0 .2.2h7.606a.2.2 0 0 0 .2-.2z"
        />
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 17 16',
        width: '17',
        height: '16'
    }
})
export class KbqScale16 extends KbqSvgIcon {}

import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqScissors16]',
    template: `
        <svg:path
            d="M4.67 6.43A2.57 2.57 0 0 1 3.05 7C1.642 7 .5 5.88.5 4.5S1.642 2 3.05 2C4.46 2 5.6 3.12 5.6 4.5c0 .317-.06.62-.17.9l2.714 1.67 4.532-3.256a2.23 2.23 0 0 1 1.595-.318c.474.087.893.33 1.189.685.072.087.043.215-.053.274L9.65 7.998l5.756 3.543c.096.06.125.187.053.274a2 2 0 0 1-1.19.685 2.23 2.23 0 0 1-1.594-.318L8.144 8.926l-2.714 1.67c.11.28.17.583.17.9 0 1.38-1.141 2.5-2.55 2.5S.5 12.876.5 11.496s1.142-2.5 2.55-2.5c.615 0 1.18.214 1.62.57l2.182-1.568zM4.376 4.5c0-.718-.594-1.3-1.326-1.3s-1.326.582-1.326 1.3.594 1.3 1.326 1.3 1.326-.582 1.326-1.3M3.05 10.196c-.732 0-1.326.582-1.326 1.3s.594 1.3 1.326 1.3 1.326-.582 1.326-1.3-.594-1.3-1.326-1.3"
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
export class KbqScissors16 extends KbqSvgIcon {}

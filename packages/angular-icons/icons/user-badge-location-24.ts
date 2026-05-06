import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqUserBadgeLocation24]',
    template: `
        <svg:path
            d="M16.5 6.75c0 2.9-2.015 6-4.5 6s-4.5-3.1-4.5-6S9.515 1.5 12 1.5s4.5 2.35 4.5 5.25m-4.5 7.8c.858 0 1.64-.224 2.333-.589a6.04 6.04 0 0 0-.908 3.194c0 1.835 1.072 3.46 2.242 5.005l.257.34H3.241a.3.3 0 0 1-.293-.235L1.78 17.017a1.8 1.8 0 0 1 .831-1.934l4.924-2.955c1.017 1.31 2.552 2.422 4.464 2.422m7.493-1.662a4.27 4.27 0 0 0-4.268 4.268c0 1.16.683 2.34 1.877 3.917l2.114 2.793a.347.347 0 0 0 .553 0l2.114-2.793c1.194-1.576 1.877-2.757 1.877-3.917a4.27 4.27 0 0 0-4.268-4.268m0 2.052a2.054 2.054 0 1 1 0 4.108 2.054 2.054 0 0 1 0-4.108"
        />
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 24 25',
        width: '24',
        height: '25'
    }
})
export class KbqUserBadgeLocation24 extends KbqSvgIcon {}

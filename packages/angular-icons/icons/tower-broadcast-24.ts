import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqTowerBroadcast24]',
    template: `
        <svg:g>
            <svg:path
                d="M6.498 3.06a.314.314 0 0 1-.07.426 6.47 6.47 0 0 0-2.52 5.135c0 2.09.985 3.95 2.52 5.135a.314.314 0 0 1 .07.426l-1.035 1.49a.29.29 0 0 1-.414.07A8.9 8.9 0 0 1 1.5 8.622 8.9 8.9 0 0 1 5.049 1.5c.132-.1.32-.066.414.07zM13.204 13.577a5.1 5.1 0 0 0 3.87-4.956c0-2.816-2.271-5.1-5.074-5.1s-5.075 2.284-5.075 5.1c0 2.4 1.65 4.412 3.871 4.955v10.122a.3.3 0 0 0 .3.302h1.808a.3.3 0 0 0 .3-.302zM20.092 8.621c0-2.09-.985-3.95-2.52-5.135a.314.314 0 0 1-.07-.426l1.035-1.49a.29.29 0 0 1 .414-.07A8.9 8.9 0 0 1 22.5 8.621a8.9 8.9 0 0 1-3.549 7.121.29.29 0 0 1-.414-.07l-1.034-1.49a.314.314 0 0 1 .07-.426 6.47 6.47 0 0 0 2.52-5.135"
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
export class KbqTowerBroadcast24 extends KbqSvgIcon {}

import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-house-o-24,[kbqHouseO24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M17.4 14.1H6.6v6H3.9v-8.496L12 4.66l8.1 6.943V20.1h-2.7zM2.129 9.961a1.8 1.8 0 0 0-.629 1.367V22.2a.3.3 0 0 0 .3.3h6.9a.3.3 0 0 0 .3-.3v-5.7h6v5.7a.3.3 0 0 0 .3.3h6.9a.3.3 0 0 0 .3-.3V11.328a1.8 1.8 0 0 0-.629-1.367l-9.676-8.294a.3.3 0 0 0-.39 0z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqHouseO24 extends KbqSvgIcon {}

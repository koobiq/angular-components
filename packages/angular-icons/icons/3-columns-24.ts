import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-3-columns-24,[kbq3Columns24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M20.7 1.5a1.8 1.8 0 0 1 1.8 1.8v17.4a1.8 1.8 0 0 1-1.8 1.8H3.3a1.8 1.8 0 0 1-1.8-1.8V3.3a1.8 1.8 0 0 1 1.8-1.8zM10.096 20.1h3.81V3.9h-3.81zm6.21 0H19.8c.166 0 .3-.134.3-.3V4.2c0-.166-.134-.3-.3-.3h-3.495zM4.2 3.9c-.166 0-.3.134-.3.3v15.6c0 .166.134.3.3.3h3.496V3.9z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Kbq3Columns24 extends KbqSvgIcon {}

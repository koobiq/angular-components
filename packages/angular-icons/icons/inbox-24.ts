import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqInbox24]',
    template: `
        <svg:path
            d="M3.3 3a1.8 1.8 0 0 0-1.8 1.8v14.4A1.8 1.8 0 0 0 3.3 21h17.4a1.8 1.8 0 0 0 1.8-1.8V4.8A1.8 1.8 0 0 0 20.7 3zm.6 10.504V5.7a.3.3 0 0 1 .3-.3h15.6a.3.3 0 0 1 .3.3v7.804h-4.9c-.11 0-.2.09-.207.2a3 3 0 0 1-5.986 0 .21.21 0 0 0-.207-.2z"
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
export class KbqInbox24 extends KbqSvgIcon {}

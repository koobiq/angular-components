import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-inbox-24,[kbqInbox24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M3.3 3a1.8 1.8 0 0 0-1.8 1.8v14.4A1.8 1.8 0 0 0 3.3 21h17.4a1.8 1.8 0 0 0 1.8-1.8V4.8A1.8 1.8 0 0 0 20.7 3zm.6 10.504V5.7a.3.3 0 0 1 .3-.3h15.6a.3.3 0 0 1 .3.3v7.804h-4.9c-.11 0-.2.09-.207.2a3 3 0 0 1-5.986 0 .21.21 0 0 0-.207-.2z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqInbox24 extends KbqSvgIcon {}

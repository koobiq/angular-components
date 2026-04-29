import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-desktop-multiple-24,[kbqDesktopMultiple24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M20.7 1.5a1.8 1.8 0 0 1 1.8 1.8v8.4a1.8 1.8 0 0 1-1.8 1.8h-.598V9.602L20.1 5.704a1.8 1.8 0 0 0-1.8-1.8l-6.151-.002L5.998 3.9v-.6a1.8 1.8 0 0 1 1.8-1.8z"
                />
                <path
                    d="M18.3 7.5a1.8 1.8 0 0 0-1.8-1.8H3.3a1.8 1.8 0 0 0-1.8 1.8v8.4a1.8 1.8 0 0 0 1.8 1.8h4.5v2.4H4.2a.3.3 0 0 0-.3.3v1.8a.3.3 0 0 0 .3.3h11.25a.3.3 0 0 0 .3-.3v-1.8a.3.3 0 0 0-.3-.3h-3.6v-2.4h4.65a1.8 1.8 0 0 0 1.8-1.8z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqDesktopMultiple24 extends KbqSvgIcon {}

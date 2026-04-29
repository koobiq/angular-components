import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-circle-pause-16,[kbqCirclePause16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14M7 4.9v6.2a.2.2 0 0 1-.2.2H5.6a.2.2 0 0 1-.2-.2V4.9c0-.11.09-.2.2-.2h1.2c.11 0 .2.09.2.2m3.6 0v6.2a.2.2 0 0 1-.2.2H9.2a.2.2 0 0 1-.2-.2V4.9c0-.11.09-.2.2-.2h1.2c.11 0 .2.09.2.2"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCirclePause16 extends KbqSvgIcon {}

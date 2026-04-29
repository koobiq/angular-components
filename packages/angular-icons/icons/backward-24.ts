import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-backward-24,[kbqBackward24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M1.5 4.8a.3.3 0 0 1 .3-.3h2.4a.3.3 0 0 1 .3.3v14.4a.3.3 0 0 1-.3.3H1.8a.3.3 0 0 1-.3-.3zM14.034 11.772a.3.3 0 0 0 0 .456l7.972 6.839a.3.3 0 0 0 .495-.228V5.161a.3.3 0 0 0-.495-.228zM5.034 11.772a.3.3 0 0 0 0 .456l7.972 6.839a.3.3 0 0 0 .495-.228V5.161a.3.3 0 0 0-.495-.228z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqBackward24 extends KbqSvgIcon {}

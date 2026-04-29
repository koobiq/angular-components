import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-forward-24,[kbqForward24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M22.501 4.8a.3.3 0 0 0-.3-.3h-2.4a.3.3 0 0 0-.3.3v14.4a.3.3 0 0 0 .3.3h2.4a.3.3 0 0 0 .3-.3zM9.967 11.772a.3.3 0 0 1 0 .456l-7.972 6.839a.3.3 0 0 1-.495-.228V5.161a.3.3 0 0 1 .495-.228zM18.967 11.772a.3.3 0 0 1 0 .456l-7.972 6.839a.3.3 0 0 1-.495-.228V5.161a.3.3 0 0 1 .495-.228z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqForward24 extends KbqSvgIcon {}

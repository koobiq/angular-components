import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-check-badge-auto-24,[kbqCheckBadgeAuto24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M9.22 15.822a.296.296 0 0 0 .422 0l10.566-10.66a.3.3 0 0 0 0-.424l-1.264-1.275a.296.296 0 0 0-.421 0l-9.092 9.172-5.034-5.078a.296.296 0 0 0-.421 0L2.712 8.83a.3.3 0 0 0 0 .425zM21.356 20.22a.3.3 0 0 1-.28.405H19.76a.3.3 0 0 1-.282-.206l-.556-1.693H15.7l-.543 1.691a.3.3 0 0 1-.284.208h-1.316a.3.3 0 0 1-.28-.405l3.106-8.413a.3.3 0 0 1 .28-.196h1.296c.124 0 .235.078.279.196zm-4.039-6.442-1.14 3.49h2.267z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCheckBadgeAuto24 extends KbqSvgIcon {}

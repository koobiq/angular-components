import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-bell-24,[kbqBell24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M13.67 2.634q.014-.106.014-.217c0-.92-.754-1.667-1.684-1.667a1.676 1.676 0 0 0-1.67 1.884A6.55 6.55 0 0 0 5.474 8.97v5.634l-3.104 2.428a.3.3 0 0 0-.115.235l-.003.701a.3.3 0 0 0 .3.302H21.45a.3.3 0 0 0 .3-.302l-.003-.701a.3.3 0 0 0-.115-.235l-3.103-2.428v.002V8.97a6.55 6.55 0 0 0-4.858-6.336M15.022 20.077c0 1.752-1.348 3.173-3.011 3.173S9 21.83 9 20.076z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqBell24 extends KbqSvgIcon {}

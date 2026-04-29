import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-connection-16,[kbqConnection16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M14.268 5.268a2.5 2.5 0 1 0-3.536-3.536 2.5 2.5 0 0 0 3.536 3.536M8.03 9.03l-1.5 1.5L5.4 9.4l1.5-1.5zM10.53 6.53l-1.5 1.5L7.9 6.9l1.5-1.5zM5.268 10.733a2.5 2.5 0 1 1-3.536 3.535 2.5 2.5 0 0 1 3.536-3.536m-.849.848a1.3 1.3 0 1 0-1.838 1.838 1.3 1.3 0 0 0 1.838-1.838"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqConnection16 extends KbqSvgIcon {}

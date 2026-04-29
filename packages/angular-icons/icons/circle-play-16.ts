import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-circle-play-16,[kbqCirclePlay16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14m3.628-7.26a.296.296 0 0 1 0 .52l-5.476 2.954a.295.295 0 0 1-.435-.26V5.046c0-.224.238-.366.435-.26z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCirclePlay16 extends KbqSvgIcon {}

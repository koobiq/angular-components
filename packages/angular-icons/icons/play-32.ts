import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-play-32,[kbqPlay32]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
            <path
                d="M7 6.355c0-1.036.797-1.676 1.686-1.143l16.075 9.645a1.333 1.333 0 0 1 0 2.287L8.686 26.789C7.797 27.322 7 26.682 7 25.646z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqPlay32 extends KbqSvgIcon {}

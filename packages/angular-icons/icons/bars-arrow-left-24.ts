import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-bars-arrow-left-24,[kbqBarsArrowLeft24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M22.5 18.9a.3.3 0 0 0-.3-.3h-9.9a.3.3 0 0 0-.3.3v1.8a.3.3 0 0 0 .3.3h9.9a.3.3 0 0 0 .3-.3zM.24 11.788a.3.3 0 0 0 0 .424l6.424 6.424a.3.3 0 0 0 .424 0l1.273-1.272a.3.3 0 0 0 0-.424l-3.483-3.484a.15.15 0 0 1 .106-.256H22.2a.3.3 0 0 0 .3-.3v-1.8a.3.3 0 0 0-.3-.3H4.984a.15.15 0 0 1-.106-.256L8.362 7.06a.3.3 0 0 0 0-.424L7.087 5.364a.3.3 0 0 0-.424 0zM22.5 3.3a.3.3 0 0 0-.3-.3h-9.9a.3.3 0 0 0-.3.3v1.8a.3.3 0 0 0 .3.3h9.9a.3.3 0 0 0 .3-.3z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqBarsArrowLeft24 extends KbqSvgIcon {}

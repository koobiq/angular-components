import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-behance-24,[kbqBehance24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g clip-path="url(#a)">
                <path
                    d="M22 6.5h-7v-2h7zm1.726 10c-.442 1.297-2.03 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219m-9.574 6.988H0V4.521h6.953c5.476.081 5.58 5.444 2.72 6.906 3.46 1.26 3.577 8.061-3.207 8.061M3 10.5h3.584c2.508 0 2.906-3-.312-3H3zm3.39 3H3v3.016h3.34c3.056 0 2.869-3.016.05-3.016"
                />
            </g>
            <defs>
                <clipPath id="a"><path d="M0 0h24v24H0z" /></clipPath>
            </defs>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqBehance24 extends KbqSvgIcon {}

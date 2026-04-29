import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-square-multiple-o-24,[kbqSquareMultipleO24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M8.4 3.9H6v-.6a1.8 1.8 0 0 1 1.8-1.8h12.9a1.8 1.8 0 0 1 1.8 1.8v12.9a1.8 1.8 0 0 1-1.8 1.8h-.6V4.2a.3.3 0 0 0-.3-.3H8.4"
                />
                <path
                    d="M1.5 7.8A1.8 1.8 0 0 1 3.3 6h12.9A1.8 1.8 0 0 1 18 7.8v12.9a1.8 1.8 0 0 1-1.8 1.8H3.3a1.8 1.8 0 0 1-1.8-1.8zm2.7.6a.3.3 0 0 0-.3.3v11.1a.3.3 0 0 0 .3.3h11.1a.3.3 0 0 0 .3-.3V8.7a.3.3 0 0 0-.3-.3z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqSquareMultipleO24 extends KbqSvgIcon {}

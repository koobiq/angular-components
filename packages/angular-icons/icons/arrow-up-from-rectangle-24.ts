import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrow-up-from-rectangle-24,[kbqArrowUpFromRectangle24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M10.8 6.094 8.495 8.4a.3.3 0 0 1-.424 0L6.798 7.126a.3.3 0 0 1 0-.424l4.99-4.99a.3.3 0 0 1 .424 0l4.99 4.99a.3.3 0 0 1 0 .424l-1.273 1.273a.3.3 0 0 1-.424 0L13.2 6.094v11.053a.3.3 0 0 1-.3.3h-1.8a.3.3 0 0 1-.3-.3z"
                />
                <path
                    d="M9 10.5H3.3a1.8 1.8 0 0 0-1.8 1.8v8.4a1.8 1.8 0 0 0 1.8 1.8h17.4a1.8 1.8 0 0 0 1.8-1.8v-8.4a1.8 1.8 0 0 0-1.8-1.8H15v2.4h4.8a.3.3 0 0 1 .3.3v6.6a.3.3 0 0 1-.3.3H4.2a.3.3 0 0 1-.3-.3v-6.6a.3.3 0 0 1 .3-.3H9z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowUpFromRectangle24 extends KbqSvgIcon {}

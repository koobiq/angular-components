import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrow-right-to-rectangle-24,[kbqArrowRightToRectangle24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M6 3.3V9h2.4V4.2a.3.3 0 0 1 .3-.3h11.1a.3.3 0 0 1 .3.3v15.6a.3.3 0 0 1-.3.3H8.7a.3.3 0 0 1-.3-.3V15H6v5.7a1.8 1.8 0 0 0 1.8 1.8h12.9a1.8 1.8 0 0 0 1.8-1.8V3.3a1.8 1.8 0 0 0-1.8-1.8H7.8A1.8 1.8 0 0 0 6 3.3"
                />
                <path
                    d="m11.223 8.49 2.304 2.304H1.787a.3.3 0 0 0-.287.213v1.974a.3.3 0 0 0 .287.213h11.74L11.223 15.5a.3.3 0 0 0 0 .424l1.272 1.273a.3.3 0 0 0 .425 0l4.99-4.99a.3.3 0 0 0 0-.424l-4.99-4.99a.3.3 0 0 0-.425 0l-1.272 1.273a.3.3 0 0 0 0 .425"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowRightToRectangle24 extends KbqSvgIcon {}

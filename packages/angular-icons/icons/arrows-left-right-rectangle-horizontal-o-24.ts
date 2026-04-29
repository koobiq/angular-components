import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrows-left-right-rectangle-horizontal-o-24,[kbqArrowsLeftRightRectangleHorizontalO24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M14.166 7.8c0-.124.145-.194.247-.12l5.775 4.2c.083.06.083.18 0 .24l-5.775 4.2c-.102.074-.247.004-.247-.12v-3H9.834v3c0 .124-.145.194-.247.12l-5.775-4.2a.147.147 0 0 1 0-.24l5.775-4.2c.102-.074.247-.004.247.12v3h4.332z"
                />
                <path
                    d="M0 4.8A1.8 1.8 0 0 1 1.8 3h20.4A1.8 1.8 0 0 1 24 4.8v14.4a1.8 1.8 0 0 1-1.8 1.8H1.8A1.8 1.8 0 0 1 0 19.2zm2.7 13.8h18.6a.3.3 0 0 0 .3-.3V5.7a.3.3 0 0 0-.3-.3H2.7a.3.3 0 0 0-.3.3v12.6a.3.3 0 0 0 .3.3"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowsLeftRightRectangleHorizontalO24 extends KbqSvgIcon {}

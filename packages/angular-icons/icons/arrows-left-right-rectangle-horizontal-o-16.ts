import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrows-left-right-rectangle-horizontal-o-16,[kbqArrowsLeftRightRectangleHorizontalO16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M9.444 5.2c0-.082.097-.13.165-.08l3.85 2.8c.055.04.055.12 0 .16l-3.85 2.8c-.068.05-.165.002-.165-.08v-2H6.556v2c0 .082-.097.13-.165.08l-3.85-2.8a.098.098 0 0 1 0-.16l3.85-2.8c.068-.05.165-.002.165.08v2h2.888z"
                />
                <path
                    d="M0 3.2A1.2 1.2 0 0 1 1.2 2h13.6A1.2 1.2 0 0 1 16 3.2v9.6a1.2 1.2 0 0 1-1.2 1.2H1.2A1.2 1.2 0 0 1 0 12.8zm1.8 9.2h12.4a.2.2 0 0 0 .2-.2V3.8a.2.2 0 0 0-.2-.2H1.8a.2.2 0 0 0-.2.2v8.4c0 .11.09.2.2.2"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowsLeftRightRectangleHorizontalO16 extends KbqSvgIcon {}

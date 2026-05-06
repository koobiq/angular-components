import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqFileBadgeArrowLeftO24]',
    template: `
        <svg:path
            d="M21 6.124a.3.3 0 0 0-.088-.212L15.088.088A.3.3 0 0 0 14.876 0H4.8A1.8 1.8 0 0 0 3 1.8v11.08a.2.2 0 0 0 .302.172l1.791-1.058q.088-.051.18-.093a.21.21 0 0 0 .127-.192V2.7a.3.3 0 0 1 .3-.3h7.6c.11 0 .2.09.2.2v4.6a.3.3 0 0 0 .3.3h4.6c.11 0 .2.09.2.2v13.6a.3.3 0 0 1-.3.3H8.569a.05.05 0 0 0-.05.047V23.8c0 .11.09.2.2.2H19.2a1.8 1.8 0 0 0 1.8-1.8zM.144 17.496a.281.281 0 0 1 0-.491l5.864-3.46c.205-.121.47.018.47.245v2.101c0 .11.09.2.2.2h5.015c.17 0 .307.13.307.29v1.738c0 .16-.137.29-.307.29H6.678a.2.2 0 0 0-.2.2v2.101c0 .227-.265.366-.47.245z"
        />
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 24 24',
        width: '24',
        height: '24'
    }
})
export class KbqFileBadgeArrowLeftO24 extends KbqSvgIcon {}

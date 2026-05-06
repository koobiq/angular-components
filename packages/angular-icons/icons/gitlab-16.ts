import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqGitlab16]',
    template: `
        <svg:path
            d="m14.84 6.58-.02-.05-1.926-5.028a.5.5 0 0 0-.498-.315.5.5 0 0 0-.29.108.5.5 0 0 0-.17.26l-1.301 3.979H5.369l-1.3-3.98a.505.505 0 0 0-.96-.052L1.18 6.526l-.018.051a3.58 3.58 0 0 0 1.186 4.134l.007.005.017.013 2.934 2.197 1.452 1.098.884.668a.594.594 0 0 0 .72 0l.883-.668 1.452-1.098 2.952-2.21.007-.007A3.58 3.58 0 0 0 14.84 6.58"
        />
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 16 16',
        width: '16',
        height: '16'
    }
})
export class KbqGitlab16 extends KbqSvgIcon {}

import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqRectangleCheckered24]',
    template: `
        <svg:path
            d="M.3 3a.3.3 0 0 0-.3.3V6h5.7a.3.3 0 0 1 .3.3V12H0v8.7a.3.3 0 0 0 .3.3h23.4a.3.3 0 0 0 .3-.3V18h-5.7a.3.3 0 0 1-.3-.3V12h6V3.3a.3.3 0 0 0-.3-.3zM12 12V6.3a.3.3 0 0 1 .3-.3h5.4a.3.3 0 0 1 .3.3V12zm0 0v5.7a.3.3 0 0 1-.3.3H6.3a.3.3 0 0 1-.3-.3V12z"
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
export class KbqRectangleCheckered24 extends KbqSvgIcon {}

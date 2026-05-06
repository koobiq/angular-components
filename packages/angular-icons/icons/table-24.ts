import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqTable24]',
    template: `
        <svg:path
            d="M22.2 21c.994 0 1.8-.868 1.8-1.939V4.893C23.977 3.843 23.18 3 22.2 3H1.8C.82 3 .022 3.844 0 4.893v14.169C0 20.132.806 21 1.8 21zM2.4 7.807a.3.3 0 0 1 .3-.3h8.094a.3.3 0 0 1 .3.3v4.043a.3.3 0 0 1-.3.3H2.7a.3.3 0 0 1-.3-.3zm0 6.443a.3.3 0 0 1 .3-.3h8.094a.3.3 0 0 1 .3.3v4.05a.3.3 0 0 1-.3.3H2.7a.3.3 0 0 1-.3-.3zm10.806-6.743H21.3a.3.3 0 0 1 .3.3v4.043a.3.3 0 0 1-.3.3h-8.094a.3.3 0 0 1-.3-.3V7.807a.3.3 0 0 1 .3-.3m-.3 6.743a.3.3 0 0 1 .3-.3H21.3a.3.3 0 0 1 .3.3v4.05a.3.3 0 0 1-.3.3h-8.094a.3.3 0 0 1-.3-.3z"
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
export class KbqTable24 extends KbqSvgIcon {}

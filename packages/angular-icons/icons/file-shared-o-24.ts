import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqFileSharedO24]',
    template: `
        <svg:g>
            <svg:path
                d="M14.876 0a.3.3 0 0 1 .212.088l5.824 5.824a.3.3 0 0 1 .088.212V22.2a1.8 1.8 0 0 1-1.8 1.8H4.8A1.8 1.8 0 0 1 3 22.2V1.8A1.8 1.8 0 0 1 4.8 0zM13.5 2.4H5.7a.3.3 0 0 0-.3.3v18.6a.3.3 0 0 0 .3.3h12.6a.3.3 0 0 0 .3-.3V7.5h-4.8a.3.3 0 0 1-.3-.3z"
            />
            <svg:path
                d="m10.086 16.382 2.612 1.425a1.789 1.789 0 1 0 .49-.897l-2.612-1.425c.052-.246.052-.5 0-.745l2.612-1.425a1.788 1.788 0 1 0-.49-.897l-2.612 1.425a1.79 1.79 0 1 0 0 2.54"
            />
        </svg:g>
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
export class KbqFileSharedO24 extends KbqSvgIcon {}

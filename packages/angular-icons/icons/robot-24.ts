import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqRobot24]',
    template: `
        <svg:g>
            <svg:path
                d="M7.35 9.75a.3.3 0 0 0-.3.3v3.15a.3.3 0 0 0 .3.3h3.15a.3.3 0 0 0 .3-.3v-3.15a.3.3 0 0 0-.3-.3zM13.2 10.05a.3.3 0 0 1 .3-.3h3.15a.3.3 0 0 1 .3.3v3.15a.3.3 0 0 1-.3.3H13.5a.3.3 0 0 1-.3-.3z"
            />
            <svg:path
                d="M7.8 0a.3.3 0 0 0-.3.3v1.8a.3.3 0 0 0 .3.3h3v2.1h-6A1.8 1.8 0 0 0 3 6.3v3.3H1.05a.3.3 0 0 0-.3.3v4.8a.3.3 0 0 0 .3.3H3v4.2A1.8 1.8 0 0 0 4.8 21h14.403a1.8 1.8 0 0 0 1.8-1.8V15h1.95q.107-.001.187-.066a.3.3 0 0 0 .113-.234V9.9a.3.3 0 0 0-.188-.279.3.3 0 0 0-.112-.021h-1.95V6.3a1.8 1.8 0 0 0-1.8-1.8H13.2V.3a.3.3 0 0 0-.3-.3zM5.4 7.2a.3.3 0 0 1 .3-.3h12.603a.3.3 0 0 1 .3.3v11.1a.3.3 0 0 1-.3.3H15v-1.8a.3.3 0 0 0-.3-.3H9.3a.3.3 0 0 0-.3.3v1.8H5.7a.3.3 0 0 1-.3-.3z"
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
export class KbqRobot24 extends KbqSvgIcon {}

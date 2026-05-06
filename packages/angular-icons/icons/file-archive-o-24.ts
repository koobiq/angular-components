import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqFileArchiveO24]',
    template: `
        <svg:g>
            <svg:path
                d="M9.75 4.8a.3.3 0 0 0-.3-.3H7.8a.3.3 0 0 0-.3.3v1.65a.3.3 0 0 0 .3.3h1.95V9H7.8a.3.3 0 0 0-.3.3v1.65a.3.3 0 0 0 .3.3h1.95v2.25H7.8a.3.3 0 0 0-.3.3v3.9a1.8 1.8 0 0 0 1.8 1.8h.103a1.8 1.8 0 0 0 1.685-2.432L9.75 13.5h1.95a.3.3 0 0 0 .3-.3v-1.65a.3.3 0 0 0-.3-.3H9.75V9h1.95a.3.3 0 0 0 .3-.3V7.05a.3.3 0 0 0-.3-.3H9.75z"
            />
            <svg:path
                d="M21 6.124a.3.3 0 0 0-.088-.212L15.088.088A.3.3 0 0 0 14.876 0H4.8A1.8 1.8 0 0 0 3 1.8v20.4A1.8 1.8 0 0 0 4.8 24h14.4a1.8 1.8 0 0 0 1.8-1.8zM5.4 2.7a.3.3 0 0 1 .3-.3h7.8v4.8a.3.3 0 0 0 .3.3h4.8v13.8a.3.3 0 0 1-.3.3H5.7a.3.3 0 0 1-.3-.3z"
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
export class KbqFileArchiveO24 extends KbqSvgIcon {}

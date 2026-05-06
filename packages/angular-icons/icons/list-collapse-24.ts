import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqListCollapse24]',
    template: `
        <svg:g>
            <svg:path
                d="M6.584 4.16V.674a.3.3 0 0 0-.3-.3h-1.8a.3.3 0 0 0-.3.3v3.484H1.801c-.236 0-.38.26-.255.462l3.584 5.763a.3.3 0 0 0 .509 0l3.583-5.763a.302.302 0 0 0-.254-.462zM12.446 5.34a.3.3 0 0 1-.3-.3v-1.8a.3.3 0 0 1 .3-.3h9.753a.3.3 0 0 1 .3.3v1.8a.3.3 0 0 1-.3.3zM22.5 12.84a.3.3 0 0 1-.3.3H9.3a.3.3 0 0 1-.3-.3v-1.8a.3.3 0 0 1 .3-.3h12.9a.3.3 0 0 1 .3.3zM22.2 20.94a.3.3 0 0 0 .3-.3v-1.8a.3.3 0 0 0-.3-.3h-9.752a.3.3 0 0 0-.3.3v1.8a.3.3 0 0 0 .3.3zM4.184 19.84v3.485a.3.3 0 0 0 .3.3h1.8a.3.3 0 0 0 .3-.3v-3.484h2.384c.236 0 .38-.26.254-.462L5.64 13.616a.3.3 0 0 0-.51 0l-3.583 5.763c-.125.201.019.462.254.462z"
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
export class KbqListCollapse24 extends KbqSvgIcon {}

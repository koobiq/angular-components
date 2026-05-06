import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqNorthStar24]',
    template: `
        <svg:path
            d="M11.1 22.5a.3.3 0 0 1-.3-.3v-7.445l-3.374 3.374a.3.3 0 0 1-.425 0L5.73 16.856a.3.3 0 0 1 0-.424L8.96 13.2H1.8a.3.3 0 0 1-.3-.3v-1.8a.3.3 0 0 1 .3-.3h7.445L5.73 7.283a.3.3 0 0 1 0-.424L7 5.586a.3.3 0 0 1 .425 0L10.8 8.961V1.8a.3.3 0 0 1 .3-.3h1.8a.3.3 0 0 1 .3.3v7.16l3.374-3.374a.3.3 0 0 1 .425 0L18.27 6.86a.3.3 0 0 1 0 .424L14.755 10.8H22.2a.3.3 0 0 1 .3.3v1.8a.3.3 0 0 1-.3.3h-7.16l3.231 3.232a.3.3 0 0 1 0 .424L17 18.13a.3.3 0 0 1-.425 0L13.2 14.755V22.2a.3.3 0 0 1-.3.3z"
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
export class KbqNorthStar24 extends KbqSvgIcon {}

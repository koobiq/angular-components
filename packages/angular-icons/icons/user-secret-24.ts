import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqUserSecret24]',
    template: `
        <svg:path
            d="M19.15 3.725 20.255 9.9H22.2a.3.3 0 0 1 .3.3v1.2a.3.3 0 0 1-.3.3H1.8a.3.3 0 0 1-.3-.3v-1.2a.3.3 0 0 1 .3-.3h1.946L4.85 3.725A2.7 2.7 0 0 1 7.507 1.5h8.986a2.7 2.7 0 0 1 2.658 2.225M10.41 17.1a4.502 4.502 0 0 0-8.91.9 4.5 4.5 0 0 0 8.91.9h3.18a4.502 4.502 0 0 0 8.91-.9 4.5 4.5 0 0 0-8.91-.9z"
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
export class KbqUserSecret24 extends KbqSvgIcon {}

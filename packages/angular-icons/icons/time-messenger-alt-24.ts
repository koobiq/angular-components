import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqTimeMessengerAlt24]',
    template: `
        <svg:path
            d="M18 1.5A4.5 4.5 0 0 1 22.5 6v12a4.5 4.5 0 0 1-4.5 4.5H6A4.5 4.5 0 0 1 1.5 18V6A4.5 4.5 0 0 1 6 1.5zM9.238 7.872c-1.555-2.186-4.745-.961-4.745 1.816v4.316c0 2.778 3.19 4 4.745 1.815l.04-.054 2.715-3.913-2.716-3.924zM19.5 9.552c0-2.776-3.19-4-4.745-1.815l-.04.057L12 11.722l2.716 3.924.039.053c1.555 2.182 4.745.96 4.745-1.825z"
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
export class KbqTimeMessengerAlt24 extends KbqSvgIcon {}

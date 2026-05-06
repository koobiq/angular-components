import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqMagnifyingGlassBadgeSparkles16]',
    template: `
        <svg:g>
            <svg:path
                d="M6.765 1.25q.53.001 1.034.099c-.408.427-.73.938-.934 1.504l-.1-.001a3.906 3.906 0 0 0 0 7.81 3.9 3.9 0 0 0 3.475-2.127q.32.05.655.05.579-.001 1.113-.147a5.5 5.5 0 0 1-.824 1.606l3.515 3.515a.2.2 0 0 1 0 .283l-.85.85a.2.2 0 0 1-.283 0l-3.515-3.516A5.507 5.507 0 1 1 6.765 1.25"
            />
            <svg:path
                d="M10.791 1.16c.062-.213.363-.213.425 0l.391 1.339a1.77 1.77 0 0 0 1.203 1.202l1.34.392c.211.062.211.362 0 .425l-1.34.391a1.77 1.77 0 0 0-1.203 1.202l-.391 1.34c-.062.212-.363.212-.425 0l-.392-1.34A1.77 1.77 0 0 0 9.197 4.91l-1.34-.391c-.212-.063-.212-.363 0-.425l1.34-.392A1.77 1.77 0 0 0 10.4 2.5z"
            />
        </svg:g>
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
export class KbqMagnifyingGlassBadgeSparkles16 extends KbqSvgIcon {}

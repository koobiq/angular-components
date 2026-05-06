import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqBellSlash24]',
    template: `
        <svg:g>
            <svg:path
                d="M21.356 23.038a.3.3 0 0 0 .424 0l1.258-1.258a.3.3 0 0 0 0-.425l-3.14-3.14h1.467a.3.3 0 0 0 .3-.3v-.685a.3.3 0 0 0-.115-.236l-3.079-2.413v.002-5.587a6.494 6.494 0 0 0-4.816-6.28q.014-.107.014-.215c0-.913-.747-1.653-1.669-1.653a1.66 1.66 0 0 0-1.655 1.867 6.48 6.48 0 0 0-3.54 2.408L2.645.963a.3.3 0 0 0-.425 0L.962 2.22a.3.3 0 0 0 0 .424zM5.529 14.581V9.735l8.48 8.48H2.635a.3.3 0 0 1-.3-.3l.002-.691a.3.3 0 0 1 .115-.236zM14.996 20.006c0 1.738-1.337 3.146-2.985 3.146-1.649 0-2.985-1.408-2.985-3.146z"
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
export class KbqBellSlash24 extends KbqSvgIcon {}

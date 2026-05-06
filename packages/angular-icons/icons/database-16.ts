import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqDatabase16]',
    template: `
        <svg:g>
            <svg:path d="M14 3.5C14 2.12 11.314 1 8 1S2 2.12 2 3.5v1.01C2.013 5.886 4.694 7 8 7s5.987-1.114 6-2.49z" />
            <svg:path
                d="M8.332 8.197c1.65-.035 3.187-.328 4.372-.822A5.8 5.8 0 0 0 14 6.648V8.51c-.003.273-.11.535-.306.78-.573.718-1.907 1.291-3.604 1.554q-.505.079-1.048.118a14.3 14.3 0 0 1-3.132-.118c-1.697-.263-3.03-.836-3.604-1.554-.196-.245-.303-.507-.306-.78V6.65c.382.292.827.531 1.296.726C4.56 7.902 6.224 8.2 8 8.2q.167 0 .332-.003"
            />
            <svg:path
                d="M9.066 12.164c1.37-.094 2.63-.369 3.638-.789A5.8 5.8 0 0 0 14 10.65V12.5c0 1.074-1.627 1.99-3.91 2.344-.65.1-1.355.156-2.09.156a14 14 0 0 1-2.09-.156C3.627 14.491 2 13.574 2 12.5v-1.851a5.8 5.8 0 0 0 1.296.726c.986.411 2.214.683 3.549.782A16 16 0 0 0 8 12.2"
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
export class KbqDatabase16 extends KbqSvgIcon {}

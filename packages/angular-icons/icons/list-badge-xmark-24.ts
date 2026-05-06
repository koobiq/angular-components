import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqListBadgeXmark24]',
    template: `
        <svg:g>
            <svg:path
                d="M5.25 3.364a1.87 1.87 0 0 1-1.875 1.864A1.87 1.87 0 0 1 1.5 3.364c0-1.03.84-1.864 1.875-1.864A1.87 1.87 0 0 1 5.25 3.364M5.25 11.17a1.87 1.87 0 0 1-1.875 1.864A1.87 1.87 0 0 1 1.5 11.17c0-1.03.84-1.864 1.875-1.864A1.87 1.87 0 0 1 5.25 11.17M3.375 21a1.87 1.87 0 0 0 1.875-1.864 1.87 1.87 0 0 0-1.875-1.864A1.87 1.87 0 0 0 1.5 19.136c0 1.03.84 1.864 1.875 1.864M22.5 4.42a.3.3 0 0 1-.3.3H7.456a.3.3 0 0 1-.3-.3v-1.8a.3.3 0 0 1 .3-.3H22.2a.3.3 0 0 1 .3.3zM22.5 12.07a.3.3 0 0 1-.3.3H7.456a.3.3 0 0 1-.3-.3v-1.8a.3.3 0 0 1 .3-.3H22.2a.3.3 0 0 1 .3.3zM12.45 20.336a.3.3 0 0 0 .3-.3v-1.8a.3.3 0 0 0-.3-.3H7.456a.3.3 0 0 0-.3.3v1.8a.3.3 0 0 0 .3.3zM15.662 16.185l2.677 2.677-2.677 2.676a.3.3 0 0 0 0 .424l.849.849a.3.3 0 0 0 .424 0l2.677-2.677 2.676 2.677a.3.3 0 0 0 .424 0l.849-.849a.3.3 0 0 0 0-.424l-2.677-2.677 2.677-2.676a.3.3 0 0 0 0-.424l-.849-.849a.3.3 0 0 0-.424 0L19.61 17.59l-2.676-2.677a.3.3 0 0 0-.424 0l-.849.849a.3.3 0 0 0 0 .424"
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
export class KbqListBadgeXmark24 extends KbqSvgIcon {}

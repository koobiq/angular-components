import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqDiamondInfo24]',
    template: `
        <svg:g>
            <svg:path
                d="M10.903 16.227a.3.3 0 0 0 .3.3h1.67a.3.3 0 0 0 .3-.3v-6.082a.3.3 0 0 0-.3-.3h-1.67a.3.3 0 0 0-.3.3zM10.818 7.64c0 .634.554 1.15 1.225 1.15.676 0 1.23-.516 1.23-1.15 0-.629-.554-1.146-1.23-1.146-.671 0-1.225.517-1.225 1.146"
            />
            <svg:path
                d="M.967 12.212a.3.3 0 0 1 0-.424L11.788.968a.3.3 0 0 1 .424 0l10.821 10.82a.3.3 0 0 1 0 .424l-10.82 10.821a.3.3 0 0 1-.425 0zM12 19.851l7.851-7.85-7.85-7.852L4.148 12z"
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
export class KbqDiamondInfo24 extends KbqSvgIcon {}

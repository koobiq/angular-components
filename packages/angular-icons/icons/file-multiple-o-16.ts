import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqFileMultipleO16]',
    template: `
        <svg:g>
            <svg:path
                d="M8.517 16a.2.2 0 0 0 .142-.059L10.2 14.4H3.8a.2.2 0 0 1-.2-.2V2.8h-.4A1.2 1.2 0 0 0 2 4v10.8A1.2 1.2 0 0 0 3.2 16z"
            />
            <svg:path
                d="M14.7 3.383a.2.2 0 0 0-.059-.142L11.46.06A.2.2 0 0 0 11.317 0H6a1.2 1.2 0 0 0-1.2 1.2V12A1.2 1.2 0 0 0 6 13.2h7.5a1.2 1.2 0 0 0 1.2-1.2zM6.4 1.8c0-.11.09-.2.2-.2h3.697v2.9c0 .11.09.2.2.2H13.1v6.7a.2.2 0 0 1-.2.2H6.6a.2.2 0 0 1-.2-.2z"
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
export class KbqFileMultipleO16 extends KbqSvgIcon {}

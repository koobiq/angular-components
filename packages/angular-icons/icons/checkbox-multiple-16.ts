import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCheckboxMultiple16]',
    template: `
        <svg:g>
            <svg:path
                d="M13.2 2.6c.11 0 .2.09.2.2v9.4h.4A1.2 1.2 0 0 0 15 11V2.2A1.2 1.2 0 0 0 13.8 1H5a1.2 1.2 0 0 0-1.2 1.2v.4z"
            />
            <svg:path
                d="M2.6 5.6c0-.11.09-.2.2-.2h7.6c.11 0 .2.09.2.2v7.6a.2.2 0 0 1-.2.2H2.8a.2.2 0 0 1-.2-.2zm-.4-1.8A1.2 1.2 0 0 0 1 5v8.8A1.2 1.2 0 0 0 2.2 15H11a1.2 1.2 0 0 0 1.2-1.2V5A1.2 1.2 0 0 0 11 3.8z"
            />
            <svg:path
                d="M9.806 7.79a.2.2 0 0 1 0 .283l-3.783 3.783a.2.2 0 0 1-.283 0L3.391 9.507a.2.2 0 0 1 0-.283l.849-.848a.2.2 0 0 1 .283 0L5.88 9.734l2.793-2.793a.2.2 0 0 1 .283 0z"
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
export class KbqCheckboxMultiple16 extends KbqSvgIcon {}

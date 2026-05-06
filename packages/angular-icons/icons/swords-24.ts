import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqSwords24]',
    template: `
        <svg:g>
            <svg:path
                d="M21.85 5.006a.3.3 0 0 1-.085.178l-5.335 5.402-3.164-3.203L18.6 1.98a.3.3 0 0 1 .176-.086l3.296-.393a.15.15 0 0 1 .165.168zM19.46 16.217l1.37-1.388a.296.296 0 0 1 .422 0l.844.854a.305.305 0 0 1 0 .427l-2.11 2.136 2.427 2.457a.305.305 0 0 1 0 .427l-1.266 1.282a.296.296 0 0 1-.422 0l-2.426-2.457-2.11 2.136a.296.296 0 0 1-.421 0l-.844-.854a.305.305 0 0 1 0-.427l1.371-1.389L2.235 5.184a.3.3 0 0 1-.086-.178l-.388-3.337a.15.15 0 0 1 .166-.168l3.296.393a.3.3 0 0 1 .176.086zM7.57 13.15l3.164 3.204-3.029 3.067 1.371 1.389a.305.305 0 0 1 0 .427l-.844.854a.296.296 0 0 1-.422 0L5.7 19.955l-2.425 2.457a.296.296 0 0 1-.422 0L1.587 21.13a.305.305 0 0 1 0-.427l2.426-2.457-2.11-2.136a.305.305 0 0 1 0-.427l.845-.854a.296.296 0 0 1 .422 0l1.37 1.388z"
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
export class KbqSwords24 extends KbqSvgIcon {}

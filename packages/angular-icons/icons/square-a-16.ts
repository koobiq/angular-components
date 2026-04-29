import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-square-a-16,[kbqSquareA16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path d="M9.008 8.855H6.996l.975-3.027h.062z" />
                <path
                    d="M13.8 1A1.2 1.2 0 0 1 15 2.2v11.6a1.2 1.2 0 0 1-1.2 1.2H2.2A1.2 1.2 0 0 1 1 13.8V2.2A1.2 1.2 0 0 1 2.2 1zM7.065 4a.2.2 0 0 0-.189.136l-2.598 7.6a.2.2 0 0 0 .189.264h1.37a.2.2 0 0 0 .19-.139l.543-1.685h2.86l.543 1.685a.2.2 0 0 0 .19.139h1.37a.2.2 0 0 0 .19-.265l-2.595-7.6A.2.2 0 0 0 8.938 4z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqSquareA16 extends KbqSvgIcon {}

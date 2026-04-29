import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-printer-24,[kbqPrinter24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M4.492 4.5a3 3 0 0 1 3-3h9.061a3 3 0 0 1 3 3V6H20.7a1.8 1.8 0 0 1 1.8 1.8v9.9a1.8 1.8 0 0 1-1.8 1.8h-1.2s-.007-2.36-.007-3.03a2.55 2.55 0 0 0-2.55-2.55H7.057a2.55 2.55 0 0 0-2.55 2.55v1.916c0 .74-.007 1.114-.007 1.114H3.3a1.8 1.8 0 0 1-1.8-1.8V7.8A1.8 1.8 0 0 1 3.3 6h1.192zm12.661 0a.6.6 0 0 0-.6-.6H7.492a.6.6 0 0 0-.6.6V6h10.261zM7.5 9.3a.3.3 0 0 0-.3-.3H4.8a.3.3 0 0 0-.3.3v2.4a.3.3 0 0 0 .3.3h2.4a.3.3 0 0 0 .3-.3z"
                />
                <path
                    d="M17.993 16.47c0-.58-.47-1.05-1.05-1.05H7.057c-.58 0-1.05.47-1.05 1.05v4.98c0 .58.47 1.05 1.05 1.05h9.886c.58 0 1.05-.47 1.05-1.05z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqPrinter24 extends KbqSvgIcon {}

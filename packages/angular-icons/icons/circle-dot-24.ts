import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCircleDot24]',
    template: `
        <svg:path
            d="M15.37 2.053A10.5 10.5 0 0 0 12 1.5C6.201 1.5 1.5 6.201 1.5 12S6.201 22.5 12 22.5 22.5 17.799 22.5 12c0-1.179-.194-2.312-.553-3.37a4.8 4.8 0 0 1-6.577-6.577"
        />
        <svg:g fill="currentColor">
            <svg:path d="M22.5 4.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
            <svg:path d="M22.5 4.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
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
export class KbqCircleDot24 extends KbqSvgIcon {}

import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCircleDotO16]',
    template: `
        <svg:path
            d="M10.248 1.369c-.27.453-.43.978-.446 1.539a5.4 5.4 0 1 0 3.29 3.29 3.2 3.2 0 0 0 1.54-.446C14.87 6.458 15 7.214 15 8a7 7 0 1 1-4.752-6.631"
        />
        <svg:g fill="currentColor">
            <svg:path d="M15 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0" />
            <svg:path d="M15 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0" />
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
export class KbqCircleDotO16 extends KbqSvgIcon {}

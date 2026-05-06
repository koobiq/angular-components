import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqTextItalic16]',
    template: `
        <svg:path
            d="M3.2 14.5a.2.2 0 0 1-.2-.2v-.8c0-.11.09-.2.2-.2h2.17L8.63 2.7H6.7a.2.2 0 0 1-.2-.2v-.8c0-.11.09-.2.2-.2h6.1c.11 0 .2.09.2.2v.8a.2.2 0 0 1-.2.2h-2.016L7.523 13.3H9.3c.11 0 .2.09.2.2v.8a.2.2 0 0 1-.2.2z"
        />
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
export class KbqTextItalic16 extends KbqSvgIcon {}

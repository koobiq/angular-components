import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqXmark16]',
    template: `
        <svg:path
            d="M13.441 3.694a.2.2 0 0 0 0-.284l-.85-.851a.2.2 0 0 0-.285 0L8 6.865 3.694 2.56a.2.2 0 0 0-.284 0l-.851.85a.2.2 0 0 0 0 .285L6.865 8 2.56 12.306a.2.2 0 0 0 0 .284l.85.851a.2.2 0 0 0 .285 0L8 9.135l4.306 4.306a.2.2 0 0 0 .284 0l.851-.85a.2.2 0 0 0 0-.285L9.135 8z"
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
export class KbqXmark16 extends KbqSvgIcon {}

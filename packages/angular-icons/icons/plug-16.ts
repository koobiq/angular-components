import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqPlug16]',
    template: `
        <svg:path
            d="M10.132 1.06a.2.2 0 0 1 .283 0l.848.849a.2.2 0 0 1 0 .282l-1.98 1.98 2.546 2.546 1.98-1.98a.2.2 0 0 1 .282 0l.849.849a.2.2 0 0 1 0 .282l-1.98 1.98.99.99a.2.2 0 0 1 0 .283l-2.414 2.415a5 5 0 0 1-4.941 1.263l-1.423 1.424L4.04 13.09l-1.854 1.855a.2.2 0 0 1-.283 0l-.849-.849a.2.2 0 0 1 0-.283L2.91 11.96l-1.132-1.132 1.424-1.423a5 5 0 0 1 1.263-4.94L6.88 2.05a.2.2 0 0 1 .283 0l.99.99zm-2.84 7.647a1 1 0 1 0 1.415-1.414 1 1 0 0 0-1.414 1.414"
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
export class KbqPlug16 extends KbqSvgIcon {}

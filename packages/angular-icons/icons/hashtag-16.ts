import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqHashtag16]',
    template: `
        <svg:path
            d="M4.003 14.5a.2.2 0 0 1-.198-.231l.545-3.43H1.7a.2.2 0 0 1-.2-.2v-1.1c0-.11.09-.2.2-.2h2.888l.416-2.616H2.31a.2.2 0 0 1-.2-.2V5.414c0-.11.09-.2.2-.2h2.934l.563-3.545a.2.2 0 0 1 .198-.169H7.07a.2.2 0 0 1 .198.231l-.553 3.483h3.508l.566-3.546a.2.2 0 0 1 .197-.168h1.067a.2.2 0 0 1 .197.232l-.555 3.482H14.3c.11 0 .2.09.2.2v1.11a.2.2 0 0 1-.2.2h-2.845l-.417 2.615h2.644c.11 0 .2.09.2.2v1.1a.2.2 0 0 1-.2.2h-2.883l-.557 3.492a.2.2 0 0 1-.198.169H8.977a.2.2 0 0 1-.197-.232l.547-3.429H5.822l-.555 3.492a.2.2 0 0 1-.197.169zm5.563-5.16.417-2.617H6.476L6.06 9.34z"
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
export class KbqHashtag16 extends KbqSvgIcon {}

import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqTable16]',
    template: `
        <svg:path
            d="M14.8 14c.663 0 1.2-.579 1.2-1.292V3.262C15.985 2.562 15.453 2 14.8 2H1.2C.547 2 .015 2.562 0 3.262v9.446C0 13.42.537 14 1.2 14zM1.6 5.204c0-.11.09-.2.2-.2h5.396c.11 0 .2.09.2.2V7.9a.2.2 0 0 1-.2.2H1.8a.2.2 0 0 1-.2-.2zm0 4.296c0-.11.09-.2.2-.2h5.396c.11 0 .2.09.2.2v2.7a.2.2 0 0 1-.2.2H1.8a.2.2 0 0 1-.2-.2zm7.204-4.496H14.2c.11 0 .2.09.2.2V7.9a.2.2 0 0 1-.2.2H8.804a.2.2 0 0 1-.2-.2V5.204c0-.11.09-.2.2-.2m-.2 4.496c0-.11.09-.2.2-.2H14.2c.11 0 .2.09.2.2v2.7a.2.2 0 0 1-.2.2H8.804a.2.2 0 0 1-.2-.2z"
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
export class KbqTable16 extends KbqSvgIcon {}

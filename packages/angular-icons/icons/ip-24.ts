import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqIp24]',
    template: `
        <svg:path
            d="M6.143 20.25a.2.2 0 0 0 .2-.2V3.95a.2.2 0 0 0-.2-.2H3.2a.2.2 0 0 0-.2.2v16.1c0 .11.09.2.2.2zm3.15-16.5a.2.2 0 0 0-.2.2v16.1c0 .11.09.2.2.2h2.944a.2.2 0 0 0 .2-.2v-5.614h2.81c3.637 0 5.753-2.17 5.753-5.328 0-3.142-2.077-5.358-5.667-5.358zm5.414 8.007h-2.27V6.483h2.255c1.93 0 2.864 1.05 2.864 2.625 0 1.568-.934 2.649-2.849 2.649"
        />
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
export class KbqIp24 extends KbqSvgIcon {}

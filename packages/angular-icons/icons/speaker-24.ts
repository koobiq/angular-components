import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqSpeaker24]',
    template: `
        <svg:path
            d="M7.2 15.75h4.2l5.07 5.205c.094.096.256.028.256-.108V3.153c0-.136-.162-.204-.256-.108L11.4 8.25H7.2a1.8 1.8 0 0 0-1.8 1.8v3.9a1.8 1.8 0 0 0 1.8 1.8"
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
export class KbqSpeaker24 extends KbqSvgIcon {}

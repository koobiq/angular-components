import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqFileO24]',
    template: `
        <svg:path
            d="M14.876 0a.3.3 0 0 1 .212.088l5.824 5.824a.3.3 0 0 1 .088.212V22.2a1.8 1.8 0 0 1-1.8 1.8H4.8A1.8 1.8 0 0 1 3 22.2V1.8A1.8 1.8 0 0 1 4.8 0zM13.5 2.4H5.7a.3.3 0 0 0-.3.3v18.6a.3.3 0 0 0 .3.3h12.6a.3.3 0 0 0 .3-.3V7.5h-4.8a.3.3 0 0 1-.3-.3z"
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
export class KbqFileO24 extends KbqSvgIcon {}

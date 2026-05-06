import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCirclePause24]',
    template: `
        <svg:path
            d="M12 22.5c5.799 0 10.5-4.701 10.5-10.5S17.799 1.5 12 1.5 1.5 6.201 1.5 12 6.201 22.5 12 22.5M10.5 7.35v9.3a.3.3 0 0 1-.3.3H8.4a.3.3 0 0 1-.3-.3v-9.3a.3.3 0 0 1 .3-.3h1.8a.3.3 0 0 1 .3.3m5.4 0v9.3a.3.3 0 0 1-.3.3h-1.8a.3.3 0 0 1-.3-.3v-9.3a.3.3 0 0 1 .3-.3h1.8a.3.3 0 0 1 .3.3"
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
export class KbqCirclePause24 extends KbqSvgIcon {}

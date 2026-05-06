import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqKey24]',
    template: `
        <svg:path
            d="M12.119 9.207a5 5 0 0 1-.736-2.616c0-2.812 2.32-5.091 5.183-5.091s5.184 2.28 5.184 5.09c0 2.812-2.32 5.091-5.184 5.091a5.23 5.23 0 0 1-2.878-.856l-4.8 4.714 1.976 1.94a.287.287 0 0 1 0 .411l-1.257 1.235a.3.3 0 0 1-.419 0l-1.976-1.94-1.735 1.704 1.915 1.88a.287.287 0 0 1 0 .412l-1.257 1.234a.3.3 0 0 1-.419 0l-3.38-3.32a.287.287 0 0 1 .002-.412zm4.447.147c1.555 0 2.814-1.237 2.814-2.763 0-1.527-1.26-2.764-2.814-2.764s-2.813 1.237-2.813 2.764 1.26 2.763 2.813 2.763"
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
export class KbqKey24 extends KbqSvgIcon {}

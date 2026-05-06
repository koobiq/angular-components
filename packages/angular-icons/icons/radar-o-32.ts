import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqRadarO32]',
    template: `
        <svg:path
            d="M0 16c0 8.837 7.163 16 16 16 4.667 0 8.867-1.998 11.792-5.186a4 4 0 0 1-1.72-1.09A13.96 13.96 0 0 1 16 30C8.268 30 2 23.732 2 16c0-3.946 1.632-7.51 4.259-10.055L9.795 9.48a9 9 0 0 0-1.86 2.52L8 12c.703 0 1.363.181 1.937.5a7 7 0 0 1 1.273-1.604l3.541 3.542a2 2 0 1 0 2.663.148l3.536-3.536A7 7 0 1 1 9.937 19.5a4 4 0 0 1-2.002.5A9 9 0 1 0 22.364 9.637L25.899 6.1A13.96 13.96 0 0 1 30 16c0 1.05-.115 2.072-.334 3.055a4 4 0 0 1 1.857.84C31.834 18.649 32 17.344 32 16c0-8.837-7.163-16-16-16-1.47 0-2.893.198-4.244.569a15.16 15.16 0 0 0-6.913 3.96l.001.002A15.95 15.95 0 0 0 0 16M14.5 6a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0M20 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0M8 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4m21 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4"
        />
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 32 32',
        width: '32',
        height: '32'
    }
})
export class KbqRadarO32 extends KbqSvgIcon {}

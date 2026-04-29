import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-wifi-tethering-24,[kbqWifiTethering24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M6.96 18.72a.31.31 0 0 0-.057-.424 8.1 8.1 0 1 1 10.193 0 .31.31 0 0 0-.056.424l1.08 1.44c.1.133.288.16.418.057A10.48 10.48 0 0 0 22.5 12c0-5.799-4.701-10.5-10.5-10.5S1.5 6.201 1.5 12a10.48 10.48 0 0 0 3.962 8.217c.13.103.318.076.418-.057zm9.056-1.865a.29.29 0 0 1-.416-.055l-1.08-1.44a.32.32 0 0 1 .053-.429 3.9 3.9 0 1 0-5.145 0c.124.11.151.297.052.429L8.4 16.8a.29.29 0 0 1-.416.054 6.3 6.3 0 1 1 8.032 0M14.1 12a2.1 2.1 0 1 1-4.2 0 2.1 2.1 0 0 1 4.2 0"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqWifiTethering24 extends KbqSvgIcon {}

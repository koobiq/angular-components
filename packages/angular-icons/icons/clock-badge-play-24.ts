import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-clock-badge-play-24,[kbqClockBadgePlay24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M12 20.1c.947 0 1.855-.162 2.7-.46v2.51c-.861.228-1.766.35-2.7.35-5.799 0-10.5-4.701-10.5-10.5S6.201 1.5 12 1.5 22.5 6.201 22.5 12c0 1.037-.15 2.04-.43 2.986l-2.105-1.508q.134-.72.135-1.478a8.1 8.1 0 1 0-8.1 8.1m.9-6.9a.3.3 0 0 0 .3-.3V6.3a.3.3 0 0 0-.3-.3h-1.8a.3.3 0 0 0-.3.3v4.5H6.7a.3.3 0 0 0-.3.3v1.8a.3.3 0 0 0 .3.3zm4.086.358c-.204-.147-.486.003-.486.26v9.865c0 .256.282.406.486.26l6.882-4.934a.32.32 0 0 0 0-.518z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqClockBadgePlay24 extends KbqSvgIcon {}

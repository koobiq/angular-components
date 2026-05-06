import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqClockBadgeStop24]',
    template: `
        <svg:g>
            <svg:path
                d="M12 20.1q.456 0 .9-.05v2.412q-.445.038-.9.038C6.201 22.5 1.5 17.799 1.5 12S6.201 1.5 12 1.5 22.5 6.201 22.5 12q0 .455-.038.9H20.05A8.1 8.1 0 1 0 12 20.1"
            />
            <svg:path
                d="M13.2 12.9a.3.3 0 0 1-.3.3H7.05a.3.3 0 0 1-.3-.3v-1.8a.3.3 0 0 1 .3-.3h3.75V6.3a.3.3 0 0 1 .3-.3h1.8a.3.3 0 0 1 .3.3zM15 15.3a.3.3 0 0 1 .3-.3h8.4a.3.3 0 0 1 .3.3v8.4a.3.3 0 0 1-.3.3h-8.4a.3.3 0 0 1-.3-.3z"
            />
        </svg:g>
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
export class KbqClockBadgeStop24 extends KbqSvgIcon {}

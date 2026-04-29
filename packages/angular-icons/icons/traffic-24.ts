import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-traffic-24,[kbqTraffic24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M12.254.887a.3.3 0 0 0-.508 0L8.162 6.621a.3.3 0 0 0 .254.459H10.8v5.084H7.08V9.781a.3.3 0 0 0-.459-.254L.887 13.11a.3.3 0 0 0 0 .509l5.734 3.584a.3.3 0 0 0 .459-.255v-2.383h3.719V23.7a.3.3 0 0 0 .3.3h1.8a.3.3 0 0 0 .3-.3v-9.136h3.721v2.384a.3.3 0 0 0 .459.255l5.734-3.584a.3.3 0 0 0 0-.509l-5.734-3.583a.3.3 0 0 0-.459.254v2.383h-3.722V7.08h2.386a.3.3 0 0 0 .254-.459z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqTraffic24 extends KbqSvgIcon {}

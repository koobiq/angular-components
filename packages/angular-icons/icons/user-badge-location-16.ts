import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-user-badge-location-16,[kbqUserBadgeLocation16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17">
            <path
                d="M11 4.5c0 1.933-1.343 4-3 4s-3-2.067-3-4S6.343 1 8 1s3 1.567 3 3.5M8 9.7c.572 0 1.093-.15 1.555-.392a4.03 4.03 0 0 0-.605 2.129c0 1.223.715 2.306 1.495 3.336l.171.227H2.16a.2.2 0 0 1-.195-.157l-.777-3.499a1.2 1.2 0 0 1 .554-1.289l3.282-1.97C5.702 8.96 6.725 9.7 8 9.7m4.995-1.108a2.845 2.845 0 0 0-2.845 2.845c0 .774.455 1.56 1.251 2.612l1.41 1.861a.23.23 0 0 0 .368 0l1.41-1.861c.796-1.051 1.251-1.838 1.251-2.612a2.845 2.845 0 0 0-2.845-2.845m0 1.368a1.37 1.37 0 1 1 0 2.739 1.37 1.37 0 0 1 0-2.739"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqUserBadgeLocation16 extends KbqSvgIcon {}

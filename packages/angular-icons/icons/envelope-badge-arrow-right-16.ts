import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-envelope-badge-arrow-right-16,[kbqEnvelopeBadgeArrowRight16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M2.2 2A1.2 1.2 0 0 0 1 3.2v.3l7 3.376L15 3.5v-.3A1.2 1.2 0 0 0 13.8 2zM15 4.832 8 8.21 1 4.832V12.8A1.2 1.2 0 0 0 2.2 14h4.6v-2.25c0-.11.09-.2.2-.2h3.5V9.054a.2.2 0 0 1 .303-.172L15 11.407zm.904 8.832a.187.187 0 0 0 0-.328l-3.91-2.306c-.136-.08-.312.012-.312.163v1.535H8.205A.2.2 0 0 0 8 12.92v1.158c0 .107.092.193.204.193h3.478v1.535c0 .151.176.244.313.163z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqEnvelopeBadgeArrowRight16 extends KbqSvgIcon {}

import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqUserBadgeTriangleUp24]',
    template: `
        <svg:path
            d="M16.5 6.75c0 2.9-2.015 6-4.5 6s-4.5-3.1-4.5-6S9.515 1.5 12 1.5s4.5 2.35 4.5 5.25m-.036 5.379c-1.017 1.31-2.552 2.421-4.464 2.421s-3.447-1.112-4.464-2.422l-4.924 2.954a1.8 1.8 0 0 0-.83 1.935l1.166 5.248a.3.3 0 0 0 .293.235h9.079l2.723-4.294q.036-.066.077-.13l3.102-4.892zM14.046 24a.3.3 0 0 1-.254-.46l4.688-7.392a.3.3 0 0 1 .506 0l4.72 7.39a.3.3 0 0 1-.253.462z"
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
export class KbqUserBadgeTriangleUp24 extends KbqSvgIcon {}

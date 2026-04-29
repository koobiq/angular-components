import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-user-badge-globe-16,[kbqUserBadgeGlobe16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M8 8.5c1.657 0 3-2.067 3-4S9.657 1 8 1 5 2.567 5 4.5s1.343 4 3 4m-2.976-.414-3.282 1.969a1.2 1.2 0 0 0-.554 1.29l.777 3.498A.2.2 0 0 0 2.16 15h6.36a4.7 4.7 0 0 1-.72-2.5 4.68 4.68 0 0 1 1.001-2.9q-.381.098-.801.1c-1.275 0-2.298-.741-2.976-1.614M15.899 12.9c.06 0 .106.052.098.111a3.54 3.54 0 0 1-2.544 2.921c.509-.915.797-1.92.866-2.937a.1.1 0 0 1 .1-.095zm-2.444-3.805a3.54 3.54 0 0 1 2.542 2.92.098.098 0 0 1-.098.111h-1.48a.1.1 0 0 1-.1-.094 7 7 0 0 0-.864-2.937M9.12 12.126a.1.1 0 0 1-.098-.11 3.54 3.54 0 0 1 2.541-2.92 7 7 0 0 0-.864 2.936.1.1 0 0 1-.1.095zm1.58.869a.1.1 0 0 0-.101-.095h-1.48a.1.1 0 0 0-.097.111 3.54 3.54 0 0 0 2.544 2.92 7 7 0 0 1-.867-2.936m.87-.095a.1.1 0 0 0-.1.107A6.23 6.23 0 0 0 12.51 16a6.23 6.23 0 0 0 1.039-2.993.1.1 0 0 0-.1-.107zm1.88-.774a.1.1 0 0 0 .099-.106 6.25 6.25 0 0 0-1.04-2.997 6.25 6.25 0 0 0-1.038 2.997.1.1 0 0 0 .099.107z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqUserBadgeGlobe16 extends KbqSvgIcon {}

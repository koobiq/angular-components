import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-ubuntu-16,[kbqUbuntu16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M13.54 3.28a2.1 2.1 0 1 0-4.2 0 2.1 2.1 0 0 0 4.2 0M9.26 1.367a6.746 6.746 0 0 0-7.01 3.094q.137-.012.277-.012c.565 0 1.093.161 1.54.441a5 5 0 0 1 4.485-1.874c.057-.63.314-1.2.708-1.649M12.577 5.949c.28.626.437 1.32.437 2.051 0 .877-.225 1.702-.621 2.42.521.343.926.85 1.14 1.448A6.7 6.7 0 0 0 14.75 8a6.7 6.7 0 0 0-.822-3.23 2.9 2.9 0 0 1-1.351 1.179M7.905 13.014c.038.65.29 1.244.688 1.71A6.753 6.753 0 0 1 1.58 10.09a2.9 2.9 0 0 0 1.865.01 5.01 5.01 0 0 0 4.46 2.914M4.627 7.349a2.1 2.1 0 1 0-4.2 0 2.1 2.1 0 0 0 4.2 0M8.7 12.844a2.1 2.1 0 1 1 4.2 0 2.1 2.1 0 0 1-4.2 0"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqUbuntu16 extends KbqSvgIcon {}

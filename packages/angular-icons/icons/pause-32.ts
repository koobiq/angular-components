import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-pause-32,[kbqPause32]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
            <path
                d="M12.75 6h-2.5C9.56 6 9 6.448 9 7v18c0 .552.56 1 1.25 1h2.5c.69 0 1.25-.448 1.25-1V7c0-.552-.56-1-1.25-1m9 0h-2.5C18.56 6 18 6.448 18 7v18c0 .552.56 1 1.25 1h2.5c.69 0 1.25-.448 1.25-1V7c0-.552-.56-1-1.25-1"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqPause32 extends KbqSvgIcon {}

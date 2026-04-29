import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-drop-24,[kbqDrop24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M12 23.25c4.35 0 7.875-3.575 7.875-7.986 0-2.171-1.26-4.38-3.463-7.33l-4.143-5.548a.335.335 0 0 0-.538 0L7.588 7.934c-2.202 2.95-3.463 5.159-3.463 7.33 0 4.41 3.526 7.986 7.875 7.986"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqDrop24 extends KbqSvgIcon {}

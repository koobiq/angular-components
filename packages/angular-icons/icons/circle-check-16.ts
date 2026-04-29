import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-circle-check-16,[kbqCircleCheck16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14m-1.001-3.944a.2.2 0 0 1-.283 0l-2.57-2.57a.2.2 0 0 1 0-.283l.565-.566a.2.2 0 0 1 .283 0L6.857 9.5l4.149-4.149a.2.2 0 0 1 .283 0l.565.566a.2.2 0 0 1 0 .283z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCircleCheck16 extends KbqSvgIcon {}

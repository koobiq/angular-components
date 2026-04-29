import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-check-double-16,[kbqCheckDouble16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M11.936 4.674a.205.205 0 0 1 0 .289L4.763 12.19a.2.2 0 0 1-.286 0L.06 7.738a.205.205 0 0 1 0-.288l.858-.865a.2.2 0 0 1 .286 0L4.62 10.03l6.172-6.22a.2.2 0 0 1 .286 0zM8.477 12.19l-1.029-1.037 7.344-7.343a.2.2 0 0 1 .286 0l.858.864a.205.205 0 0 1 0 .289L8.763 12.19a.2.2 0 0 1-.286 0"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCheckDouble16 extends KbqSvgIcon {}

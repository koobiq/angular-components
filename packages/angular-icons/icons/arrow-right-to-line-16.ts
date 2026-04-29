import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrow-right-to-line-16,[kbqArrowRightToLine16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M5.714 4.425a.2.2 0 0 0 0 .281L8.176 7.2H1.2a.2.2 0 0 0-.2.2v1.2c0 .11.09.2.2.2h6.976l-2.462 2.494a.2.2 0 0 0 0 .281l.836.847a.2.2 0 0 0 .285 0L11.06 8.14a.2.2 0 0 0 0-.281L6.835 3.579a.2.2 0 0 0-.285 0zM13.8 15a.2.2 0 0 0 .2-.2V1.2a.2.2 0 0 0-.2-.2h-1.2a.2.2 0 0 0-.2.2v13.6c0 .11.09.2.2.2z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowRightToLine16 extends KbqSvgIcon {}

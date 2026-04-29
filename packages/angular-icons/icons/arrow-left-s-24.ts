import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrow-left-s-24,[kbqArrowLeftS24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="m7.42 13.18 3.742 3.784a.3.3 0 0 1 0 .426L9.903 18.66a.31.31 0 0 1-.438 0l-6.377-6.446a.3.3 0 0 1 0-.426L9.465 5.34a.31.31 0 0 1 .438 0l1.259 1.269a.3.3 0 0 1 0 .427L7.47 10.77h13.228a.3.3 0 0 1 .302.3v1.809a.3.3 0 0 1-.302.3z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowLeftS24 extends KbqSvgIcon {}

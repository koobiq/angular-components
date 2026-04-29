import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-circle-chevron-down-16,[kbqCircleChevronDown16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14M4.217 6.81l.566-.566a.2.2 0 0 1 .283 0L8 9.178l2.934-2.934a.2.2 0 0 1 .283 0l.566.565a.2.2 0 0 1 0 .283L8.566 10.31l-.016.014-.41.41a.2.2 0 0 1-.283 0l-.566-.565-.013-.015-3.06-3.06a.2.2 0 0 1 0-.284"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCircleChevronDown16 extends KbqSvgIcon {}

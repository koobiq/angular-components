import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrow-up-24,[kbqArrowUp24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="m10.772 6.127-5.258 5.279a.297.297 0 0 1-.422 0l-1.279-1.284a.304.304 0 0 1 0-.428l7.951-7.983a.297.297 0 0 1 .422 0l7.951 7.983a.304.304 0 0 1 0 .428l-1.278 1.284a.297.297 0 0 1-.422 0l-5.258-5.28v16.196a.3.3 0 0 1-.299.301h-1.81a.3.3 0 0 1-.299-.302z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowUp24 extends KbqSvgIcon {}

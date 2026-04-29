import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-check-24,[kbqCheck24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M22.407 5.83a.306.306 0 0 1 .006.433L9.588 19.409a.3.3 0 0 1-.434 0l-7.567-7.764a.306.306 0 0 1 .006-.433l1.286-1.245a.3.3 0 0 1 .427.006L9.371 16.2 20.694 4.59a.3.3 0 0 1 .427-.006z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCheck24 extends KbqSvgIcon {}

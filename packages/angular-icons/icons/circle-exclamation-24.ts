import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-circle-exclamation-24,[kbqCircleExclamation24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M12 22.5c5.799 0 10.5-4.701 10.5-10.5S17.799 1.5 12 1.5 1.5 6.201 1.5 12 6.201 22.5 12 22.5m1.39-16.176-.467 7.427a.3.3 0 0 1-.3.281h-1.25a.3.3 0 0 1-.3-.281l-.463-7.427a.3.3 0 0 1 .3-.319h2.18a.3.3 0 0 1 .3.319M12 17.71a1.33 1.33 0 1 1 0-2.66 1.33 1.33 0 0 1 0 2.66"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCircleExclamation24 extends KbqSvgIcon {}

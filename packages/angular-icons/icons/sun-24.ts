import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-sun-24,[kbqSun24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M17.043 5.151a2.85 2.85 0 0 1-3.307-1.37L12.125.828a.142.142 0 0 0-.25 0l-1.611 2.955a2.85 2.85 0 0 1-3.307 1.37l-2.308-.68a.143.143 0 0 0-.177.178l.679 2.307a2.85 2.85 0 0 1-1.37 3.307l-2.954 1.61a.143.143 0 0 0 0 .251l2.954 1.611a2.85 2.85 0 0 1 1.37 3.307l-.679 2.308a.143.143 0 0 0 .177.176l2.308-.678a2.85 2.85 0 0 1 3.307 1.37l1.61 2.954a.143.143 0 0 0 .251 0l1.611-2.954a2.85 2.85 0 0 1 3.307-1.37l2.308.678a.142.142 0 0 0 .176-.177l-.678-2.307a2.85 2.85 0 0 1 1.37-3.307l2.953-1.61a.143.143 0 0 0 0-.251l-2.954-1.611a2.85 2.85 0 0 1-1.37-3.307l.68-2.307a.143.143 0 0 0-.177-.177z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqSun24 extends KbqSvgIcon {}

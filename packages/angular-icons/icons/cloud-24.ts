import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-cloud-24,[kbqCloud24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M12.093 19.5H5.414a5.414 5.414 0 0 1-.138-10.827 7.503 7.503 0 0 1 13.838.945 4.941 4.941 0 0 1-.055 9.882z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCloud24 extends KbqSvgIcon {}

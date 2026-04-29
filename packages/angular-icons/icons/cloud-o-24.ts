import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-cloud-o-24,[kbqCloudO24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="m17.38 12-.542-1.62a5.103 5.103 0 0 0-9.411-.64l-.643 1.297-1.448.036a3.014 3.014 0 0 0 .078 6.027H19.06a2.541 2.541 0 0 0 .029-5.082zM5.414 19.5a5.414 5.414 0 0 1-.138-10.827 7.503 7.503 0 0 1 13.838.945 4.941 4.941 0 0 1-.055 9.882z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCloudO24 extends KbqSvgIcon {}

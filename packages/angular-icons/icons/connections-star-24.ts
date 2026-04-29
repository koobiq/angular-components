import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-connections-star-24,[kbqConnectionsStar24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M7.5 4.5c0 .387-.073.757-.207 1.096l3.61 3.61C11.244 9.074 11.614 9 12 9s.757.073 1.096.207l3.61-3.61a3 3 0 1 1 1.697 1.697l-3.61 3.61a2.995 2.995 0 0 1 0 2.193l3.61 3.61a3 3 0 1 1-1.697 1.697l-3.61-3.61c-.34.133-.71.206-1.096.206s-.757-.073-1.096-.207l-3.61 3.61a3 3 0 1 1-1.697-1.697l3.61-3.61A3 3 0 0 1 9 12c0-.387.073-.757.207-1.096l-3.61-3.61A3 3 0 1 1 7.5 4.5"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqConnectionsStar24 extends KbqSvgIcon {}

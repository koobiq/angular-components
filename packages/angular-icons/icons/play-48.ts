import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-play-48,[kbqPlay48]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
            <path
                d="M9 9.532c0-1.554 1.696-2.514 3.029-1.715l24.113 14.468c1.294.777 1.294 2.653 0 3.43L12.029 40.183c-1.333.8-3.029-.16-3.029-1.715z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqPlay48 extends KbqSvgIcon {}

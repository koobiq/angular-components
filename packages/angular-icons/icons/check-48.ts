import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-check-48,[kbqCheck48]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
            <path d="M44.621 13.621 20.5 37.743 5.379 22.62 9.62 18.38 20.5 29.257 40.379 9.38z" />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCheck48 extends KbqSvgIcon {}

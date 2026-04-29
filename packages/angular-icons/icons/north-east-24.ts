import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-north-east-24,[kbqNorthEast24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill-rule="evenodd" d="M9 6h9v9h-1.5V8.56L5.03 20.03l-1.06-1.06L15.44 7.5H9z" clip-rule="evenodd" />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqNorthEast24 extends KbqSvgIcon {}

import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-triangle-o-24,[kbqTriangleO24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="m11.924 4.562 8.527 14.045H3.549zm1.585-2.12c-.678-1.265-2.492-1.265-3.171 0L.96 18.356c-.644 1.199.3 2.651 1.586 2.651h18.908a1.8 1.8 0 0 0 1.586-2.651z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqTriangleO24 extends KbqSvgIcon {}

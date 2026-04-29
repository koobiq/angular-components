import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-text-font-24,[kbqTextFont24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M13.328 2.25a.3.3 0 0 1 .28.193l7.236 18.9a.3.3 0 0 1-.28.407h-2.935a.3.3 0 0 1-.283-.2l-1.529-4.367H8.166L6.64 21.549a.3.3 0 0 1-.283.201H3.436a.3.3 0 0 1-.28-.407l7.21-18.9a.3.3 0 0 1 .28-.193zM9.097 14.518h5.787l-2.897-8.273z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqTextFont24 extends KbqSvgIcon {}

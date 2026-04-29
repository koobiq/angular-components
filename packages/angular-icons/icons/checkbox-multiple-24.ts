import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-checkbox-multiple-24,[kbqCheckboxMultiple24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M19.9 3.9c.11 0 .2.09.2.2v14.2h.6a1.8 1.8 0 0 0 1.8-1.8V3.3a1.8 1.8 0 0 0-1.8-1.8H7.5a1.8 1.8 0 0 0-1.8 1.8v.6z"
                />
                <path
                    d="M3.9 8.3c0-.11.09-.2.2-.2h11.6c.11 0 .2.09.2.2v11.6a.2.2 0 0 1-.2.2H4.1a.2.2 0 0 1-.2-.2zm-.6-2.6a1.8 1.8 0 0 0-1.8 1.8v13.2a1.8 1.8 0 0 0 1.8 1.8h13.2a1.8 1.8 0 0 0 1.8-1.8V7.5a1.8 1.8 0 0 0-1.8-1.8z"
                />
                <path
                    d="M14.709 11.685a.3.3 0 0 1 0 .424l-5.675 5.675a.3.3 0 0 1-.424 0L5.087 14.26a.3.3 0 0 1 0-.425l1.273-1.272a.3.3 0 0 1 .424 0L8.822 14.6l4.19-4.189a.3.3 0 0 1 .424 0z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCheckboxMultiple24 extends KbqSvgIcon {}

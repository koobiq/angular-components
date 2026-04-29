import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-square-multiple-o-16,[kbqSquareMultipleO16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M5.6 2.6H4v-.4A1.2 1.2 0 0 1 5.2 1h8.6A1.2 1.2 0 0 1 15 2.2v8.6a1.2 1.2 0 0 1-1.2 1.2h-.4V2.8a.2.2 0 0 0-.2-.2H5.6"
                />
                <path
                    d="M1 5.2A1.2 1.2 0 0 1 2.2 4h8.6A1.2 1.2 0 0 1 12 5.2v8.6a1.2 1.2 0 0 1-1.2 1.2H2.2A1.2 1.2 0 0 1 1 13.8zm1.8.4a.2.2 0 0 0-.2.2v7.4c0 .11.09.2.2.2h7.4a.2.2 0 0 0 .2-.2V5.8a.2.2 0 0 0-.2-.2z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqSquareMultipleO16 extends KbqSvgIcon {}

import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-book-multiple-24,[kbqBookMultiple24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path d="M17 2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2V2z" />
                <path
                    d="M6 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zm5 0v6.59a.5.5 0 0 0 .888.314L14 10.3l2.112 2.604A.5.5 0 0 0 17 12.59V6z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqBookMultiple24 extends KbqSvgIcon {}

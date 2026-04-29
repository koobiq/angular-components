import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrow-up-s-16,[kbqArrowUpS16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="m8.786 4.947 2.523 2.494a.2.2 0 0 0 .285 0l.845-.839a.206.206 0 0 0 0-.292L8.142 2.06a.2.2 0 0 0-.284 0L3.56 6.31a.206.206 0 0 0 0 .292l.846.84a.2.2 0 0 0 .284 0l2.49-2.462v8.819a.2.2 0 0 0 .2.201h1.206a.2.2 0 0 0 .2-.201z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowUpS16 extends KbqSvgIcon {}

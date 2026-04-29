import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-stop-48,[kbqStop48]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
            <path
                d="M9 12.2c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C10.52 9 11.08 9 12.2 9h23.6c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874C39 10.52 39 11.08 39 12.2v23.6c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C37.48 39 36.92 39 35.8 39H12.2c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C9 37.48 9 36.92 9 35.8z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqStop48 extends KbqSvgIcon {}

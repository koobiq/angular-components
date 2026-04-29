import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-stop-32,[kbqStop32]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
            <path
                d="M6 9.2c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C7.52 6 8.08 6 9.2 6h13.6c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874C26 7.52 26 8.08 26 9.2v13.6c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C24.48 26 23.92 26 22.8 26H9.2c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C6 24.48 6 23.92 6 22.8z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqStop32 extends KbqSvgIcon {}

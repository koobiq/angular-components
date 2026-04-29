import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-block-brick-16,[kbqBlockBrick16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M1.2 2A1.2 1.2 0 0 0 0 3.2v1.834h3.806a.2.2 0 0 0 .2-.2V2.2a.2.2 0 0 0-.2-.2zm4.206 0a.2.2 0 0 0-.2.2v2.634c0 .11.09.2.2.2H15.8a.2.2 0 0 0 .2-.2V3.2A1.2 1.2 0 0 0 14.8 2zM16 6.434a.2.2 0 0 0-.2-.2h-3.597a.2.2 0 0 0-.2.2v3.14c0 .111.09.2.2.2H15.8a.2.2 0 0 0 .2-.2zm-16-.2h10.603c.11 0 .2.09.2.2v3.14a.2.2 0 0 1-.2.2H0zM0 12.8v-1.825h3.806c.11 0 .2.09.2.2V13.8a.2.2 0 0 1-.2.2H1.2A1.2 1.2 0 0 1 0 12.8m5.206 1c0 .11.09.2.2.2H14.8a1.2 1.2 0 0 0 1.2-1.2v-1.625a.2.2 0 0 0-.2-.2H5.406a.2.2 0 0 0-.2.2z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqBlockBrick16 extends KbqSvgIcon {}

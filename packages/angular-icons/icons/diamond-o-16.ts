import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-diamond-o-16,[kbqDiamondO16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M2.766 8 8 2.766 13.234 8 8 13.234zM.645 7.859a.2.2 0 0 0 0 .282l7.214 7.214a.2.2 0 0 0 .282 0l7.214-7.214a.2.2 0 0 0 0-.282L8.141.645a.2.2 0 0 0-.282 0z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqDiamondO16 extends KbqSvgIcon {}

import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-grid-group-dot-16,[kbqGridGroupDot16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path fill="currentColor" d="M16 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0" />
            <path
                d="M10.96 1H2.2a.2.2 0 0 0-.2.2v13.6c0 .11.09.2.2.2h11.6a.2.2 0 0 0 .2-.2v-1.2a.2.2 0 0 0-.2-.2H3.6V2.6h7.256A3.2 3.2 0 0 1 10.96 1m.81 3.296-.066-.067A.2.2 0 0 0 11.6 4.2H5.4a.2.2 0 0 0-.2.2v1.2c0 .11.09.2.2.2h6.2a.2.2 0 0 0 .2-.2V4.4a.2.2 0 0 0-.03-.104M5.4 7.2a.2.2 0 0 0-.2.2v1.2c0 .11.09.2.2.2h6.2a.2.2 0 0 0 .2-.2V7.4a.2.2 0 0 0-.2-.2zm0 3a.2.2 0 0 0-.2.2v1.2c0 .11.09.2.2.2h6.2a.2.2 0 0 0 .2-.2v-1.2a.2.2 0 0 0-.2-.2z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqGridGroupDot16 extends KbqSvgIcon {}

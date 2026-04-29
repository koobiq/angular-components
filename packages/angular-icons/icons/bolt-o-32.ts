import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-bolt-o-32,[kbqBoltO32]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
            <path
                d="m11.02 3.093 8.747.795a1 1 0 0 1 .864 1.294L18.5 12l3.644.729a1 1 0 0 1 .673 1.474L13.891 29.93a.4.4 0 0 1-.747-.23L14 19l-4.14-.828a1 1 0 0 1-.802-1.047l.874-13.103a1 1 0 0 1 1.088-.93m.84 2.084-.748 11.206 5.023 1.005-.422 5.28 4.682-8.25-4.467-.893 2.424-7.757z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqBoltO32 extends KbqSvgIcon {}

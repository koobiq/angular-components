import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-file-cut-o-24,[kbqFileCutO24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M3.9 14.85c2.767-.76 5.796-.37 8.34 1.22l2.065 1.29a5.69 5.69 0 0 0 5.795.14v-5.75h-6.05a.3.3 0 0 1-.3-.3V5.4H4.2a.3.3 0 0 0-.3.3zM3.3 3h12.326a.3.3 0 0 1 .212.088l6.574 6.574a.3.3 0 0 1 .088.212v8.736c0 .088-.04.173-.109.23a8.09 8.09 0 0 1-9.358.555l-2.066-1.29a8.09 8.09 0 0 0-8.96.255c-.207.147-.507.004-.507-.25V4.8A1.8 1.8 0 0 1 3.3 3"
                />
                <path
                    d="M10.85 9.45a.3.3 0 0 1-.3.3H6.3a.3.3 0 0 1-.3-.3v-1.2a.3.3 0 0 1 .3-.3h4.25a.3.3 0 0 1 .3.3z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqFileCutO24 extends KbqSvgIcon {}

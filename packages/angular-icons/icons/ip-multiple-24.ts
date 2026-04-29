import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-ip-multiple-24,[kbqIpMultiple24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M21.367 7.575c0 1.351-.454 2.49-1.298 3.291-.207-1.249-.747-2.394-1.642-3.3-.003-1.34-.801-2.232-2.445-2.232h-1.925v.382a9 9 0 0 0-.528-.016h-2.326V3.3a.3.3 0 0 1 .3-.3h5.026c3.065 0 4.838 1.892 4.838 4.575M8.854 3.3v2.4H6V3.3a.3.3 0 0 1 .3-.3h2.254a.3.3 0 0 1 .3.3m-3.3 4.2a.3.3 0 0 1 .3.3v12.9a.3.3 0 0 1-.3.3H3.3a.3.3 0 0 1-.3-.3V7.8a.3.3 0 0 1 .3-.3zm2.649.3a.3.3 0 0 1 .3-.3h5.026c3.065 0 4.838 1.892 4.838 4.575 0 2.696-1.806 4.548-4.91 4.548h-2.4V20.7a.3.3 0 0 1-.3.3H8.503a.3.3 0 0 1-.3-.3zm2.854 6.536h1.938c1.635 0 2.432-.923 2.432-2.261 0-1.345-.797-2.241-2.445-2.241h-1.925z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqIpMultiple24 extends KbqSvgIcon {}

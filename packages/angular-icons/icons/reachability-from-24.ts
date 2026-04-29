import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-reachability-from-24,[kbqReachabilityFrom24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M13.093 4.245a.3.3 0 0 1 0 .508L7.359 8.337a.3.3 0 0 1-.459-.254V5.699H1.8a.3.3 0 0 1-.3-.3v-1.8a.3.3 0 0 1 .3-.3h5.1V.915a.3.3 0 0 1 .459-.254zM22.5 19.5a3 3 0 0 1-5.75 1.2h-8.8a4.95 4.95 0 0 1 0-9.9h8.1a2.55 2.55 0 1 0 0-5.1H15V3.3h1.05a4.95 4.95 0 0 1 0 9.9h-8.1a2.55 2.55 0 0 0 0 5.1h8.8a3 3 0 0 1 5.75 1.2"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqReachabilityFrom24 extends KbqSvgIcon {}

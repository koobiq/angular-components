import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-satellite-dish-24,[kbqSatelliteDish24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M12 3.6c0 .166.134.3.3.306a8.1 8.1 0 0 1 7.794 7.794c.007.166.14.3.306.3h1.8c.166 0 .3-.134.296-.3A10.5 10.5 0 0 0 12.3 1.504a.293.293 0 0 0-.3.296zM9.753 11.868a2.251 2.251 0 1 1 2.38 2.381l5.915 5.914a.293.293 0 0 1-.036.448c-4.096 2.866-9.78 2.47-13.437-1.186a10.46 10.46 0 0 1-3.073-7.636c.04-2.035.67-4.062 1.887-5.801a.293.293 0 0 1 .448-.036z"
                />
                <path
                    d="M13.55 8.258a4 4 0 0 0-1.25-.297.32.32 0 0 1-.3-.311v-1.8c0-.166.134-.3.3-.293a6.45 6.45 0 0 1 6.143 6.143.29.29 0 0 1-.293.3h-1.8a.32.32 0 0 1-.311-.3 4.05 4.05 0 0 0-2.49-3.442"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqSatelliteDish24 extends KbqSvgIcon {}

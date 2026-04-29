import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-clock-rotate-left-24,[kbqClockRotateLeft24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M13.65 13.35a.3.3 0 0 1-.3.3H7.5a.3.3 0 0 1-.3-.3v-1.8a.3.3 0 0 1 .3-.3h3.75v-4.5a.3.3 0 0 1 .3-.3h1.8a.3.3 0 0 1 .3.3z"
                />
                <path
                    d="M7.704 18.868A8.1 8.1 0 1 0 5.128 7.706L6.83 8.77a.3.3 0 0 1-.027.524l-5.442 2.654a.3.3 0 0 1-.431-.27V5.624a.3.3 0 0 1 .458-.254l.495.31 1.209.755c3.073-4.918 9.551-6.414 14.469-3.34 4.918 3.072 6.413 9.55 3.34 14.468s-9.55 6.413-14.468 3.34a10.46 10.46 0 0 1-4.348-5.437.15.15 0 0 1 .075-.182l1.897-.946a.152.152 0 0 1 .213.092 8.07 8.07 0 0 0 3.434 4.438"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqClockRotateLeft24 extends KbqSvgIcon {}

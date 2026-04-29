import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-ubuntu-24,[kbqUbuntu24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M20.31 4.92a3.15 3.15 0 1 0-6.3 0 3.15 3.15 0 0 0 6.3 0M13.89 2.051A10 10 0 0 0 12 1.875a10.12 10.12 0 0 0-8.624 4.817q.205-.02.414-.02c.849 0 1.64.244 2.31.663a7.51 7.51 0 0 1 6.728-2.811c.085-.944.472-1.8 1.062-2.473M18.865 8.923c.422.94.657 1.98.657 3.077a7.5 7.5 0 0 1-.933 3.63 4.36 4.36 0 0 1 1.71 2.172A10.08 10.08 0 0 0 22.125 12a10.1 10.1 0 0 0-1.232-4.845 4.37 4.37 0 0 1-2.028 1.768M11.858 19.52a4.33 4.33 0 0 0 1.031 2.567q-.44.038-.889.038c-4.497 0-8.31-2.932-9.63-6.99a4.344 4.344 0 0 0 2.798.014 7.52 7.52 0 0 0 6.69 4.371M6.94 11.023a3.15 3.15 0 1 0-6.3 0 3.15 3.15 0 0 0 6.3 0M13.05 19.266a3.15 3.15 0 1 1 6.3 0 3.15 3.15 0 0 1-6.3 0"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqUbuntu24 extends KbqSvgIcon {}

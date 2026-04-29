import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-topology-star-24,[kbqTopologyStar24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M8.19 6.551a3 3 0 1 0-3.39.7v9.499a3 3 0 1 0 2.4 0V9.67a14.86 14.86 0 0 0 9.445 6.254A3.001 3.001 0 0 0 22.5 15a3 3 0 0 0-5.612-1.477 12.45 12.45 0 0 1-8.699-6.972"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqTopologyStar24 extends KbqSvgIcon {}

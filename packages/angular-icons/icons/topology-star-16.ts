import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-topology-star-16,[kbqTopologyStar16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M5.46 4.367a2 2 0 1 0-2.26.466v6.333a2 2 0 1 0 1.6 0V6.447a9.9 9.9 0 0 0 6.297 4.169 2 2 0 1 0 .162-1.6 8.3 8.3 0 0 1-5.8-4.649"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqTopologyStar16 extends KbqSvgIcon {}

import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-topology-lines-16,[kbqTopologyLines16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path d="M3.8 4.834a2 2 0 1 0-1.6 0V8.8h5v2.366a2 2 0 1 0 1.6 0V8.8h5V4.834a2 2 0 1 0-1.6 0V7.2H3.8z" />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqTopologyLines16 extends KbqSvgIcon {}

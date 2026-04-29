import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-topology-16,[kbqTopology16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M3.8 4.834a2 2 0 1 0-1.6 0v6.332A2 2 0 1 0 4.834 13.8h6.332a2 2 0 1 0 0-1.6H4.931l6.338-6.338a2 2 0 1 0-1.131-1.131L3.8 11.069z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqTopology16 extends KbqSvgIcon {}

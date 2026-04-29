import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-topology-lines-24,[kbqTopologyLines24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M5.7 7.25a3 3 0 1 0-2.4 0v5.95h7.5v3.55a3 3 0 1 0 2.4 0V13.2h7.5V7.25a3 3 0 1 0-2.4 0v3.55H5.7z" />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqTopologyLines24 extends KbqSvgIcon {}

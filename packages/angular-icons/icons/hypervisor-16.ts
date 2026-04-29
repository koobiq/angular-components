import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-hypervisor-16,[kbqHypervisor16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M14.3 3c.11 0 .2.09.2.2v2.6a.2.2 0 0 1-.2.2h-2.6a.2.2 0 0 1-.2-.2V3.2c0-.11.09-.2.2-.2zM9.3 3c.11 0 .2.09.2.2v2.6a.2.2 0 0 1-.2.2H6.7a.2.2 0 0 1-.2-.2V3.2c0-.11.09-.2.2-.2zM4.3 3c.11 0 .2.09.2.2v2.6a.2.2 0 0 1-.2.2H1.7a.2.2 0 0 1-.2-.2V3.2c0-.11.09-.2.2-.2zM1.2 8A1.2 1.2 0 0 0 0 9.2v5.6A1.2 1.2 0 0 0 1.2 16h13.6a1.2 1.2 0 0 0 1.2-1.2V9.2A1.2 1.2 0 0 0 14.8 8zM3 11.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2m11-.5a.2.2 0 0 1-.2.2H8.2A.2.2 0 0 1 8 11v-.8c0-.11.09-.2.2-.2h5.6c.11 0 .2.09.2.2zm-6 2.8V13c0-.11.09-.2.2-.2h5.6c.11 0 .2.09.2.2v.8a.2.2 0 0 1-.2.2H8.2a.2.2 0 0 1-.2-.2"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqHypervisor16 extends KbqSvgIcon {}

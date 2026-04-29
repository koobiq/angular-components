import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-ip-multiple-16,[kbqIpMultiple16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M14.245 5.05c0 .9-.303 1.66-.865 2.194-.139-.833-.498-1.596-1.095-2.2-.003-.893-.534-1.488-1.63-1.488H9.37v.254a6 6 0 0 0-.352-.01H7.47V2.2c0-.11.089-.2.2-.2h3.35c2.044 0 3.226 1.261 3.226 3.05M5.903 2.2v1.6H4V2.2c0-.11.09-.2.2-.2h1.503c.11 0 .2.09.2.2M3.703 5c.11 0 .2.09.2.2v8.6a.2.2 0 0 1-.2.2H2.2a.2.2 0 0 1-.2-.2V5.2c0-.11.09-.2.2-.2zm1.765.2c0-.11.09-.2.2-.2H9.02c2.044 0 3.226 1.261 3.226 3.05 0 1.797-1.204 3.032-3.274 3.032h-1.6V13.8a.2.2 0 0 1-.2.2H5.668a.2.2 0 0 1-.2-.2zm1.903 4.357h1.292c1.09 0 1.622-.615 1.622-1.507 0-.897-.532-1.494-1.63-1.494H7.37z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqIpMultiple16 extends KbqSvgIcon {}

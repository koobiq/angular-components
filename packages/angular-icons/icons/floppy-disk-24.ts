import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-floppy-disk-24,[kbqFloppyDisk24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M17.254 1.5a1.8 1.8 0 0 1 1.273.527l3.446 3.446a1.8 1.8 0 0 1 .527 1.273V20.7a1.8 1.8 0 0 1-1.8 1.8H3.3a1.8 1.8 0 0 1-1.8-1.8V3.3a1.8 1.8 0 0 1 1.8-1.8zM16.5 3.6a.3.3 0 0 0-.3-.3h-1.8v3.6a.3.3 0 0 1-.3.3h-1.8a.3.3 0 0 1-.3-.3V3.3H6.3a.3.3 0 0 0-.3.3v5.1a.3.3 0 0 0 .3.3h9.9a.3.3 0 0 0 .3-.3zm-12 9.3v6.9a.3.3 0 0 0 .3.3h14.4a.3.3 0 0 0 .3-.3v-6.9a.3.3 0 0 0-.3-.3H4.8a.3.3 0 0 0-.3.3"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqFloppyDisk24 extends KbqSvgIcon {}

import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-image-24,[kbqImage24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M0 4.8A1.8 1.8 0 0 1 1.8 3h20.4A1.8 1.8 0 0 1 24 4.8v14.4a1.8 1.8 0 0 1-1.8 1.8H1.8A1.8 1.8 0 0 1 0 19.2zm6.75 3.075a1.875 1.875 0 1 0-3.75 0 1.875 1.875 0 0 0 3.75 0m9.962.587a.3.3 0 0 0-.424 0L9 15.75l-2.792-2.094a.3.3 0 0 0-.392.028L2.4 17.1v1.2a.3.3 0 0 0 .3.3h18.6a.3.3 0 0 0 .3-.3v-4.95z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqImage24 extends KbqSvgIcon {}

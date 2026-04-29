import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-file-exclamation-o-24,[kbqFileExclamationO24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M10.886 6a.3.3 0 0 1 .3.318l-.533 8.752a.3.3 0 0 1-.3.282H8.873a.3.3 0 0 1-.3-.282l-.528-8.752a.3.3 0 0 1 .3-.318zM9.615 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"
                />
                <path
                    d="M14.876 0a.3.3 0 0 1 .212.088l5.824 5.824a.3.3 0 0 1 .088.212V22.2a1.8 1.8 0 0 1-1.8 1.8H4.8A1.8 1.8 0 0 1 3 22.2V1.8A1.8 1.8 0 0 1 4.8 0zM13.5 2.4H5.7a.3.3 0 0 0-.3.3v18.6a.3.3 0 0 0 .3.3h12.6a.3.3 0 0 0 .3-.3V7.5h-4.8a.3.3 0 0 1-.3-.3z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqFileExclamationO24 extends KbqSvgIcon {}

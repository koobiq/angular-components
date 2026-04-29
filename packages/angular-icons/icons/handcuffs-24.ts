import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-handcuffs-24,[kbqHandcuffs24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24">
            <path
                d="M7.2 6.883c0-1.171.613-2.139 1.421-2.639.781-.483 1.72-.528 2.572.095q.41.3.71.569L10.827 5.97c-.138.137-.158.339-.044.451l1.423 1.41a5.9 5.9 0 0 0 1.553 5.74 6.04 6.04 0 0 0 8.486 0 5.9 5.9 0 0 0 0-8.404 6.04 6.04 0 0 0-5.797-1.538l-1.423-1.41c-.113-.112-.317-.092-.455.044l-.97.961a11 11 0 0 0-.984-.8c-1.726-1.26-3.74-1.141-5.267-.197-1.5.928-2.55 2.652-2.55 4.655V9.88H3.353c-.195 0-.353.129-.353.287v1.993a5.93 5.93 0 0 0-3 5.148c0 3.282 2.686 5.942 6 5.942s6-2.66 6-5.942a5.93 5.93 0 0 0-3-5.148v-1.993c0-.158-.158-.287-.353-.287H7.2zm13.349-.034a3.54 3.54 0 0 1 0 5.042 3.625 3.625 0 0 1-5.092 0 3.54 3.54 0 0 1 0-5.042 3.625 3.625 0 0 1 5.092 0M9.6 17.308c0 1.969-1.612 3.565-3.6 3.565s-3.6-1.596-3.6-3.565c0-1.97 1.612-3.566 3.6-3.566s3.6 1.597 3.6 3.566"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqHandcuffs24 extends KbqSvgIcon {}

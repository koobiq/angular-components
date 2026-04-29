import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-build-set-24,[kbqBuildSet24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M1.8 3.3a.3.3 0 0 0-.3.3v1.8a.3.3 0 0 0 .3.3h20.4a.3.3 0 0 0 .3-.3V3.6a.3.3 0 0 0-.3-.3zm14.7 10.517c0-.256.282-.406.486-.26l6.882 4.934a.32.32 0 0 1 0 .518l-6.881 4.933c-.205.147-.487-.003-.487-.26zM1.5 9.6a.3.3 0 0 1 .3-.3h20.4a.3.3 0 0 1 .3.3v1.8a.3.3 0 0 1-.3.3H1.8a.3.3 0 0 1-.3-.3zm.3 5.7a.3.3 0 0 0-.3.3v1.8a.3.3 0 0 0 .3.3h12.9v-2.4z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqBuildSet24 extends KbqSvgIcon {}

import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-user-viewfinder-24,[kbqUserViewfinder24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M1.8 7.5a.3.3 0 0 1-.3-.3V1.8a.3.3 0 0 1 .3-.3h5.4a.3.3 0 0 1 .3.3v1.8a.3.3 0 0 1-.3.3H3.9v3.3a.3.3 0 0 1-.3.3zm20.4 0a.3.3 0 0 0 .3-.3V1.8a.3.3 0 0 0-.3-.3h-5.4a.3.3 0 0 0-.3.3v1.8a.3.3 0 0 0 .3.3h3.3v3.3a.3.3 0 0 0 .3.3zm.3 9.3a.3.3 0 0 0-.3-.3h-1.8a.3.3 0 0 0-.3.3v3.3h-3.3a.3.3 0 0 0-.3.3v1.8a.3.3 0 0 0 .3.3h5.4a.3.3 0 0 0 .3-.3zM7.2 22.5a.3.3 0 0 0 .3-.3v-1.8a.3.3 0 0 0-.3-.3H3.9v-3.3a.3.3 0 0 0-.3-.3H1.8a.3.3 0 0 0-.3.3v5.4a.3.3 0 0 0 .3.3zm7.402-14.214c0 1.676-1.165 3.47-2.602 3.47s-2.602-1.794-2.602-3.47S10.563 5.25 12 5.25s2.602 1.36 2.602 3.036M12 13.556c1.316 0 2.345-.708 3.03-1.51l1.799 1.008a1.8 1.8 0 0 1 .851 2.065l-.76 2.663a.3.3 0 0 1-.29.218H7.04a.3.3 0 0 1-.293-.24l-.556-2.722a1.8 1.8 0 0 1 .885-1.93l1.894-1.061c.685.8 1.714 1.508 3.03 1.508"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqUserViewfinder24 extends KbqSvgIcon {}

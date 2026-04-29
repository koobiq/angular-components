import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-bento-menu-32,[kbqBentoMenu32]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
            <path
                d="M10 22v4H6v-4zm8 0v4h-4v-4zm8 0v4h-4v-4zm-16-8v4H6v-4zm8 0v4h-4v-4zm8 0v4h-4v-4zM10 6v4H6V6zm8 0v4h-4V6zm8 0v4h-4V6z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqBentoMenu32 extends KbqSvgIcon {}

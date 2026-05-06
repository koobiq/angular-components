import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqBentoMenu32]',
    template: `
        <svg:path
            d="M10 22v4H6v-4zm8 0v4h-4v-4zm8 0v4h-4v-4zm-16-8v4H6v-4zm8 0v4h-4v-4zm8 0v4h-4v-4zM10 6v4H6V6zm8 0v4h-4V6zm8 0v4h-4V6z"
        />
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 32 32',
        width: '32',
        height: '32'
    }
})
export class KbqBentoMenu32 extends KbqSvgIcon {}

import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCloudHalf24]',
    template: `
        <svg:path
            d="M12 4.5a7.5 7.5 0 0 1 7.113 5.118 4.942 4.942 0 0 1-.054 9.882H5.414q-.14 0-.278-.007a5.414 5.414 0 0 1 .14-10.82A7.5 7.5 0 0 1 12 4.5m0 12.6h7.06a2.542 2.542 0 0 0 .028-5.082l-1.708-.02-.542-1.618A5.105 5.105 0 0 0 12 6.9z"
        />
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 24 24',
        width: '24',
        height: '24'
    }
})
export class KbqCloudHalf24 extends KbqSvgIcon {}

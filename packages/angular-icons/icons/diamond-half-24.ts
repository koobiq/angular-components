import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqDiamondHalf24]',
    template: `
        <svg:path
            d="M4.15 12 12 4.149 19.851 12zm-3.183-.212a.3.3 0 0 0 0 .424l10.821 10.82a.3.3 0 0 0 .424 0l10.821-10.82a.3.3 0 0 0 0-.424L12.213.967a.3.3 0 0 0-.425 0z"
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
export class KbqDiamondHalf24 extends KbqSvgIcon {}

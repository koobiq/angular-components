import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqBandAid24]',
    template: `
        <svg:g>
            <svg:path
                d="m13.537 3.038-8.52 8.537-.003.003-1.974 1.958-.002.002a5.25 5.25 0 0 0 7.42 7.428l1.998-1.932 6.57-6.57 1.94-2.006a5.25 5.25 0 0 0-7.429-7.42m4.579 8.054-.69.69a.3.3 0 0 1-.424 0l-4.783-4.784a.3.3 0 0 1 0-.424l.69-.69a.3.3 0 0 1 .424 0l4.783 4.783a.3.3 0 0 1 0 .425m-7.024 7.023a.3.3 0 0 1-.424 0l-4.783-4.783a.3.3 0 0 1 0-.423l.69-.69a.3.3 0 0 1 .423 0l4.783 4.783a.3.3 0 0 1 0 .424zm-1.506-7.068a1.033 1.033 0 1 1 1.461-1.461 1.033 1.033 0 0 1-1.46 1.46m4.828 3.367a1.033 1.033 0 1 1-1.46-1.462 1.033 1.033 0 0 1 1.46 1.462M10.458 3.034l.275.266-7.424 7.433-.271-.27a5.25 5.25 0 0 1 7.42-7.43M13.536 20.96l-.236-.238 7.427-7.427.24.247a5.25 5.25 0 0 1-7.43 7.42z"
            />
        </svg:g>
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
export class KbqBandAid24 extends KbqSvgIcon {}

import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqEnvelope24]',
    template: `
        <svg:path
            d="M3.3 3a1.8 1.8 0 0 0-1.8 1.8v1.736L12 11.601l10.5-5.065V4.8A1.8 1.8 0 0 0 20.7 3zm19.2 5.535L12 13.599 1.5 8.535V19.2A1.8 1.8 0 0 0 3.3 21h17.4a1.8 1.8 0 0 0 1.8-1.8z"
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
export class KbqEnvelope24 extends KbqSvgIcon {}

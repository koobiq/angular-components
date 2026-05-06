import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqEnvelopeDot16]',
    template: `
        <svg:path
            d="M10.96 2H2.2A1.2 1.2 0 0 0 1 3.2v1.157l6.913 3.335a.2.2 0 0 0 .174 0l4.167-2.01A3.2 3.2 0 0 1 10.959 2m2.983 4.2L8.087 9.024a.2.2 0 0 1-.174 0L1 5.69v7.11A1.2 1.2 0 0 0 2.2 14h11.6a1.2 1.2 0 0 0 1.2-1.2V6.04a3.2 3.2 0 0 1-1.057.16"
        />
        <svg:path fill="currentColor" d="M16 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0" />
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 16 16',
        width: '16',
        height: '16'
    }
})
export class KbqEnvelopeDot16 extends KbqSvgIcon {}

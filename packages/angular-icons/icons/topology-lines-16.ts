import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqTopologyLines16]',
    template: `
        <svg:path d="M3.8 4.834a2 2 0 1 0-1.6 0V8.8h5v2.366a2 2 0 1 0 1.6 0V8.8h5V4.834a2 2 0 1 0-1.6 0V7.2H3.8z" />
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
export class KbqTopologyLines16 extends KbqSvgIcon {}

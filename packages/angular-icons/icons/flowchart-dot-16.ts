import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqFlowchartDot16]',
    template: `
        <svg:circle cx="13" cy="3" r="2" fill="currentColor" />
        <svg:path
            d="M9.9 3.8H8.6v8.4H11v-1c0-.11.09-.2.2-.2h3.6c.11 0 .2.09.2.2v3.6a.2.2 0 0 1-.2.2h-3.6a.2.2 0 0 1-.2-.2v-1H7.2a.2.2 0 0 1-.2-.2V8.8H4.834a2 2 0 1 1 0-1.6H7V2.4c0-.11.09-.2.2-.2h2.7a3.2 3.2 0 0 0 0 1.6"
        />
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
export class KbqFlowchartDot16 extends KbqSvgIcon {}

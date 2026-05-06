import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqDiamondExclamation16]',
    template: `
        <svg:path
            d="M7.858.645a.2.2 0 0 1 .284 0l7.214 7.213a.2.2 0 0 1 0 .284l-7.214 7.214a.2.2 0 0 1-.284 0L.645 8.141a.2.2 0 0 1 0-.284zM8 10.04c-.49 0-.886.39-.887.88 0 .49.397.89.887.89s.887-.4.887-.89-.397-.88-.887-.88M7.272 4a.207.207 0 0 0-.2.22l.309 4.95c.006.105.094.18.2.18h.834a.193.193 0 0 0 .2-.18l.31-4.95A.206.206 0 0 0 8.728 4z"
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
export class KbqDiamondExclamation16 extends KbqSvgIcon {}

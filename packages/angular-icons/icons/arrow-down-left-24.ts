import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowDownLeft24]',
    template: `
        <svg:path
            d="M8.63 17.081h7.466c.167 0 .302.136.302.303v1.814a.3.3 0 0 1-.302.302H4.802a.3.3 0 0 1-.302-.302V7.904c0-.167.135-.303.302-.303h1.814c.167 0 .303.136.303.303v7.467L18.376 3.914a.3.3 0 0 1 .428 0l1.282 1.282a.3.3 0 0 1 0 .428z"
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
export class KbqArrowDownLeft24 extends KbqSvgIcon {}

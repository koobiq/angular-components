import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowDownRight24]',
    template: `
        <svg:path
            d="M15.37 17.081H7.905a.3.3 0 0 0-.302.303v1.814c0 .167.135.302.302.302h11.294a.3.3 0 0 0 .302-.302V7.904a.3.3 0 0 0-.302-.303h-1.814a.3.3 0 0 0-.303.303v7.467L5.624 3.914a.3.3 0 0 0-.428 0L3.914 5.196a.3.3 0 0 0 0 .428z"
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
export class KbqArrowDownRight24 extends KbqSvgIcon {}

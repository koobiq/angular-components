import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqShieldHalf24]',
    template: `
        <svg:path
            d="M12.157 23.956a.3.3 0 0 1-.314 0l-10.2-6.287a.3.3 0 0 1-.143-.256V3.304c0-.996.806-1.804 1.8-1.804h17.4c.994 0 1.8.808 1.8 1.804v14.109a.3.3 0 0 1-.143.256zM12 3.906v17.322l7.957-4.904a.3.3 0 0 0 .143-.256V4.206a.3.3 0 0 0-.3-.3z"
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
export class KbqShieldHalf24 extends KbqSvgIcon {}

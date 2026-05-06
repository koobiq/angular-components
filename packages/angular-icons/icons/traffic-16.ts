import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqTraffic16]',
    template: `
        <svg:path
            d="M8.17.591a.2.2 0 0 0-.34 0L5.441 4.414a.2.2 0 0 0 .17.306h1.588v3.39H4.72V6.52a.2.2 0 0 0-.306-.169L.591 8.741a.2.2 0 0 0 0 .338l3.823 2.39a.2.2 0 0 0 .306-.17v-1.59h2.479V15.8c0 .11.09.2.2.2h1.2a.2.2 0 0 0 .2-.2V9.71h2.481v1.589a.2.2 0 0 0 .306.17l3.823-2.39a.2.2 0 0 0 0-.339l-3.823-2.389a.2.2 0 0 0-.306.17V8.11H8.799V4.72h1.59a.2.2 0 0 0 .17-.306z"
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
export class KbqTraffic16 extends KbqSvgIcon {}

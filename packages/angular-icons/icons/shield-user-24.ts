import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqShieldUser24]',
    template: `
        <svg:path
            d="M3.3 2h17.4c.717 0 1.3.583 1.3 1.303v13.96l-10.03 6.199L2 17.266V3.303C2 2.583 2.583 2 3.3 2Zm11.618 8.939q-.143.272-.314.516c-.542.77-1.444 1.516-2.634 1.516s-2.093-.745-2.634-1.516a5 5 0 0 1-.303-.494l-.239-.451-.446.25-.697.39a2.3 2.3 0 0 0-1.13 2.47l.564 2.76a.8.8 0 0 0 .783.642h8.26a.8.8 0 0 0 .784-.641l.564-2.762c.2-.98-.257-1.979-1.13-2.469l-.74-.415-.45-.252zM11.97 5.506c-1.573 0-2.721 1.461-2.721 3.095 0 .47.088.956.248 1.41H9.39l.457.758q.108.18.235.346v.001c.444.586 1.091 1.05 1.889 1.051.805 0 1.457-.475 1.901-1.07q.12-.156.223-.328l.457-.757h-.109c.16-.455.25-.94.25-1.411 0-1.634-1.15-3.095-2.722-3.095Z"
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
export class KbqShieldUser24 extends KbqSvgIcon {}

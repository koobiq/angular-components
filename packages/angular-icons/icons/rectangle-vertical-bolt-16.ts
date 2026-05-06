import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqRectangleVerticalBolt16]',
    template: `
        <svg:path
            d="M3.2 0A1.2 1.2 0 0 0 2 1.2v13.6A1.2 1.2 0 0 0 3.2 16h9.6a1.2 1.2 0 0 0 1.2-1.2V1.2A1.2 1.2 0 0 0 12.8 0zm3.376 3h2.861c.072 0 .122.09.097.175L8.425 6.89h2.472c.089 0 .136.133.076.216L6.8 12.956c-.072.103-.205.01-.175-.122l.906-4H5.103c-.07 0-.12-.086-.098-.17L6.48 3.09c.014-.053.053-.089.097-.089"
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
export class KbqRectangleVerticalBolt16 extends KbqSvgIcon {}

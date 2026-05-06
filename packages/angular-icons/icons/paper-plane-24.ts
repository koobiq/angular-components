import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqPaperPlane24]',
    template: `
        <svg:path
            d="M22.416 11.864 1.72 1.516a.152.152 0 0 0-.215.175l2.33 8.778c.032.121.136.21.261.224L16.307 12l-12.21 1.307a.3.3 0 0 0-.262.224l-2.33 8.778a.152.152 0 0 0 .215.175l20.696-10.348a.152.152 0 0 0 0-.272"
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
export class KbqPaperPlane24 extends KbqSvgIcon {}

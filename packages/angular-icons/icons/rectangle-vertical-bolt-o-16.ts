import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqRectangleVerticalBoltO16]',
    template: `
        <svg:g>
            <svg:path
                d="M3.8 1.6h8.4c.11 0 .2.09.2.2v12.4a.2.2 0 0 1-.2.2H3.8a.2.2 0 0 1-.2-.2V1.8c0-.11.09-.2.2-.2M3.2 0A1.2 1.2 0 0 0 2 1.2v13.6A1.2 1.2 0 0 0 3.2 16h9.6a1.2 1.2 0 0 0 1.2-1.2V1.2A1.2 1.2 0 0 0 12.8 0z"
            />
            <svg:path
                d="M6.479 3.089c.014-.053.053-.089.097-.089h2.861c.072 0 .122.09.097.175L8.425 6.89h2.472c.089 0 .136.133.076.216L6.8 12.956c-.072.103-.205.01-.175-.122l.906-4H5.103c-.07 0-.12-.086-.098-.17z"
            />
        </svg:g>
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
export class KbqRectangleVerticalBoltO16 extends KbqSvgIcon {}

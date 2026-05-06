import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqListUl16]',
    template: `
        <svg:g>
            <svg:path
                d="M4 4a2 2 0 1 1-4 0 2 2 0 0 1 4 0M14.885 3.182a.2.2 0 0 1-.082.018H5.397a.2.2 0 0 1-.049-.006l-.015-.005-.011-.004A.2.2 0 0 1 5.2 3v-.8c0-.11.088-.2.197-.2h9.406q.05 0 .092.023A.2.2 0 0 1 15 2.2V3a.2.2 0 0 1-.115.182M12.054 5.8c0 .11-.088.2-.197.2h-6.46a.2.2 0 0 1-.197-.2V5c0-.11.088-.2.197-.2h6.46q.06.001.107.032a.2.2 0 0 1 .09.168zM5.397 11.2A.2.2 0 0 1 5.2 11v-.8c0-.11.088-.2.197-.2h9.406q.076.002.13.05a.2.2 0 0 1 .067.15v.8c0 .11-.088.2-.197.2zM5.2 13.8c0 .11.088.2.197.2h6.46c.109 0 .197-.09.197-.2V13a.2.2 0 0 0-.197-.2h-6.46a.197.197 0 0 0-.197.2zM2 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4"
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
export class KbqListUl16 extends KbqSvgIcon {}

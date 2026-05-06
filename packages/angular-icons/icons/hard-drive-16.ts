import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqHardDrive16]',
    template: `
        <svg:g>
            <svg:path
                d="M3.2 1A1.2 1.2 0 0 0 2 2.2v6.921A2.4 2.4 0 0 1 3.2 8.8h9.6c.437 0 .847.117 1.2.321V2.2A1.2 1.2 0 0 0 12.8 1zM13.983 11a1.2 1.2 0 0 0-1.183-1H3.2A1.2 1.2 0 0 0 2 11.2v2.6A1.2 1.2 0 0 0 3.2 15h9.6a1.2 1.2 0 0 0 1.2-1.2v-2.6a1 1 0 0 0-.017-.2M3.5 12.4v-.8c0-.11.09-.2.2-.2h2.6c.11 0 .2.09.2.2v.8a.2.2 0 0 1-.2.2H3.7a.2.2 0 0 1-.2-.2"
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
export class KbqHardDrive16 extends KbqSvgIcon {}

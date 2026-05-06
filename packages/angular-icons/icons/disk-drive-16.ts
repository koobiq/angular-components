import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqDiskDrive16]',
    template: `
        <svg:g>
            <svg:path
                d="M1 1.2c0-.11.09-.2.2-.2h2.6v14H1.2a.2.2 0 0 1-.2-.2zM12.8 1H5v7.432a6.203 6.203 0 0 1 8-4.302V1.2a.2.2 0 0 0-.2-.2M7.333 15A6.2 6.2 0 0 1 5 11.568V15z"
            />
            <svg:path d="M11 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10m0-3a2 2 0 1 1 0-4 2 2 0 0 1 0 4" />
            <svg:path d="M12 10a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
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
export class KbqDiskDrive16 extends KbqSvgIcon {}

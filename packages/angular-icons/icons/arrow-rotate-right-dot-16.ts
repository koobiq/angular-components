import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowRotateRightDot16]',
    template: `
        <svg:g>
            <svg:path
                d="M13.092 6.38c.5-.182.942-.485 1.29-.873a7.001 7.001 0 0 1-12.32 6.583 7 7 0 0 1 2.227-9.645l.007-.005-.508-.812-.206-.33a.2.2 0 0 1 .17-.306h4.035a.2.2 0 0 1 .18.288L6.198 4.908a.2.2 0 0 1-.35.018l-.704-1.129-.007.004a5.4 5.4 0 1 0 7.888 2.604z"
            />
            <svg:path d="M12.681 5.253a2.01 2.01 0 0 0 1.316-1.88 2 2 0 1 0-1.316 1.88" />
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
export class KbqArrowRotateRightDot16 extends KbqSvgIcon {}

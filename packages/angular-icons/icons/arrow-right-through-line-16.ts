import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowRightThroughLine16]',
    template: `
        <svg:g>
            <svg:path
                d="M5.4 2a.2.2 0 0 0-.2.2V6h1.6V2.2a.2.2 0 0 0-.2-.2zM5.2 13.8V10h1.6v3.8a.2.2 0 0 1-.2.2H5.4a.2.2 0 0 1-.2-.2"
            />
            <svg:path
                d="m1.198 8.802 10.946.004-2.042 2.065a.19.19 0 0 0 0 .267l.794.803a.2.2 0 0 0 .285 0l3.764-3.808a.19.19 0 0 0 0-.266L11.18 4.059a.2.2 0 0 0-.285 0l-.794.803a.19.19 0 0 0 0 .267l2.05 2.072-10.953-.003a.195.195 0 0 0-.198.192L1 8.61c0 .106.089.192.198.192"
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
export class KbqArrowRightThroughLine16 extends KbqSvgIcon {}

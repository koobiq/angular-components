import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowsRight16]',
    template: `
        <svg:path
            d="M14.941 5.406a.2.2 0 0 0 0-.284L10.633.809a.2.2 0 0 0-.285 0l-.854.855a.2.2 0 0 0 0 .283l2.508 2.511h-10.8A.2.2 0 0 0 1 4.66v1.21c0 .11.09.2.201.2h10.801L9.494 8.58a.2.2 0 0 0 0 .284l.854.855a.2.2 0 0 0 .285 0zM1.001 10.13c0-.11.09-.2.2-.2h7.651l1.61 1.61h-9.26a.2.2 0 0 1-.202-.2zm11.001 1.41H10.52l2.684-2.687 1.738 1.74a.2.2 0 0 1 0 .284l-4.308 4.313a.2.2 0 0 1-.285 0l-.854-.855a.2.2 0 0 1 0-.284z"
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
export class KbqArrowsRight16 extends KbqSvgIcon {}

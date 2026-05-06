import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqPrinter16]',
    template: `
        <svg:g>
            <svg:path
                d="M2.994 3a2 2 0 0 1 2-2h6.042a2 2 0 0 1 2 2v1h.764A1.2 1.2 0 0 1 15 5.2v6.6c0 1.172-1.14 1.2-2 1.2 0 0-.005-1.574-.005-2.02a1.7 1.7 0 0 0-1.7-1.7h-6.59a1.7 1.7 0 0 0-1.7 1.7c0 .673.008 1.347-.005 2.02-.86 0-2-.028-2-1.2V5.2A1.2 1.2 0 0 1 2.2 4h.794zm8.442 0a.4.4 0 0 0-.4-.4H4.994a.4.4 0 0 0-.4.4v1h6.841zM5 6.2a.2.2 0 0 0-.2-.2H3.2a.2.2 0 0 0-.2.2v1.6c0 .11.09.2.2.2h1.6a.2.2 0 0 0 .2-.2z"
            />
            <svg:path
                d="M11.995 10.98a.7.7 0 0 0-.7-.7h-6.59a.7.7 0 0 0-.7.7v3.32a.7.7 0 0 0 .7.7h6.59a.7.7 0 0 0 .7-.7z"
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
export class KbqPrinter16 extends KbqSvgIcon {}

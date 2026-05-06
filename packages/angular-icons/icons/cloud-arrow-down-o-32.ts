import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCloudArrowDownO32]',
    template: `
        <svg:g>
            <svg:path
                d="M30 16c0 3.19-2.727 5.873-6.077 6.002L19 22v2h5c4.33-.167 8-3.643 8-8 0-4.459-3.582-8.242-8-8.242q-.232 0-.46.013C21.936 4.36 18.49 2 14.5 2c-5.523 0-10 4.518-10 10.092 0 .071.147 1.734.147 1.734l-1.033.184C1.527 14.616 0 16.698 0 19c0 2.68 1.887 4.835 4.5 5 .022.006 8.5 0 8.5 0v-2c-.204-.002-6.015 0-7.914 0H4.5C2.937 21.867 2 20.56 2 19c0-1.382.899-2.651 2.085-3.043l2.715-.483q-.3-3.454-.3-3.382C6.5 7.62 10.086 4 14.5 4c3.118 0 5.912 1.82 7.23 4.622l.575 1.223A99 99 0 0 1 24 9.758c3.266 0 6 2.84 6 6.242"
            />
            <svg:path
                d="M15.077 31.687a.74.74 0 0 0 .674.208.73.73 0 0 0 .672-.208l4.248-4.328a.77.77 0 0 0-.003-1.078.737.737 0 0 0-1.058-.003l-3.11 3.17V16.815a.754.754 0 0 0-.75-.762.76.76 0 0 0-.75.762v12.631l-3.11-3.169a.737.737 0 0 0-1.058.003.77.77 0 0 0-.003 1.078z"
            />
        </svg:g>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 32 32',
        width: '32',
        height: '32'
    }
})
export class KbqCloudArrowDownO32 extends KbqSvgIcon {}

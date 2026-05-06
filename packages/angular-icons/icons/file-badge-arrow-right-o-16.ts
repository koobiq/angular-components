import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqFileBadgeArrowRightO16]',
    template: `
        <svg:path
            d="M13.941 3.941a.2.2 0 0 1 .059.142V8.82l-1.396-.824a1.3 1.3 0 0 0-.204-.098V5H9.2a.2.2 0 0 1-.2-.2V1.6H3.8a.2.2 0 0 0-.2.2v12.4c0 .11.09.2.2.2h6.5V16H3.2A1.2 1.2 0 0 1 2 14.8V1.2A1.2 1.2 0 0 1 3.2 0h6.717a.2.2 0 0 1 .142.059zm1.963 7.395a.187.187 0 0 1 0 .328l-3.91 2.306c-.136.08-.312-.012-.312-.163v-1.535H8.204c-.112 0-.204-.086-.204-.193v-1.158a.2.2 0 0 1 .205-.193h3.477V9.193c0-.151.176-.244.313-.163z"
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
export class KbqFileBadgeArrowRightO16 extends KbqSvgIcon {}

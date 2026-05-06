import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqFileBadgeArrowLeftO16]',
    template: `
        <svg:path
            d="M14 4.083a.2.2 0 0 0-.059-.142L10.06.06A.2.2 0 0 0 9.917 0H3.2A1.2 1.2 0 0 0 2 1.2v7.27a.2.2 0 0 0 .302.172l1.094-.646q.038-.023.078-.042A.22.22 0 0 0 3.6 7.76V1.8c0-.11.09-.2.2-.2h5c.11 0 .2.09.2.2v3c0 .11.09.2.2.2h3c.11 0 .2.09.2.2v9a.2.2 0 0 1-.2.2H5.713a.033.033 0 0 0-.033.031V15.8c0 .11.09.2.2.2h6.92a1.2 1.2 0 0 0 1.2-1.2zM.096 11.663a.187.187 0 0 1 0-.327l3.91-2.306c.136-.08.312.012.312.163v1.335c0 .11.09.2.2.2h3.277A.2.2 0 0 1 8 10.92v1.158c0 .107-.092.193-.204.193H4.518a.2.2 0 0 0-.2.2v1.335c0 .151-.176.244-.313.163z"
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
export class KbqFileBadgeArrowLeftO16 extends KbqSvgIcon {}

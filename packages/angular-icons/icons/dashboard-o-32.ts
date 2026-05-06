import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqDashboardO32]',
    template: `
        <svg:path
            d="M29 25a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2l.001-17.982a2 2 0 0 1 1.999-2l21.998-.016a2 2 0 0 1 2.002 2zm-18 0v-6l-6 .005V25zm2 0h6v-6l-6 .005zm14 0v-6l-6 .005V25zM5 17h10v-4l-10 .004zm22 0v-4l-10 .004V17zM5 11h22V7l-21.999.004z"
        />
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
export class KbqDashboardO32 extends KbqSvgIcon {}

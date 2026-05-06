import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqGitlab24]',
    template: `
        <svg:path
            d="m22.26 9.87-.03-.076-2.889-7.54a.75.75 0 0 0-.747-.474.77.77 0 0 0-.434.163.77.77 0 0 0-.257.39L15.953 8.3h-7.9l-1.95-5.969a.76.76 0 0 0-.257-.39.77.77 0 0 0-.884-.047.76.76 0 0 0-.298.358L1.77 9.789l-.03.077a5.365 5.365 0 0 0 1.78 6.2l.01.008.027.019 4.401 3.296 2.177 1.648 1.327 1.001a.89.89 0 0 0 1.078 0l1.327-1.001 2.177-1.648 4.428-3.316.01-.009A5.37 5.37 0 0 0 22.26 9.87"
        />
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 24 24',
        width: '24',
        height: '24'
    }
})
export class KbqGitlab24 extends KbqSvgIcon {}

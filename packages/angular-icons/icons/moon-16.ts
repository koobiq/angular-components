import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqMoon16]',
    template: `
        <svg:path
            d="M2.994 12.918c2.76 2.761 7.22 2.778 9.961.037 2.74-2.74 2.724-7.2-.037-9.961A7.07 7.07 0 0 0 9.025 1c-.102-.016-.155.115-.076.181q.19.16.37.339c2.169 2.17 2.182 5.673.029 7.827s-5.658 2.14-7.827-.03a6 6 0 0 1-.339-.37c-.066-.078-.197-.024-.18.077a7.07 7.07 0 0 0 1.992 3.893"
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
export class KbqMoon16 extends KbqSvgIcon {}

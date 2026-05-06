import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqChartNetwork16]',
    template: `
        <svg:path
            d="M5.817 4.975a2 2 0 1 1 1.073-.537l.332.664a3 3 0 0 1 2.432.395l1.572-1.572a2 2 0 1 1 .848.849l-1.571 1.572C10.817 6.82 11 7.389 11 8s-.183 1.18-.497 1.654l1.572 1.572a2 2 0 1 1-.848.849l-1.573-1.572a3.003 3.003 0 0 1-2.433.395l-.331.664a2 2 0 1 1-1.073-.537l.332-.664A3 3 0 0 1 5.02 8.354l-1.169-.098a2 2 0 1 1 .1-1.195l1.168.097a3 3 0 0 1 1.029-1.519z"
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
export class KbqChartNetwork16 extends KbqSvgIcon {}

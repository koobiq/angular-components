import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-formula-16,[kbqFormula16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M11.128 5.836c.11 0 .2.09.2.2v1.207a.2.2 0 0 1-.2.2H9.223v4.698q0 1.085-.388 1.835a2.55 2.55 0 0 1-1.099 1.131q-.71.393-1.708.393-.333 0-.61-.037c-.16-.015-1.45-.174-1.931-.256a.18.18 0 0 1-.146-.195l.105-1.291a.247.247 0 0 1 .27-.214 81 81 0 0 0 1.675.204q.296.036.443.036.397 0 .656-.191.258-.183.378-.548.13-.355.13-.867V7.443h-1.97a.2.2 0 0 1-.2-.2V6.036c0-.11.09-.2.2-.2h1.97v-1.95q0-1.104.406-1.852A2.7 2.7 0 0 1 8.586.893Q9.353.5 10.424.5q.36 0 .702.055c.196.03.988.208 1.378.297.1.023.166.118.153.22l-.162 1.277a.204.204 0 0 1-.247.173c-.336-.076-.932-.205-1.048-.215a4 4 0 0 0-.508-.027q-.48 0-.813.183a1.16 1.16 0 0 0-.49.547q-.165.357-.166.877v1.95z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqFormula16 extends KbqSvgIcon {}

import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-file-cut-o-16,[kbqFileCutO16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M2.6 9.9a7 7 0 0 1 5.56.813l1.376.86a3.8 3.8 0 0 0 3.864.094V7.833H9.367a.2.2 0 0 1-.2-.2V3.6H2.8a.2.2 0 0 0-.2.2zM2.2 2h8.217a.2.2 0 0 1 .142.059L14.94 6.44a.2.2 0 0 1 .059.142v5.823c0 .06-.026.116-.073.153a5.39 5.39 0 0 1-6.239.371l-1.376-.86a5.39 5.39 0 0 0-5.974.17c-.138.098-.338.003-.338-.167V3.2A1.2 1.2 0 0 1 2.2 2"
                />
                <path d="M7.233 6.3a.2.2 0 0 1-.2.2H4.2a.2.2 0 0 1-.2-.2v-.8c0-.11.09-.2.2-.2h2.833c.11 0 .2.09.2.2z" />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqFileCutO16 extends KbqSvgIcon {}

import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-dataflow-16,[kbqDataflow16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M1.133 1A.133.133 0 0 0 1 1.133v3.734c0 .073.06.133.133.133h3.734C4.94 5 5 4.94 5 4.867V3.8h5.7a1.7 1.7 0 1 1 0 3.4h-.866a2 2 0 0 0-3.668 0H5.3a3.3 3.3 0 0 0 0 6.6H11v1.067c0 .073.06.133.133.133h3.734c.073 0 .133-.06.133-.133v-3.734a.133.133 0 0 0-.133-.133h-3.734a.133.133 0 0 0-.133.133V12.2H5.3a1.7 1.7 0 0 1 0-3.4h.866a2 2 0 0 0 3.668 0h.866a3.3 3.3 0 1 0 0-6.6H5V1.133A.133.133 0 0 0 4.867 1z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqDataflow16 extends KbqSvgIcon {}

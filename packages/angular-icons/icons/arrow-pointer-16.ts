import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrow-pointer-16,[kbqArrowPointer16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16">
            <g>
                <path
                    d="m3.639 13.476 2.346-2.347a.2.2 0 0 0 0-.284l-.812-.811a.2.2 0 0 0-.284 0L2.54 12.382c.324.404.693.77 1.098 1.094M12.382 2.54q.607.49 1.094 1.099l-2.347 2.345a.2.2 0 0 1-.284 0l-.811-.81a.2.2 0 0 1 0-.285zM8.784 1.043v3.328c0 .111-.09.201-.201.201H7.435a.2.2 0 0 1-.2-.2v-3.33a7 7 0 0 1 1.549.001M1.041 7.234h3.33c.111 0 .201.09.201.201v1.148c0 .11-.09.2-.2.2H1.042a7 7 0 0 1-.002-1.549M2.533 3.628a7 7 0 0 1 1.095-1.095l2.356 2.356a.2.2 0 0 1 0 .284l-.81.811a.2.2 0 0 1-.285 0zM9.163 15.003c.035.154.226.21.338.098l1.436-1.428 2.268 2.268a.2.2 0 0 0 .284 0l2.454-2.453a.2.2 0 0 0 0-.285l-2.262-2.261 1.386-1.378a.201.201 0 0 0-.097-.339L7.759 7.542a.2.2 0 0 0-.242.24z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowPointer16 extends KbqSvgIcon {}

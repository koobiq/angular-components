import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrows-rotate-slash-16,[kbqArrowsRotateSlash16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="m14.31 14.94-1.458-1.457-1.141-1.14-7.553-7.554-1.141-1.14-1.458-1.46a.2.2 0 0 1 0-.285l.848-.848a.2.2 0 0 1 .286 0l1.459 1.458A6.97 6.97 0 0 1 8.5 1c1.934 0 3.685.784 4.952 2.053l.682-.682.275-.275a.2.2 0 0 1 .336.096l.908 3.933a.2.2 0 0 1-.24.24l-3.933-.908a.2.2 0 0 1-.097-.336l.938-.937A5.38 5.38 0 0 0 8.5 2.6c-1.2 0-2.31.392-3.207 1.055l7.552 7.552a5.37 5.37 0 0 0 1.041-2.817.102.102 0 0 1 .124-.093l1.292.298a.196.196 0 0 1 .152.213 6.97 6.97 0 0 1-1.468 3.54l1.458 1.459a.2.2 0 0 1 0 .286l-.848.848a.2.2 0 0 1-.286 0M2.34 4.672a7 7 0 0 0-.794 2.52c-.011.099.055.19.152.213l1.292.298c.06.014.12-.03.124-.093.044-.614.19-1.2.423-1.741zM10.631 12.963A5.4 5.4 0 0 1 8.5 13.4a5.38 5.38 0 0 1-3.823-1.586l.94-.94a.2.2 0 0 0-.096-.337L1.588 9.63a.2.2 0 0 0-.24.24l.908 3.932a.2.2 0 0 0 .336.097l.275-.276.678-.678A6.98 6.98 0 0 0 8.5 15a7 7 0 0 0 3.328-.84z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowsRotateSlash16 extends KbqSvgIcon {}

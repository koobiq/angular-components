import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-flowchart-dot-24,[kbqFlowchartDot24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <circle cx="19.5" cy="4.5" r="3" fill="currentColor" />
            <path
                d="M14.851 5.7H12.9v12.6h3.6v-1.5a.3.3 0 0 1 .3-.3h5.4a.3.3 0 0 1 .3.3v5.4a.3.3 0 0 1-.3.3h-5.4a.3.3 0 0 1-.3-.3v-1.5h-5.7a.3.3 0 0 1-.3-.3v-7.2H7.25a3 3 0 1 1 0-2.4h3.25V3.6a.3.3 0 0 1 .3-.3h4.051a4.8 4.8 0 0 0 0 2.4"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqFlowchartDot24 extends KbqSvgIcon {}

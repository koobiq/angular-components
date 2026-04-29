import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-map-slash-16,[kbqMapSlash16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M11.149 2.065a.1.1 0 0 0-.143.09v7.717L9.804 8.67V2.166a.1.1 0 0 0-.146-.089l-3.355 1.74a.2.2 0 0 0-.108.177V5.06L2.19 1.056a.2.2 0 0 0-.285 0l-.849.848a.2.2 0 0 0 0 .286l12.752 12.75a.2.2 0 0 0 .286 0l.848-.847a.2.2 0 0 0 0-.286l-.925-.925V3.529a.2.2 0 0 0-.116-.181zM4.992 13.842a.1.1 0 0 1-.142.09L2.1 12.65a.2.2 0 0 1-.116-.181V4.826l3.01 3.009zM6.195 9.04l3.264 3.263-3.118 1.616a.1.1 0 0 1-.146-.088z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqMapSlash16 extends KbqSvgIcon {}

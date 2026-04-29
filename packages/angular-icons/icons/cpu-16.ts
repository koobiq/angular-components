import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-cpu-16,[kbqCpu16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path d="M6.18 6.38c0-.11.09-.2.2-.2h3.2c.11 0 .2.09.2.2v3.2a.2.2 0 0 1-.2.2h-3.2a.2.2 0 0 1-.2-.2z" />
                <path
                    d="M11.78 2.98a1.2 1.2 0 0 1 1.2 1.2V5.2h1.82c.11 0 .2.09.2.2v1.2a.2.2 0 0 1-.2.2h-1.82v2.4h1.82c.11 0 .2.09.2.2v1.2a.2.2 0 0 1-.2.2h-1.82v.98a1.2 1.2 0 0 1-1.2 1.2h-.98v1.82a.2.2 0 0 1-.2.2H9.4a.2.2 0 0 1-.2-.2v-1.82H6.8v1.82a.2.2 0 0 1-.2.2H5.4a.2.2 0 0 1-.2-.2v-1.82H4.18a1.2 1.2 0 0 1-1.2-1.2v-.98H1.2a.2.2 0 0 1-.2-.2V9.4c0-.11.09-.2.2-.2h1.78V6.8H1.2a.2.2 0 0 1-.2-.2V5.4c0-.11.09-.2.2-.2h1.78V4.18a1.2 1.2 0 0 1 1.2-1.2H5.2V1.2c0-.11.09-.2.2-.2h1.2c.11 0 .2.09.2.2v1.78h2.4V1.2c0-.11.09-.2.2-.2h1.2c.11 0 .2.09.2.2v1.78zm-6.8 2.2v5.6c0 .11.09.2.2.2h5.6a.2.2 0 0 0 .2-.2v-5.6a.2.2 0 0 0-.2-.2h-5.6a.2.2 0 0 0-.2.2"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCpu16 extends KbqSvgIcon {}

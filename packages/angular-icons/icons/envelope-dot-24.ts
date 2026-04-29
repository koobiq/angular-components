import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-envelope-dot-24,[kbqEnvelopeDot24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M16.44 3H3.3a1.8 1.8 0 0 0-1.8 1.8v1.736l10.37 5.002a.3.3 0 0 0 .26 0l6.25-3.015A4.796 4.796 0 0 1 16.44 3m4.475 6.3-8.785 4.236a.3.3 0 0 1-.26 0L1.5 8.535V19.2A1.8 1.8 0 0 0 3.3 21h17.4a1.8 1.8 0 0 0 1.8-1.8V9.061a4.8 4.8 0 0 1-1.585.238"
            />
            <path fill="currentColor" d="M24 4.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqEnvelopeDot24 extends KbqSvgIcon {}

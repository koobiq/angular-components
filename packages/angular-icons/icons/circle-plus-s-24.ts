import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-circle-plus-s-24,[kbqCirclePlusS24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M5.636 18.364A9 9 0 1 0 18.364 5.636 9 9 0 0 0 5.636 18.364M16.275 12.9H12.98v3.375c0 .124-.1.225-.225.225h-1.35a.225.225 0 0 1-.225-.225V12.9H7.725a.225.225 0 0 1-.225-.225v-1.35c0-.124.1-.225.225-.225h3.455V7.725c0-.124.1-.225.225-.225h1.35c.124 0 .225.1.225.225V11.1h3.295c.124 0 .225.1.225.225v1.35c0 .124-.1.225-.225.225"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCirclePlusS24 extends KbqSvgIcon {}

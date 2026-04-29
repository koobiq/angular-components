import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-envelope-24,[kbqEnvelope24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M3.3 3a1.8 1.8 0 0 0-1.8 1.8v1.736L12 11.601l10.5-5.065V4.8A1.8 1.8 0 0 0 20.7 3zm19.2 5.535L12 13.599 1.5 8.535V19.2A1.8 1.8 0 0 0 3.3 21h17.4a1.8 1.8 0 0 0 1.8-1.8z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqEnvelope24 extends KbqSvgIcon {}

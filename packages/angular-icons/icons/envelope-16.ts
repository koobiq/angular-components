import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-envelope-16,[kbqEnvelope16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M2.2 2A1.2 1.2 0 0 0 1 3.2v1.157l7 3.377 7-3.377V3.2A1.2 1.2 0 0 0 13.8 2zM15 5.69 8 9.066 1 5.69v7.11A1.2 1.2 0 0 0 2.2 14h11.6a1.2 1.2 0 0 0 1.2-1.2z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqEnvelope16 extends KbqSvgIcon {}

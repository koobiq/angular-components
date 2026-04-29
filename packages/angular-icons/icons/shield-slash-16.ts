import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-shield-slash-16,[kbqShieldSlash16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M14.096 14.945a.2.2 0 0 1-.286 0L.06 1.192a.2.2 0 0 1 0-.286L.906.06a.2.2 0 0 1 .286 0l.943.943L2.2 1h11.6c.663 0 1.2.539 1.2 1.203v9.406a.2.2 0 0 1-.095.17l-1.232.76 1.271 1.271a.2.2 0 0 1 0 .286zM1 11.609V3.83l10.22 10.22-3.115 1.92a.2.2 0 0 1-.21 0l-6.8-4.192A.2.2 0 0 1 1 11.61"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqShieldSlash16 extends KbqSvgIcon {}

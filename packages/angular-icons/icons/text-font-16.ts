import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-text-font-16,[kbqTextFont16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M8.885 1.5a.2.2 0 0 1 .187.128l4.824 12.6a.2.2 0 0 1-.187.272h-1.956a.2.2 0 0 1-.189-.134l-1.02-2.91h-5.1l-1.017 2.91a.2.2 0 0 1-.189.134H2.29a.2.2 0 0 1-.187-.271l4.807-12.6a.2.2 0 0 1 .187-.129zm-2.82 8.179h3.858L7.99 4.164z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqTextFont16 extends KbqSvgIcon {}

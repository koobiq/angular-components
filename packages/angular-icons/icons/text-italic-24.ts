import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-text-italic-24,[kbqTextItalic24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M4.8 21.75a.3.3 0 0 1-.3-.3v-1.2a.3.3 0 0 1 .3-.3h3.254l4.892-15.9H10.05a.3.3 0 0 1-.3-.3v-1.2a.3.3 0 0 1 .3-.3h9.15a.3.3 0 0 1 .3.3v1.2a.3.3 0 0 1-.3.3h-3.024l-4.892 15.9h2.666a.3.3 0 0 1 .3.3v1.2a.3.3 0 0 1-.3.3z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqTextItalic24 extends KbqSvgIcon {}

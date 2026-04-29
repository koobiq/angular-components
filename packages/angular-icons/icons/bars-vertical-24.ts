import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-bars-vertical-24,[kbqBarsVertical24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M3.3 21c-.166 0-.3-.1-.3-.225V3.225C3 3.101 3.134 3 3.3 3h3.15c.166 0 .3.1.3.225v17.55c0 .124-.134.225-.3.225zM17.55 21c-.166 0-.3-.1-.3-.225V3.225c0-.124.134-.225.3-.225h3.15c.166 0 .3.1.3.225v17.55c0 .124-.134.225-.3.225zM10.425 3c-.166 0-.3.1-.3.225v17.55c0 .124.134.225.3.225h3.15c.166 0 .3-.1.3-.225V3.225c0-.124-.134-.225-.3-.225z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqBarsVertical24 extends KbqSvgIcon {}

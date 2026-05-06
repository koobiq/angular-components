import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqBarsVertical24]',
    template: `
        <svg:g>
            <svg:path
                d="M3.3 21c-.166 0-.3-.1-.3-.225V3.225C3 3.101 3.134 3 3.3 3h3.15c.166 0 .3.1.3.225v17.55c0 .124-.134.225-.3.225zM17.55 21c-.166 0-.3-.1-.3-.225V3.225c0-.124.134-.225.3-.225h3.15c.166 0 .3.1.3.225v17.55c0 .124-.134.225-.3.225zM10.425 3c-.166 0-.3.1-.3.225v17.55c0 .124.134.225.3.225h3.15c.166 0 .3-.1.3-.225V3.225c0-.124-.134-.225-.3-.225z"
            />
        </svg:g>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 24 24',
        width: '24',
        height: '24'
    }
})
export class KbqBarsVertical24 extends KbqSvgIcon {}

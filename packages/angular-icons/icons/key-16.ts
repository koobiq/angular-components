import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqKey16]',
    template: `
        <svg:path
            d="M8.08 6.138a3.33 3.33 0 0 1-.491-1.744C7.589 2.519 9.136 1 11.044 1S14.5 2.52 14.5 4.394s-1.547 3.394-3.456 3.394c-.71 0-1.37-.21-1.919-.571l-3.2 3.142 1.317 1.294a.19.19 0 0 1 0 .274l-.837.823a.2.2 0 0 1-.28 0l-1.317-1.294-1.157 1.136 1.277 1.254a.19.19 0 0 1 0 .274l-.838.823a.2.2 0 0 1-.28 0l-2.252-2.212a.19.19 0 0 1 0-.276zm2.964.098c1.036 0 1.876-.825 1.876-1.842s-.84-1.843-1.876-1.843-1.876.825-1.876 1.843c0 1.017.84 1.842 1.876 1.842"
        />
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 16 16',
        width: '16',
        height: '16'
    }
})
export class KbqKey16 extends KbqSvgIcon {}

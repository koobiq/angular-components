import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-link-dot-16,[kbqLinkDot16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M14.581 6.35a3.42 3.42 0 0 1-1.995-.257l-1.559 1.559a.2.2 0 0 1-.282 0l-.633-.633 1.385-1.385a.2.2 0 0 0 0-.283l-.844-.843a.2.2 0 0 0-.283 0L8.985 5.893l-.632-.633a.2.2 0 0 1 0-.283l2.128-2.129a.2.2 0 0 1 .125-.058c.039-.628.247-1.21.58-1.7a1.195 1.195 0 0 0-1.408.21L6.803 4.273a1.195 1.195 0 0 0 0 1.69L7.86 7.018l-.844.845-1.056-1.056a1.195 1.195 0 0 0-1.69 0L1.3 9.778a1.195 1.195 0 0 0 0 1.69l3.238 3.237a1.194 1.194 0 0 0 1.69 0l2.97-2.97a1.195 1.195 0 0 0 0-1.69L8.14 8.99l.844-.845 1.056 1.056a1.194 1.194 0 0 0 1.69 0zM2.848 10.765a.2.2 0 0 1 0-.283l2.125-2.124a.2.2 0 0 1 .282 0l.633.633-1.57 1.57a.2.2 0 0 0 0 .283l.844.843a.2.2 0 0 0 .282 0l1.57-1.57.633.633a.2.2 0 0 1 0 .283l-2.124 2.124a.2.2 0 0 1-.283 0z"
            />
            <g fill="currentColor">
                <path d="M16 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0" />
                <path d="M16 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0" />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqLinkDot16 extends KbqSvgIcon {}

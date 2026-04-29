import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-rectangle-ip6-16,[kbqRectangleIp616]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M11.532 10.064c-.58 0-.978-.44-.978-1.06 0-.612.398-1.047.978-1.047.564 0 .969.435.969 1.054 0 .613-.399 1.053-.97 1.053M5.763 7.948h.887c.749 0 1.114-.422 1.114-1.035 0-.616-.365-1.026-1.12-1.026h-.881z"
                />
                <path
                    d="M0 3.2A1.2 1.2 0 0 1 1.2 2h13.6A1.2 1.2 0 0 1 16 3.2v9.6a1.2 1.2 0 0 1-1.2 1.2H1.2A1.2 1.2 0 0 1 0 12.8zm10.068 3.737c-.538.79-.788 1.404-.791 2.056-.006 1.322 1.026 2.092 2.26 2.092 1.284 0 2.22-.849 2.22-2.12 0-1.189-.819-2.013-1.957-2.013-.169 0-.335.03-.486.064l1.394-2.041a.1.1 0 0 0-.083-.157h-1.02a.2.2 0 0 0-.166.088zM4.456 10.8c0 .11.09.2.2.2h.907a.2.2 0 0 0 .2-.2V8.996h1.099c1.421 0 2.248-.849 2.248-2.083 0-1.229-.811-2.095-2.215-2.095H4.656a.2.2 0 0 0-.2.2zm-1.105.2a.2.2 0 0 0 .2-.2V5.018a.2.2 0 0 0-.2-.2h-.907a.2.2 0 0 0-.2.2V10.8c0 .11.09.2.2.2z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqRectangleIp616 extends KbqSvgIcon {}

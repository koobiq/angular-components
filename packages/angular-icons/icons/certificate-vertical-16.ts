import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-certificate-vertical-16,[kbqCertificateVertical16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M2 1.2A1.2 1.2 0 0 1 3.2 0h9.6A1.2 1.2 0 0 1 14 1.2v3.88a4.4 4.4 0 0 0-5.4 6.713V16H3.2A1.2 1.2 0 0 1 2 14.8zM4 4c0 .11.09.2.2.2h3.6A.2.2 0 0 0 8 4v-.8a.2.2 0 0 0-.2-.2H4.2a.2.2 0 0 0-.2.2z"
                />
                <path
                    d="M12 6c.768 0 1.47.289 2 .764.614.55 1 1.347 1 2.236a2.99 2.99 0 0 1-1.547 2.625 3 3 0 1 1-1.81-5.604M12 6q-.18 0-.358.021zM10 16l1.951-1.129a.12.12 0 0 1 .098 0L14 16v-3.295a4.2 4.2 0 0 1-2 .506q-.306 0-.6-.042a4.2 4.2 0 0 1-1.4-.464z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCertificateVertical16 extends KbqSvgIcon {}

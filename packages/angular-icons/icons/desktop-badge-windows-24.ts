import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-desktop-badge-windows-24,[kbqDesktopBadgeWindows24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M23.84 18.623a.16.16 0 0 1 .16.16v5.057a.16.16 0 0 1-.18.159l-6.08-.784a.16.16 0 0 1-.14-.158v-4.275a.16.16 0 0 1 .16-.16zM16.277 18.623a.16.16 0 0 1 .16.16v4.077a.16.16 0 0 1-.185.159l-4.916-.775a.16.16 0 0 1-.134-.159v-3.303a.16.16 0 0 1 .16-.16z"
                />
                <path
                    d="M20.7 1.5a1.8 1.8 0 0 1 1.8 1.8v7.048l-2.4.224V4.2c0-.166-.134-.3-.3-.3H4.2c-.166 0-.3.134-.3.3v9.6c0 .166.134.3.3.3h5.197v7.986q0 .212.045.414H4.5v-2.4h3v-3.6H3.3a1.8 1.8 0 0 1-1.8-1.8V3.3a1.8 1.8 0 0 1 1.8-1.8z"
                />
                <path
                    d="M16.26 12.691a.16.16 0 0 1 .177.16v4.412a.16.16 0 0 1-.16.16h-4.916a.16.16 0 0 1-.16-.16v-3.896c0-.082.062-.15.143-.159zM23.826 12.038a.16.16 0 0 1 .174.16v5.065a.16.16 0 0 1-.16.16h-6.08a.16.16 0 0 1-.16-.16V12.72a.16.16 0 0 1 .147-.16z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqDesktopBadgeWindows24 extends KbqSvgIcon {}

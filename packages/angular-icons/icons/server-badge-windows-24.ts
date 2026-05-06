import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqServerBadgeWindows24]',
    template: `
        <svg:g>
            <svg:path
                d="M23.84 18.623a.16.16 0 0 1 .16.16v5.057a.16.16 0 0 1-.18.159l-6.08-.784a.16.16 0 0 1-.14-.158v-4.275a.16.16 0 0 1 .16-.16zM16.277 18.623a.16.16 0 0 1 .16.16v4.077a.16.16 0 0 1-.185.159l-4.916-.775a.16.16 0 0 1-.134-.159v-3.303a.16.16 0 0 1 .16-.16zM9.4 20.153l-.002.002V22.5H3.3a1.8 1.8 0 0 1-1.8-1.8v-2.4a1.8 1.8 0 0 1 1.8-1.8h6.1zM5.25 18a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M16.26 12.691a.16.16 0 0 1 .177.16v4.412a.16.16 0 0 1-.16.16h-4.916a.16.16 0 0 1-.16-.16v-3.896c0-.082.062-.15.143-.159zM23.826 12.038a.16.16 0 0 1 .174.16v5.065a.16.16 0 0 1-.16.16h-6.08a.16.16 0 0 1-.16-.16V12.72a.16.16 0 0 1 .147-.16z"
            />
            <svg:path
                d="M20.7 9c.84 0 1.541.576 1.74 1.354-3.29.286-6.58.585-9.866.92l-2.905.284a.3.3 0 0 0-.27.298V15H3.3a1.8 1.8 0 0 1-1.8-1.8v-2.4A1.8 1.8 0 0 1 3.3 9zM5.25 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M20.7 1.5a1.8 1.8 0 0 1 1.8 1.8v2.4a1.8 1.8 0 0 1-1.8 1.8H3.3a1.8 1.8 0 0 1-1.8-1.8V3.3a1.8 1.8 0 0 1 1.8-1.8zM5.25 3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m6.3.6a.3.3 0 0 0-.3.3v1.2a.3.3 0 0 0 .3.3h8.4a.3.3 0 0 0 .3-.3V3.9a.3.3 0 0 0-.3-.3z"
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
export class KbqServerBadgeWindows24 extends KbqSvgIcon {}

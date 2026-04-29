import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-folder-badge-magnifying-glass-16,[kbqFolderBadgeMagnifyingGlass16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M1 3.2A1.2 1.2 0 0 1 2.2 2H5l1.8 1.8H1zM13.29 14.14a2.765 2.765 0 0 1-4.245-2.335 2.765 2.765 0 1 1 5.097 1.482l1.8 1.8a.2.2 0 0 1 0 .285l-.57.57a.2.2 0 0 1-.284 0zm.076-2.335a1.558 1.558 0 1 0-3.117-.001 1.558 1.558 0 0 0 3.117.001"
                />
                <path d="M1 5v7.8A1.2 1.2 0 0 0 2.2 14h6.307A3.965 3.965 0 0 1 15 9.454V6.2A1.2 1.2 0 0 0 13.8 5z" />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqFolderBadgeMagnifyingGlass16 extends KbqSvgIcon {}

import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-folder-multiple-24,[kbqFolderMultiple24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M3.3 7.5a1.8 1.8 0 0 0-1.8 1.8v.9h8.7L7.5 7.5zM1.5 12v8.7a1.8 1.8 0 0 0 1.8 1.8h14.4a1.8 1.8 0 0 0 1.8-1.8v-6.9a1.8 1.8 0 0 0-1.8-1.8zM4.5 3.3a1.8 1.8 0 0 1 1.8-1.8h4.2l2.7 2.7H4.5z"
                />
                <path
                    d="M8.546 6H20.7a1.8 1.8 0 0 1 1.8 1.8v6.9a1.8 1.8 0 0 1-1.2 1.698V13.8a3.6 3.6 0 0 0-3.6-3.6h-4.954z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqFolderMultiple24 extends KbqSvgIcon {}

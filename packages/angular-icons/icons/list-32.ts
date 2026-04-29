import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-list-32,[kbqList32]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
            <g><path d="M9 6H5v4h4zM12 7h15v2H12zM27 15H12v2h15zM27 23H12v2h15zM9 22H5v4h4zM5 14h4v4H5z" /></g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqList32 extends KbqSvgIcon {}

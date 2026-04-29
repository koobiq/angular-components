import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-link-dot-24,[kbqLinkDot24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M21.872 9.526a5.13 5.13 0 0 1-2.993-.387l-2.338 2.339a.3.3 0 0 1-.424 0l-.95-.95 2.149-2.148a.2.2 0 0 0 0-.283l-1.407-1.406a.2.2 0 0 0-.283 0l-2.148 2.148-.95-.95a.3.3 0 0 1 0-.424l3.194-3.193a.3.3 0 0 1 .188-.087c.057-.942.37-1.814.87-2.55a1.79 1.79 0 0 0-2.113.313L10.205 6.41c-.7.7-.7 1.835 0 2.534l1.584 1.584-1.267 1.267-1.584-1.584c-.7-.7-1.834-.7-2.534 0l-4.455 4.456c-.7.7-.7 1.834 0 2.534l4.856 4.857c.7.7 1.835.7 2.534 0l4.456-4.456c.7-.7.7-1.834 0-2.534l-1.584-1.583 1.267-1.267 1.584 1.583c.7.7 1.834.7 2.534 0zm-17.6 6.62a.3.3 0 0 1 0-.424l3.187-3.187a.3.3 0 0 1 .424 0l.95.95-2.426 2.425a.2.2 0 0 0 0 .283L7.813 17.6a.2.2 0 0 0 .283 0l2.426-2.426.949.95a.3.3 0 0 1 0 .424l-3.186 3.186a.3.3 0 0 1-.425 0z"
            />
            <g fill="currentColor">
                <path d="M24 4.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                <path d="M24 4.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqLinkDot24 extends KbqSvgIcon {}

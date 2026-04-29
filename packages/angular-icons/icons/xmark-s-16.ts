import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-xmark-s-16,[kbqXmarkS16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M12.441 4.694a.2.2 0 0 0 0-.284l-.85-.851a.2.2 0 0 0-.285 0L8 6.865 4.694 3.56a.2.2 0 0 0-.284 0l-.851.851a.2.2 0 0 0 0 .284L6.865 8 3.56 11.306a.2.2 0 0 0 0 .284l.851.851a.2.2 0 0 0 .284 0L8 9.135l3.306 3.306a.2.2 0 0 0 .284 0l.851-.85a.2.2 0 0 0 0-.285L9.135 8z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqXmarkS16 extends KbqSvgIcon {}

import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-linkedin-16,[kbqLinkedin16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M13.8 1A1.2 1.2 0 0 1 15 2.2v11.6a1.2 1.2 0 0 1-1.2 1.2H2.2A1.2 1.2 0 0 1 1 13.8V2.2A1.2 1.2 0 0 1 2.2 1zM3 13l2.145.001V6.639H3zm7.593-6.51c-1.123 0-1.626.617-1.906 1.051v-.902H6.572c.028.597 0 6.362 0 6.362h2.115V9.448c0-.19.014-.38.07-.516.153-.38.5-.773 1.085-.773.765 0 1.071.584 1.071 1.439V13h2.114V9.354c0-1.954-1.043-2.865-2.434-2.865M8.687 7.561h-.014l.014-.021zM4.1 3.572c-.723 0-1.196.475-1.196 1.099 0 .61.459 1.1 1.168 1.1h.014c.737 0 1.196-.49 1.196-1.1-.014-.624-.46-1.099-1.182-1.099"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqLinkedin16 extends KbqSvgIcon {}

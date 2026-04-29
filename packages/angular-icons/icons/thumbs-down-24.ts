import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-thumbs-down-24,[kbqThumbsDown24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M10.366 22.46c.12.07.268.047.363-.054.934-1.004 5.714-6.148 6.916-7.564V3H6.659c-.693 0-1.322.383-1.615.997-1.147 2.399-2.882 6.292-3.396 7.448-.099.222-.148.459-.148.701v1.906c0 .981.813 1.776 1.816 1.776h6.66l-.388 1.494v.003q-.352 1.361-.71 2.721a1.81 1.81 0 0 0 .79 1.983q.345.221.698.43M20.684 14.85c1.003 0 1.816-.795 1.816-1.776V4.776c0-.98-.813-1.776-1.816-1.776H19.46v11.85z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqThumbsDown24 extends KbqSvgIcon {}

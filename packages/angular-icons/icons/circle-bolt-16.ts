import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-circle-bolt-16,[kbqCircleBolt16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14M9.677 4c.084 0 .142.082.112.158L8.496 7.5h2.884c.104 0 .158.12.089.195l-4.87 5.265c-.085.092-.239.009-.204-.11l1.057-3.6H4.62a.117.117 0 0 1-.114-.153l1.72-5.018A.12.12 0 0 1 6.338 4z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCircleBolt16 extends KbqSvgIcon {}

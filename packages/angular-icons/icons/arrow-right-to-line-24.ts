import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrow-right-to-line-24,[kbqArrowRightToLine24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M8.571 6.638a.3.3 0 0 0 0 .422l3.693 3.74H1.8a.3.3 0 0 0-.3.3v1.8a.3.3 0 0 0 .3.3h10.464l-3.693 3.741a.3.3 0 0 0 0 .422l1.254 1.27a.3.3 0 0 0 .427 0l6.34-6.422a.3.3 0 0 0 0-.421l-6.34-6.422a.3.3 0 0 0-.427 0zM20.7 22.5a.3.3 0 0 0 .3-.3V1.8a.3.3 0 0 0-.3-.3h-1.8a.3.3 0 0 0-.3.3v20.4a.3.3 0 0 0 .3.3z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowRightToLine24 extends KbqSvgIcon {}

import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-regex-24,[kbqRegex24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M15.912 1.8a.3.3 0 0 0-.3-.3h-1.94a.3.3 0 0 0-.3.3v4.556L9.356 5.05a.3.3 0 0 0-.378.192l-.6 1.844a.3.3 0 0 0 .192.378l4.173 1.358-2.65 3.42a.3.3 0 0 0 .053.422l1.533 1.188a.3.3 0 0 0 .42-.054l2.544-3.282 2.543 3.282a.3.3 0 0 0 .421.053l1.533-1.187a.3.3 0 0 0 .053-.421l-2.65-3.42 4.173-1.359a.3.3 0 0 0 .192-.378l-.6-1.844a.3.3 0 0 0-.378-.192l-4.017 1.307zM6.454 22.5a3.454 3.454 0 1 0 0-6.908 3.454 3.454 0 0 0 0 6.908"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqRegex24 extends KbqSvgIcon {}

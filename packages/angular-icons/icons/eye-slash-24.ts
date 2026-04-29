import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-eye-slash-24,[kbqEyeSlash24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M21.554 23.162c.119.117.311.117.43 0l1.288-1.276a.3.3 0 0 0 0-.425L18.7 16.933l5.202-4.711a.3.3 0 0 0 0-.444L18.117 6.54a9.12 9.12 0 0 0-10.916-.993L2.446.838a.306.306 0 0 0-.43 0L.728 2.114a.3.3 0 0 0 0 .425zm-4.761-8.117-1.676-1.66c.192-.422.3-.891.3-1.385 0-1.868-1.53-3.383-3.417-3.383-.499 0-.972.106-1.4.296L8.926 7.254A5.7 5.7 0 0 1 12 6.362c3.145 0 5.694 2.524 5.694 5.638 0 1.122-.331 2.167-.901 3.045M6.306 12q.002-.644.14-1.247L3.955 8.286.099 11.778a.3.3 0 0 0 0 .444l5.784 5.238a9.12 9.12 0 0 0 9.183 1.828L13.259 17.5q-.609.137-1.259.138c-3.144 0-5.694-2.524-5.694-5.638"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqEyeSlash24 extends KbqSvgIcon {}

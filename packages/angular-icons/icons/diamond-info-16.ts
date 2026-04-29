import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-diamond-info-16,[kbqDiamondInfo16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M7.269 10.818c0 .11.09.2.2.2H8.58a.2.2 0 0 0 .2-.2V6.763a.2.2 0 0 0-.2-.2H7.47a.2.2 0 0 0-.2.2zM7.212 5.093c0 .423.369.767.816.767.451 0 .82-.344.82-.767 0-.419-.369-.763-.82-.763-.447 0-.816.344-.816.763"
                />
                <path
                    d="M.645 8.141a.2.2 0 0 1 0-.282L7.859.645a.2.2 0 0 1 .282 0l7.214 7.214a.2.2 0 0 1 0 .282l-7.214 7.214a.2.2 0 0 1-.282 0zM8 13.234 13.234 8 8 2.766 2.766 8z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqDiamondInfo16 extends KbqSvgIcon {}

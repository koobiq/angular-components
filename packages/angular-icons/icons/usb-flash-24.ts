import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-usb-flash-24,[kbqUsbFlash24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M17.94.089a.3.3 0 0 0-.427 0L13.46 4.154l6.399 6.42 4.053-4.066a.303.303 0 0 0 0-.428zm-.157 2.732.854.856a.303.303 0 0 1 0 .428l-.854.856a.3.3 0 0 1-.426 0l-.853-.856a.303.303 0 0 1 0-.428l.853-.856a.3.3 0 0 1 .426 0m3.413 3.424a.304.304 0 0 1 0 .428l-.853.856a.3.3 0 0 1-.427 0l-.853-.856a.303.303 0 0 1 0-.428l.853-.856a.3.3 0 0 1 .427 0zM10.78 4.041a.04.04 0 0 0-.057 0l-7.73 7.757a6.52 6.52 0 0 0 0 9.202 6.47 6.47 0 0 0 9.173 0l7.728-7.757a.04.04 0 0 0 0-.058z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqUsbFlash24 extends KbqSvgIcon {}

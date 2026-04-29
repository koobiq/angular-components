import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrow-rotate-left-24,[kbqArrowRotateLeft24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M17.725 17.728a8.1 8.1 0 1 0-11.455 0l1.42-1.42a.3.3 0 0 1 .504.144l1.362 5.9a.3.3 0 0 1-.36.36l-5.9-1.362a.3.3 0 0 1-.144-.505l.414-.412 1.007-1.008c-4.1-4.1-4.1-10.75 0-14.85s10.749-4.1 14.85 0 4.1 10.75 0 14.85a10.46 10.46 0 0 1-6.147 2.997.294.294 0 0 1-.32-.225l-.465-1.935a.153.153 0 0 1 .137-.186 8.07 8.07 0 0 0 5.097-2.348"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowRotateLeft24 extends KbqSvgIcon {}

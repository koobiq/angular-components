import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-circle-info-24,[kbqCircleInfo24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M12 22.5C6.201 22.5 1.5 17.799 1.5 12S6.201 1.5 12 1.5 22.5 6.201 22.5 12 17.799 22.5 12 22.5m-1.258-5.753a.3.3 0 0 0 .3.3h1.899a.3.3 0 0 0 .3-.3V9.989a.3.3 0 0 0-.3-.3h-1.9a.3.3 0 0 0-.3.3zm-.094-9.486c0 .698.61 1.267 1.35 1.267.744 0 1.354-.569 1.354-1.267 0-.692-.61-1.261-1.355-1.261-.739 0-1.349.569-1.349 1.261"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCircleInfo24 extends KbqSvgIcon {}

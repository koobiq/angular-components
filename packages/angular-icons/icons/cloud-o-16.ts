import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-cloud-o-16,[kbqCloudO16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="m11.587 8-.362-1.08a3.402 3.402 0 0 0-6.274-.427l-.429.865-.965.024A2.01 2.01 0 0 0 3.61 11.4h9.097a1.694 1.694 0 0 0 .02-3.388zm-7.978 5a3.61 3.61 0 0 1-.091-7.218 5 5 0 0 1 9.224.63A3.294 3.294 0 0 1 12.707 13z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCloudO16 extends KbqSvgIcon {}

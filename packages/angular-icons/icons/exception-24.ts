import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-exception-24,[kbqException24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="m22.934 12.234-4.236 4.235a.3.3 0 0 1-.424 0l-1.273-1.272a.3.3 0 0 1 0-.425L19.773 12 17.09 9.316a.3.3 0 0 1 0-.424l1.273-1.273a.3.3 0 0 1 .424 0l4.148 4.148a.33.33 0 0 1 0 .467M12 4.226 9.227 6.998a.3.3 0 0 1-.424 0L7.53 5.725a.3.3 0 0 1 0-.424l4.235-4.236a.33.33 0 0 1 .467 0l4.34 4.34a.3.3 0 0 1 0 .424L15.3 7.102a.3.3 0 0 1-.425 0zM7.013 9.212a.3.3 0 0 0 0-.425L5.74 7.515a.3.3 0 0 0-.424 0l-4.253 4.252a.33.33 0 0 0 0 .467l4.34 4.34a.3.3 0 0 0 .425 0L7.1 15.3a.3.3 0 0 0 0-.424L4.224 12zm9.472 9.471a.3.3 0 0 0 0-.424l-1.273-1.273a.3.3 0 0 0-.425 0L12 19.775 9.314 17.09a.3.3 0 0 0-.424 0l-1.273 1.272a.3.3 0 0 0 0 .425l4.148 4.148a.33.33 0 0 0 .467 0zM14.999 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqException24 extends KbqSvgIcon {}

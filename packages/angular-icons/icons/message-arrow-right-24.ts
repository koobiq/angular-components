import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-message-arrow-right-24,[kbqMessageArrowRight24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M1.5 6.6A3.6 3.6 0 0 1 5.1 3h13.8a3.6 3.6 0 0 1 3.6 3.6v9.3a3.6 3.6 0 0 1-3.6 3.6h-7.275l-5.138 4.11A.3.3 0 0 1 6 23.376V19.5h-.9a3.6 3.6 0 0 1-3.6-3.6zm12.462.478a.3.3 0 0 0-.425 0l-.848.848a.3.3 0 0 0 0 .425l2.001 2.001H6.3a.3.3 0 0 0-.3.3v1.2a.3.3 0 0 0 .3.3h8.39l-2.001 2.002a.3.3 0 0 0 0 .424l.848.848a.3.3 0 0 0 .425 0l3.962-3.962a.3.3 0 0 0 0-.424z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqMessageArrowRight24 extends KbqSvgIcon {}

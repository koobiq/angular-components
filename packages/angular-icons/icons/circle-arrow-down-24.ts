import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-circle-arrow-down-24,[kbqCircleArrowDown24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M12 22.5c5.799 0 10.5-4.701 10.5-10.5S17.799 1.5 12 1.5 1.5 6.201 1.5 12 6.201 22.5 12 22.5m.642-4.694-.045.042-.387.388a.3.3 0 0 1-.424 0l-.849-.849-.02-.023-4.591-4.59a.3.3 0 0 1 0-.425l.848-.848a.3.3 0 0 1 .425 0l3.501 3.501V6.3a.3.3 0 0 1 .3-.3h1.2a.3.3 0 0 1 .3.3v8.702l3.501-3.501a.3.3 0 0 1 .425 0l.848.848a.3.3 0 0 1 0 .425z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCircleArrowDown24 extends KbqSvgIcon {}

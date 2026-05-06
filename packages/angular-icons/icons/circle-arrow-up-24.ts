import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCircleArrowUp24]',
    template: `
        <svg:path
            d="M12 1.5c5.799 0 10.5 4.701 10.5 10.5S17.799 22.5 12 22.5 1.5 17.799 1.5 12 6.201 1.5 12 1.5m-.642 4.694-5.032 5.033a.3.3 0 0 0 0 .424l.848.848a.3.3 0 0 0 .425 0L11.1 8.998V17.7a.3.3 0 0 0 .3.3h1.2a.3.3 0 0 0 .3-.3V8.998l3.501 3.501a.3.3 0 0 0 .425 0l.848-.848a.3.3 0 0 0 0-.425l-4.59-4.59-.021-.023-.849-.849a.3.3 0 0 0-.424 0l-.387.388z"
        />
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 24 24',
        width: '24',
        height: '24'
    }
})
export class KbqCircleArrowUp24 extends KbqSvgIcon {}

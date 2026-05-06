import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqPlug24]',
    template: `
        <svg:path
            d="M15.198 1.59a.3.3 0 0 1 .424 0l1.273 1.273a.3.3 0 0 1 0 .424l-2.97 2.97 3.818 3.818 2.97-2.97a.3.3 0 0 1 .424 0l1.273 1.273a.3.3 0 0 1 0 .425l-2.97 2.97 1.485 1.484a.3.3 0 0 1 0 .425l-3.622 3.621A7.5 7.5 0 0 1 9.892 19.2l-2.135 2.135-1.697-1.697-2.782 2.782a.3.3 0 0 1-.424 0l-1.273-1.273a.3.3 0 0 1 0-.425l2.782-2.781-1.697-1.697 2.135-2.135a7.5 7.5 0 0 1 1.896-7.411l3.621-3.622a.3.3 0 0 1 .425 0l1.485 1.485zm-4.259 11.47a1.5 1.5 0 1 0 2.122-2.12 1.5 1.5 0 0 0-2.122 2.12"
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
export class KbqPlug24 extends KbqSvgIcon {}

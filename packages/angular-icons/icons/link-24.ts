import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqLink24]',
    template: `
        <svg:path
            d="m11.795 10.522-1.583-1.584c-.7-.7-.7-1.834 0-2.534l4.455-4.456c.7-.7 1.834-.7 2.534 0l4.857 4.857c.7.7.7 1.835 0 2.534l-4.455 4.456c-.7.7-1.835.7-2.534 0l-1.584-1.584-1.267 1.267 1.584 1.584c.7.7.7 1.834 0 2.534l-4.463 4.462c-.7.7-1.834.7-2.534 0L1.95 17.2c-.7-.7-.7-1.834 0-2.534l4.462-4.462c.7-.7 1.834-.7 2.534 0l1.583 1.584zm7.94-2.238a.3.3 0 0 0 0-.424l-3.589-3.588a.3.3 0 0 0-.424 0L12.536 7.46a.3.3 0 0 0 0 .424l.949.95 2.355-2.356a.3.3 0 0 1 .424 0l1.265 1.265a.3.3 0 0 1 0 .425l-2.355 2.355.95.95a.3.3 0 0 0 .424 0zm-9.207 6.884-2.077 2.077a.3.3 0 0 1-.424 0L6.762 15.98a.3.3 0 0 1 0-.424l2.077-2.078-.95-.95a.3.3 0 0 0-.424 0l-3.193 3.194a.3.3 0 0 0 0 .424l3.588 3.588a.3.3 0 0 0 .425 0l3.193-3.193a.3.3 0 0 0 0-.424z"
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
export class KbqLink24 extends KbqSvgIcon {}

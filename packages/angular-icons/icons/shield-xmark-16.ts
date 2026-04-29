import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-shield-xmark-16,[kbqShieldXmark16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M2.2 1A1.2 1.2 0 0 0 1 2.202v9.383a.2.2 0 0 0 .115.181l6.8 4.215a.2.2 0 0 0 .17 0l6.8-4.214a.2.2 0 0 0 .115-.182V2.202A1.2 1.2 0 0 0 13.8 1zm8.517 9.624a.2.2 0 0 1-.283 0L8 8.19l-2.434 2.434a.2.2 0 0 1-.283 0l-.566-.565a.2.2 0 0 1 0-.283L7.151 7.34 4.717 4.907a.2.2 0 0 1 0-.283l.566-.565a.2.2 0 0 1 .283 0L8 6.493l2.434-2.434a.2.2 0 0 1 .283 0l.566.565a.2.2 0 0 1 0 .283L8.849 7.341l2.434 2.435a.2.2 0 0 1 0 .283z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqShieldXmark16 extends KbqSvgIcon {}

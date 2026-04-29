import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-shield-xmark-24,[kbqShieldXmark24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M3.3 1.5c-.994 0-1.8.807-1.8 1.803v14.075a.3.3 0 0 0 .172.272l10.2 6.321a.3.3 0 0 0 .256 0l10.2-6.321a.3.3 0 0 0 .172-.272V3.303c0-.996-.806-1.803-1.8-1.803zm12.776 14.436a.3.3 0 0 1-.425 0L12 12.285l-3.651 3.651a.3.3 0 0 1-.425 0l-.848-.848a.3.3 0 0 1 0-.424l3.651-3.652-3.651-3.651a.3.3 0 0 1 0-.425l.848-.848a.3.3 0 0 1 .425 0L12 9.739l3.652-3.651a.3.3 0 0 1 .424 0l.848.848a.3.3 0 0 1 0 .425l-3.651 3.651 3.651 3.652a.3.3 0 0 1 0 .424z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqShieldXmark24 extends KbqSvgIcon {}

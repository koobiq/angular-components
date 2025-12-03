import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { KbqIcon } from './icon.component';

@Component({
    selector: `[kbq-icon-item]`,
    template: '<ng-content />',
    styleUrls: ['icon-item.scss', 'icon-item-tokens.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'kbq kbq-icon-item kbq-icon-item_filled',
        '[class.kbq-icon-item_normal]': '!big',
        '[class.kbq-icon-item_big]': 'big',
        '[class.kbq-icon-item_fade-off]': '!fade',
        '[class.kbq-icon-item_fade-on]': 'fade'
    }
})
export class KbqIconItem extends KbqIcon {
    override name = 'KbqIconItem';

    /** Name of an icon within a @koobiq/icons. */
    @Input({ alias: 'kbq-icon-item' }) iconName: string;

    @Input() fade: boolean = false;
    @Input() big: boolean = false;
}

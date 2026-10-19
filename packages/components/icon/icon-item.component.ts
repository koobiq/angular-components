import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';
import { KbqIcon } from './icon.component';

/**
 * An icon on a filled round background — the status badge of an alert or an empty state. Decorative like
 * `KbqIcon`, and hidden from assistive technology by the same default.
 *
 * Host metadata is inherited from `KbqIcon` through `ɵɵInheritDefinitionFeature`; DI tokens are not, so a
 * `contentChild(KbqIcon)` does not match an icon item. That is deliberate — a host that wants both asks
 * for both, the way `KbqAlert` does, and telling them apart is what lets it report two projected icons.
 */
@Component({
    selector: `[kbq-icon-item]`,
    template: '<ng-content />',
    styleUrls: ['icon-item.scss', 'icon-item-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq kbq-icon-item kbq-icon-item_filled',
        '[class.kbq-icon-item_normal]': '!big()',
        '[class.kbq-icon-item_big]': 'big()',
        '[class.kbq-icon-item_fade-off]': '!fade()',
        '[class.kbq-icon-item_fade-on]': 'fade()'
    }
})
export class KbqIconItem extends KbqIcon {
    /** The item sizes itself through its own padding, so it never gets the bare icon's `max-height`. */
    protected override readonly appliesMaxHeight: boolean = false;

    /** @docs-private */
    override readonly iconNameInput = input<string | undefined>(undefined, { alias: 'kbq-icon-item' });

    /** Whether the background is the translucent "fade" variant of the color rather than the solid one. */
    readonly fade = input<boolean>(false);
    /** Whether the item is rendered at the larger of its two sizes. */
    readonly big = input<boolean>(false);
}

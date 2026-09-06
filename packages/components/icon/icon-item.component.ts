import { ChangeDetectionStrategy, Component, forwardRef, Input, input, ViewEncapsulation } from '@angular/core';
import { KbqIcon } from './icon.component';

/**
 * An icon on a filled round background — the status badge of an alert or an empty state. Decorative like
 * `KbqIcon`, and hidden from assistive technology by the same default.
 */
@Component({
    selector: `[kbq-icon-item]`,
    template: '<ng-content />',
    styleUrls: ['icon-item.scss', 'icon-item-tokens.scss'],
    // See the note on `KbqIconButton`: the host class is inherited, the `KbqIcon` token has to be provided.
    providers: [{ provide: KbqIcon, useExisting: forwardRef(() => KbqIconItem) }],
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

    /** Name of an icon within a @koobiq/icons. */
    // Kept as @Input() to stay compatible with KbqIcon.iconName (also @Input()).
    // Migrate together with the rest of the KbqIcon hierarchy in a follow-up.
    @Input({ alias: 'kbq-icon-item' }) override iconName: string | undefined;

    /** Whether the background is the translucent "fade" variant of the color rather than the solid one. */
    readonly fade = input<boolean>(false);
    /** Whether the item is rendered at the larger of its two sizes. */
    readonly big = input<boolean>(false);
}

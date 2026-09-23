import {
    ChangeDetectionStrategy,
    Component,
    Directive,
    ViewEncapsulation,
    computed,
    contentChild,
    contentChildren,
    effect,
    forwardRef,
    inject,
    input
} from '@angular/core';
import { KbqComponentColors, KbqDefaultSizes } from '@koobiq/components/core';
import { KbqIconItem } from '@koobiq/components/icon';
import { KBQ_EMPTY_STATE_CONTEXT, KbqEmptyStateContext } from './empty-state-context';

/**
 * Illustration slot of `kbq-empty-state`. Holds an icon, an image or any other element.
 *
 * A `kbq-icon-item` follows the empty state's `errorColor`, whether the directive sits on the icon
 * itself or wraps it.
 */
@Directive({
    selector: '[kbq-empty-state-icon]',
    host: {
        class: 'kbq-empty-state-icon'
    }
})
export class KbqEmptyStateIcon {
    private readonly emptyState = inject(KBQ_EMPTY_STATE_CONTEXT, { optional: true });
    private readonly hostIcon = inject(KbqIconItem, { optional: true, self: true });
    private readonly wrappedIcons = contentChildren(KbqIconItem, { descendants: true });

    constructor() {
        const emptyState = this.emptyState;

        if (!emptyState) return;

        effect(() => {
            const errorColor = emptyState.errorColor();
            const wrapped = this.wrappedIcons();
            const icons = this.hostIcon ? [this.hostIcon, ...wrapped] : wrapped;

            icons.forEach((icon) => this.applyErrorColor(icon, errorColor));
        });
    }

    /**
     * Tints an icon with the error color, or reveals whatever color it currently carries.
     *
     * `KbqIcon` already renders `kbq-error` additively over its own `kbq-<color>` class through its
     * `hasError` field — the same field `autoColor` drives — so setting it here, instead of
     * overwriting `color`, means a live `[color]` binding on the icon is never fought over: the tint
     * class layers on top of whatever color is currently set and simply lifts off it when cleared.
     * The class is also applied directly so the tint shows immediately, without waiting for the
     * icon's own change detection to run.
     *
     * Lifting the tint off must not take the class away from an icon that carries `color="error"` of
     * its own: `KbqColorDirective` adds `kbq-error` from its setter and only ever touches it again
     * when the bound color changes, and the icon's `[class.kbq-error]` binding stays at `true`
     * throughout, so neither would put back a class removed here — the icon would lose the color the
     * consumer set on it, permanently.
     */
    private applyErrorColor(icon: KbqIconItem, errorColor: boolean): void {
        const ownsErrorColor = icon.color === KbqComponentColors.Error;

        icon.hasError = errorColor;
        icon.elementRef.nativeElement.classList.toggle(`kbq-${KbqComponentColors.Error}`, errorColor || ownsErrorColor);
    }
}

/** Text slot of `kbq-empty-state`, rendered below the title. */
@Directive({
    selector: '[kbq-empty-state-text]',
    host: {
        class: 'kbq-empty-state-text'
    }
})
export class KbqEmptyStateText {}

/**
 * Title slot of `kbq-empty-state`, rendered below the illustration.
 *
 * It carries heading typography — `subheading` at `size="normal"`, `headline` at `size="big"` — so
 * the host element should be a real heading of the level the surrounding page calls for:
 * `<h2 kbq-empty-state-title>`.
 */
@Directive({
    selector: '[kbq-empty-state-title]',
    host: {
        class: 'kbq-empty-state-title'
    }
})
export class KbqEmptyStateTitle {}

/** Actions slot of `kbq-empty-state`, rendered below the text. Holds buttons, links or pseudo-links. */
@Directive({
    selector: '[kbq-empty-state-actions]',
    host: {
        class: 'kbq-empty-state-actions'
    }
})
export class KbqEmptyStateActions {}

/**
 * Placeholder rendered in place of content that is empty, unavailable or failed to load. Projects an
 * illustration, a title, a text and an actions row, in that order.
 *
 * ```html
 * <kbq-empty-state>
 *     <h2 kbq-empty-state-title>No groups</h2>
 *     <div kbq-empty-state-text>Agents can be grouped and given the same policies</div>
 * </kbq-empty-state>
 * ```
 *
 * The host has no intrinsic height — it grows as a flex item and is otherwise as tall as its
 * content, which leaves `alignTop` indistinguishable from the default. Give the host or its
 * container a height for the alignment to mean anything.
 *
 * For an empty state inserted dynamically, add `role="status"` — or `role="alert"` for the error
 * variant — on the host so assistive technology announces it. See the component guide.
 */
@Component({
    selector: 'kbq-empty-state',
    templateUrl: './empty-state.component.html',
    styleUrls: ['./empty-state.scss'],
    providers: [{ provide: KBQ_EMPTY_STATE_CONTEXT, useExisting: forwardRef(() => KbqEmptyState) }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-empty-state',
        '[class]': 'emptyStateSizeClass()',
        '[class.kbq-empty-state_align-center]': '!alignTop()',
        '[class.kbq-empty-state_align-top]': 'alignTop()',
        '[class.kbq-empty-state_normal-color]': '!errorColor()',
        '[class.kbq-empty-state_error-color]': 'errorColor()',
        '[class.kbq-empty-state_has-icon]': '!!icon()'
    },
    exportAs: 'kbqEmptyState'
})
export class KbqEmptyState implements KbqEmptyStateContext {
    /** Whether the title, the text and the projected icon render in the error color. Defaults to `false`. */
    readonly errorColor = input<boolean>(false);
    /** Whether the content sits at the top of the host instead of its center. Defaults to `false`. */
    readonly alignTop = input<boolean>(false);
    /**
     * Size tier of the placeholder: `compact`, `normal` or `big`. Drives every padding and offset,
     * the maximum width of the title and the text, and their typography. Defaults to `normal`.
     */
    readonly size = input<KbqDefaultSizes>('normal');

    /** @docs-private */
    protected readonly icon = contentChild(KbqEmptyStateIcon);

    /** @docs-private */
    protected readonly emptyStateSizeClass = computed(() => `kbq-empty-state_${this.size()}`);
}

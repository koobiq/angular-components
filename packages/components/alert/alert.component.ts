import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    Directive,
    effect,
    input,
    output,
    ViewEncapsulation
} from '@angular/core';
import { KbqButton } from '@koobiq/components/button';
import { KbqComponentColors, KbqEnumValues } from '@koobiq/components/core';
import { KbqIcon, KbqIconItem } from '@koobiq/components/icon';

/** Visual style of an alert. */
export enum KbqAlertStyles {
    /** Neutral background; the status is conveyed by the icon color only. */
    Default = 'default',
    /** Colored background matching the status — use to draw attention when a default alert gets lost on screen. */
    Colored = 'colored'
}

/** Status conveyed by an alert. Drives the background (colored style) and the auto-tinted status icon. */
export enum KbqAlertColors {
    Error = 'error',
    Warning = 'warning',
    Success = 'success',
    Info = 'info'
}

/** Maps an alert status to the projected status icon's color. `Info` has no icon color of its own, so it uses `Contrast`. */
const alertIconColors: Record<KbqEnumValues<KbqAlertColors>, KbqComponentColors> = {
    [KbqAlertColors.Error]: KbqComponentColors.Error,
    [KbqAlertColors.Warning]: KbqComponentColors.Warning,
    [KbqAlertColors.Success]: KbqComponentColors.Success,
    [KbqAlertColors.Info]: KbqComponentColors.Contrast
};

/** Marks the projected alert heading. */
@Directive({
    selector: '[kbq-alert-title]',
    host: {
        class: 'kbq-alert__title'
    },
    exportAs: 'kbqAlertTitle'
})
export class KbqAlertTitle {}

/** Marks the projected close control (place it on a native `<button>` with an accessible name). */
@Directive({
    selector: '[kbq-alert-close-button]',
    host: {
        class: 'kbq-alert-close-button'
    },
    exportAs: 'kbqAlertCloseButton'
})
export class KbqAlertCloseButton {}

/** Marks a projected action control (link or button) shown in the alert's button stack. */
@Directive({
    selector: '[kbq-alert-control]',
    host: {
        class: 'kbq-alert-control'
    },
    exportAs: 'kbqAlertControl'
})
export class KbqAlertControl {}

/**
 * Shows important information on a page. Can carry a hint, signal a status change, or indicate a problem.
 *
 * ```html
 * <kbq-alert [alertColor]="'error'" [alertStyle]="'colored'">Something went wrong</kbq-alert>
 * ```
 *
 * For a dynamically inserted alert, add `role="alert"` (or `aria-live`) on the host so assistive
 * technology announces it — see the component guide.
 */
@Component({
    selector: 'kbq-alert',
    templateUrl: './alert.component.html',
    styleUrls: ['alert.component.scss', 'alert-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-alert',
        '[class]': 'alertColorClass()',
        '[class.kbq-alert_normal]': '!compact()',
        '[class.kbq-alert_compact]': 'compact()',
        '[class.kbq-alert_default]': '!isColored()',
        '[class.kbq-alert_colored]': 'isColored()',
        '[class.kbq-alert_dismissible]': 'closeButton()'
    },
    exportAs: 'kbqAlert'
})
export class KbqAlert {
    /** @docs-private */
    protected readonly iconItem = contentChild(KbqIconItem, { descendants: false });
    /** @docs-private */
    protected readonly icon = contentChild(KbqIcon, { descendants: false });
    // NB: `button` must keep the default `descendants: true` — it does not gate a projection slot, it
    // reports whether the already-projected `[kbq-alert-control]` slot contains a button (which can sit
    // inside a wrapper element), and drives the `_has-button` button-stack padding.
    /** @docs-private */
    protected readonly button = contentChild(KbqButton);
    /** @docs-private */
    protected readonly title = contentChild(KbqAlertTitle, { descendants: false });
    /** @docs-private */
    protected readonly control = contentChild(KbqAlertControl, { descendants: false });
    /** @docs-private */
    protected readonly closeButton = contentChild(KbqAlertCloseButton, { descendants: false });

    /** Whether the alert uses the denser compact size. */
    readonly compact = input(false, { transform: booleanAttribute });

    /** Visual style — neutral `default` or the attention-drawing `colored` background. */
    readonly alertStyle = input<KbqEnumValues<KbqAlertStyles>>(KbqAlertStyles.Default);

    /**
     * Status of the alert. Drives the background in the `colored` style and auto-tints an uncolored
     * projected status icon to the matching color (`info` icons become `contrast`).
     * @default 'info'
     */
    readonly alertColor = input(KbqAlertColors.Info, {
        transform: (value: KbqEnumValues<KbqAlertColors> | null | undefined): KbqEnumValues<KbqAlertColors> =>
            value || KbqAlertColors.Info
    });

    /** Emitted when the projected close control is activated. The consumer is responsible for hiding the alert. */
    readonly closed = output<void>();

    /** @docs-private */
    protected readonly alertColorClass = computed(() => `kbq-alert_${this.alertColor()}`);
    /** @docs-private */
    protected readonly isColored = computed(() => this.alertStyle() === KbqAlertStyles.Colored);
    /** The projected status icon, whichever slot it came from. @docs-private */
    protected readonly projectedIcon = computed(() => this.icon() || this.iconItem());

    /** Last color this component auto-assigned to the icon; lets us re-tint on change without clobbering a consumer's color. */
    private lastAutoColor: KbqComponentColors | null = null;

    constructor() {
        // Keep the uncolored projected icon in sync with the alert status, reacting to both a later
        // `alertColor` change and a late-arriving icon. Only re-tint an icon we own — one that is still
        // `Empty` or still carries the color we last set — so an explicit consumer `[color]` is respected.
        effect(() => {
            const icon = this.projectedIcon();
            const nextColor = alertIconColors[this.alertColor()];

            if (icon && (icon.color === KbqComponentColors.Empty || icon.color === this.lastAutoColor)) {
                icon.color = nextColor;
                this.lastAutoColor = nextColor;
            }
        });
    }
}

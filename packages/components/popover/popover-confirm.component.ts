import { CdkTrapFocus } from '@angular/cdk/a11y';
import {
    ChangeDetectionStrategy,
    Component,
    Directive,
    InjectionToken,
    Input,
    ViewEncapsulation,
    effect,
    inject,
    output,
    signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqButtonModule } from '@koobiq/components/button';
import { kbqInjectPopoverConfirmLocaleConfiguration, kbqSiblingPopupProvider } from '@koobiq/components/core';
import { Subject } from 'rxjs';
import { kbqPopoverAnimations } from './popover-animations';
import { KBQ_POPOVER_FOCUS_TRAP_PROVIDERS, KbqPopoverComponent, KbqPopoverTrigger } from './popover.component';

/**
 * Overrides the question of every confirmation popover in the injector scope. Takes precedence over the
 * locale, but not over the `kbqPopoverConfirmText` input.
 */
export const KBQ_POPOVER_CONFIRM_TEXT = new InjectionToken<string>('KbqPopoverConfirmText');

/**
 * Overrides the confirm-button caption of every confirmation popover in the injector scope. Takes precedence
 * over the locale, but not over the `kbqPopoverConfirmButtonText` input.
 */
export const KBQ_POPOVER_CONFIRM_BUTTON_TEXT = new InjectionToken<string>('KbqPopoverConfirmButtonText');

@Component({
    selector: 'kbq-popover-confirm-component',
    imports: [
        CdkTrapFocus,
        KbqButtonModule
    ],
    templateUrl: './popover-confirm.component.html',
    styleUrls: ['./popover.scss', './popover-tokens.scss'],
    // Repeated rather than inherited: Angular copies `providers` to a subclass only when that subclass has
    // no decorator of its own.
    providers: KBQ_POPOVER_FOCUS_TRAP_PROVIDERS,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    animations: [kbqPopoverAnimations.popoverState],
    preserveWhitespaces: false
})
export class KbqPopoverConfirmComponent extends KbqPopoverComponent {
    /**
     * Emits when the confirm button is pressed. Internal channel between the panel and its trigger — consume
     * the trigger's `confirm` output instead.
     *
     * @docs-private
     */
    readonly onConfirm = new Subject<void>();

    /** Caption of the confirm button. Written by the trigger. */
    confirmButtonText: string;

    /** Question rendered in the panel. Written by the trigger. */
    confirmText: string;
}

@Directive({
    selector: '[kbqPopoverConfirm]',
    // Declared again rather than inherited from `KbqPopoverTrigger`: Angular copies `providers` to a subclass
    // only when that subclass has no decorator of its own.
    providers: [kbqSiblingPopupProvider(KbqPopoverConfirmTrigger)],
    host: {
        '[class.kbq-popover_open]': 'isOpen',
        '[attr.aria-expanded]': 'hasClickTrigger ? isOpen : null',
        '[attr.aria-haspopup]': 'hasClickTrigger ? "dialog" : null',
        '[attr.aria-controls]': 'hasClickTrigger && isOpen ? panelId : null',
        '(keydown)': 'keydownHandler($event)',
        '(touchend)': 'touchendHandler()'
    },
    exportAs: 'kbqPopoverConfirm'
})
export class KbqPopoverConfirmTrigger extends KbqPopoverTrigger {
    /** Emits when the user confirms the action. */
    readonly confirm = output<void>();

    private readonly localeConfiguration = kbqInjectPopoverConfirmLocaleConfiguration();
    private readonly externalConfirmText = inject(KBQ_POPOVER_CONFIRM_TEXT, { optional: true });
    private readonly externalConfirmButtonText = inject(KBQ_POPOVER_CONFIRM_BUTTON_TEXT, { optional: true });

    /**
     * Input (`kbqPopoverConfirmText`) — question rendered in the panel. Falls back to
     * {@link KBQ_POPOVER_CONFIRM_TEXT} and then to the `popoverConfirm` section of the active locale.
     */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input('kbqPopoverConfirmText')
    get confirmText(): string {
        return this._confirmText() ?? this.externalConfirmText ?? this.localeConfiguration().confirmText;
    }

    set confirmText(value: string) {
        this._confirmText.set(value);

        this.updateData();
    }

    private readonly _confirmText = signal<string | undefined>(undefined);

    /**
     * Input (`kbqPopoverConfirmButtonText`) — caption of the confirm button. Falls back to
     * {@link KBQ_POPOVER_CONFIRM_BUTTON_TEXT} and then to the `popoverConfirm` section of the active locale.
     */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input('kbqPopoverConfirmButtonText')
    get confirmButtonText(): string {
        return (
            this._confirmButtonText() ?? this.externalConfirmButtonText ?? this.localeConfiguration().confirmButtonText
        );
    }

    set confirmButtonText(value: string) {
        this._confirmButtonText.set(value);

        this.updateData();
    }

    private readonly _confirmButtonText = signal<string | undefined>(undefined);

    /** Panel the confirm handler is currently wired to, so it is wired once per attach. */
    private wiredInstance: KbqPopoverConfirmComponent | null = null;

    constructor() {
        super();

        // The strings are resolved from signals (input, token, locale), so switching the locale while the
        // popover is open has to reach the live panel — `updateData` alone only runs on input writes.
        effect(() => {
            const confirmText = this.confirmText;
            const confirmButtonText = this.confirmButtonText;

            if (!this.instance) return;

            this.instance.confirmText = confirmText;
            this.instance.confirmButtonText = confirmButtonText;
            this.instance.markForCheck();
        });
    }

    /** @docs-private */
    updateData() {
        if (!this.instance) {
            return;
        }

        super.updateData();

        if (this.wiredInstance !== this.instance) {
            this.wiredInstance = this.instance;

            this.setupButtonEvents();
        }

        this.instance.confirmButtonText = this.confirmButtonText;
        this.instance.confirmText = this.confirmText;
    }

    /**
     * Subscribes to the panel's confirm button. Called once per attach: the subscription is scoped to the
     * panel, so it dies with it.
     *
     * @docs-private
     */
    setupButtonEvents() {
        this.instance.onConfirm.pipe(takeUntilDestroyed(this.instanceDestroyRef)).subscribe(() => {
            // TODO: The 'emit' function requires a mandatory void argument
            this.confirm.emit();
            this.hide();
        });
    }

    /** @docs-private */
    getOverlayHandleComponentType() {
        return KbqPopoverConfirmComponent;
    }
}

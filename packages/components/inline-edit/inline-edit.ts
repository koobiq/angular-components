import { animate, style, transition, trigger } from '@angular/animations';
import { CdkMonitorFocus, CdkTrapFocus } from '@angular/cdk/a11y';
import { hasModifierKey } from '@angular/cdk/keycodes';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { CdkConnectedOverlay, Overlay, ScrollStrategy } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    contentChildren,
    Directive,
    effect,
    ElementRef,
    forwardRef,
    inject,
    input,
    NgZone,
    numberAttribute,
    output,
    signal,
    TemplateRef,
    viewChild,
    viewChildren,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { AbstractControl, NgControl } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    isElement,
    KBQ_CONNECTED_OVERLAY_ORIGIN,
    KBQ_WINDOW,
    KbqAnimationCurves,
    KbqAnimationDurations,
    KbqComponentColors,
    KbqConnectedOverlayOriginProvider,
    kbqInjectA11yLocaleConfiguration,
    PopUpPlacements
} from '@koobiq/components/core';
import { KbqDropdownTrigger } from '@koobiq/components/dropdown';
import { KbqFormField, KbqLabel } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqSelect } from '@koobiq/components/select';
import { KBQ_TOOLTIP_SCROLL_STRATEGY, KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { merge, skip, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

const KBQ_INLINE_EDIT_ACTION_BUTTONS_ANIMATION = trigger('panelAnimation', [
    transition(':enter', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate(
            `${KbqAnimationDurations.Instant} ${KbqAnimationCurves.DecelerationCurve}`,
            style({ transform: 'translateY(0%)', opacity: 1 })
        )
    ])
]);

/**
 * The validation tooltip is anchored to an element inside the edit-mode overlay — an overlay inside another
 * overlay. Its default `close()` scroll strategy would close it the moment either overlay's origin scrolls
 * (including the programmatic scroll `save()` uses to bring an invalid control into view), so it's overridden
 * to `reposition()` here, scoped to just this tooltip instance.
 */
const KBQ_INLINE_EDIT_VALIDATION_TOOLTIP_SCROLL_STRATEGY = {
    provide: KBQ_TOOLTIP_SCROLL_STRATEGY,
    deps: [Overlay],
    useFactory: (overlay: Overlay) => () => overlay.scrollStrategies.reposition()
};

const baseClass = 'kbq-inline-edit';

/**
 * Fallback delay before showing the validation tooltip if `scrollend` never fires — e.g. the browser doesn't
 * support it, or nothing needed to scroll.
 */
const VALIDATION_TOOLTIP_SCROLL_TIMEOUT = 800;

export type KbqInlineEditMode = 'view' | 'edit';

/** @docs-private */
@Directive({
    selector: '[kbqFocusRegionItem]',
    host: {
        '(focusin)': 'isFocused = true',
        '(keydown.tab)': 'onTabOut($event)',
        '(keydown.shift.tab)': 'onTabOut($event)'
    },
    exportAs: 'kbqFocusRegionItem'
})
export class KbqFocusRegionItem {
    readonly tabOut = output<KeyboardEvent>();

    protected isFocused = false;

    protected onTabOut(event: KeyboardEvent) {
        if (this.isFocused) {
            this.tabOut.emit(event);
        }

        this.isFocused = !this.isFocused;
    }
}

/** Directive for easy using styles of inline edit placeholder publicly. */
@Directive({
    selector: '[kbqInlineEditPlaceholder]',
    host: {
        class: 'kbq-inline-edit__placeholder'
    },
    exportAs: 'kbqInlineEditPlaceholder'
})
export class KbqInlineEditPlaceholder {}

/**
 * This directive enhances element acting as dropdown trigger,
 * visually indicating the active state with the `kbq-active` class.
 * Also, it prevents click/keydown events from being propagated to disable mode toggling of parent component.
 */
@Directive({
    selector: '[kbqInlineEditMenu]',
    host: {
        role: 'button',
        class: 'kbq-inline-edit__menu',
        '[class.kbq-active]': 'dropdownTrigger?.opened',
        '(click)': '$event.stopPropagation()',
        '(keydown.enter)': '$event.stopPropagation()',
        '(keydown.space)': '$event.stopPropagation()'
    },
    exportAs: 'kbqInlineEditMenu'
})
export class KbqInlineEditMenu {
    /** @docs-private */
    protected readonly dropdownTrigger = inject(KbqDropdownTrigger, { optional: true });
}

/**
 * Customizable component that enables edit-in-place logic for specified control and it's view.
 * This component is projecting edit/view mode templates and adds keyboard/pointer handlers.
 * Edit mode opens in a positioned overlay that matches the view mode width or can be customized.
 */
@Component({
    selector: 'kbq-inline-edit',
    imports: [
        CdkConnectedOverlay,
        KbqButtonModule,
        KbqIcon,
        KbqTooltipTrigger,
        KbqFocusRegionItem,
        CdkTrapFocus
    ],
    templateUrl: './inline-edit.html',
    styleUrls: ['./inline-edit.scss', './inline-edit-tokens.scss'],
    providers: [
        { provide: KBQ_CONNECTED_OVERLAY_ORIGIN, useExisting: forwardRef(() => KbqInlineEdit) },
        KBQ_INLINE_EDIT_VALIDATION_TOOLTIP_SCROLL_STRATEGY
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: baseClass,
        '[attr.tabindex]': 'tabIndex()',
        '[class]': 'className()',
        '[class.kbq-inline-edit_with-label]': '!!label()',
        '[class.kbq-inline-edit_with-menu]': '!!menu()',
        '[class.kbq-inline-edit_disabled]': 'disabled()',
        '[class.kbq-inline-edit_anchor-focused]': 'anchorFocused()',
        '[class.kbq-inline-edit_select]': 'isSingleSelect()',
        '(click)': 'onClick($event)',
        '(keydown.enter)': 'onClick($event)',
        '(keydown.space)': 'onClick($event)'
    },
    hostDirectives: [CdkMonitorFocus],
    animations: [KBQ_INLINE_EDIT_ACTION_BUTTONS_ANIMATION],
    exportAs: 'kbqInlineEdit'
})
export class KbqInlineEdit implements KbqConnectedOverlayOriginProvider {
    /** Accessible names for the icon-only save/cancel buttons. */
    protected readonly a11yLocaleConfiguration = kbqInjectA11yLocaleConfiguration();

    private readonly overlay = inject(Overlay);
    private readonly document = inject(DOCUMENT);
    private readonly window = inject(KBQ_WINDOW);
    private readonly resizeObserver = inject(SharedResizeObserver);
    protected readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly ngZone = inject(NgZone);

    /**
     * Whether to show save/cancel action buttons in edit mode.
     * @default false
     */
    readonly showActions = input(false, { transform: booleanAttribute });
    /**
     * Whether to automatically show validation error tooltips on save attempts.
     * @default true
     */
    readonly showTooltipOnError = input(true, { transform: booleanAttribute });
    /** Custom validation tooltip message. */
    readonly validationTooltip = input<string | TemplateRef<any>>();
    /**
     * Disables the component, preventing interaction and mode switching. Only allows menu dropdown.
     * @default false
     */
    readonly disabled = input(false, { transform: booleanAttribute });
    /** Custom width in pixels for the edit mode overlay. Auto-calculated if not set. */
    readonly editModeWidth = input(undefined, { transform: numberAttribute });
    /** User-defined tooltip placement */
    readonly tooltipPlacement = input<PopUpPlacements>();
    /** Classes to be passed to the inline edit panel. */
    readonly overlayPanelClass = input<string | string[]>('');
    /** Handler function to retrieve the current value */
    readonly getValueHandler = input<() => unknown>();
    /** Handler function to update the value */
    readonly setValueHandler = input<(value: any) => void>();
    /** Customizable function that checks if saving on enter available. */
    readonly canSaveOnEnter = input(
        (event: KeyboardEvent): boolean =>
            hasModifierKey(event, 'ctrlKey', 'metaKey') || !(event.target instanceof HTMLTextAreaElement)
    );

    /**
     * CSS selectors for elements in view mode that should handle clicks instead of opening edit mode.
     * Override to replace or extend the default list.
     *
     * @example
     * `<kbq-inline-edit [interactiveSelectors]="['a', 'kbq-tag', 'button']">`
     */
    readonly interactiveSelectors = input<string[]>(['a', 'kbq-tag']);

    /** Emitted when the inline edit is saved successfully. */
    protected readonly saved = output();
    /** Emitted when the inline edit is canceled and changes are discarded. */
    protected readonly canceled = output();
    /** Emitted when mode switched to edit/view */
    protected readonly modeChange = output<KbqInlineEditMode>();

    /** @docs-private */
    protected readonly menu = contentChild(KbqInlineEditMenu);
    /** @docs-private */
    protected readonly label = contentChild(KbqLabel);

    /** @docs-private */
    protected readonly formFieldRef = computed<KbqFormField | undefined>(() => this.formFieldRefList()[0]);
    /** @docs-private */
    protected readonly formFieldRefList = contentChildren(KbqFormField, { descendants: true });

    /** @docs-private */
    protected readonly selectRef = contentChild(KbqSelect, { descendants: true });
    /**
     * Whether edit mode contains a single-value select. When true, edit mode shows only the
     * dropdown panel instead of a bordered field - see the "Select-style editor" example.
     * @docs-private
     */
    protected readonly isSingleSelect = computed(() => {
        const select = this.selectRef();

        return !!select && !select.multiple && !select.multiline();
    });

    /** @docs-private */
    protected overlayOrigin: HTMLElement = this.elementRef.nativeElement;
    /** @docs-private */
    protected readonly tooltipTrigger = viewChild.required(KbqTooltipTrigger);
    /** @docs-private */
    protected readonly viewContainer = viewChild.required<ElementRef<HTMLElement>>('viewContainer');
    /** @docs-private */
    protected readonly overlayDir = viewChild.required(CdkConnectedOverlay);
    /** @docs-private */
    protected readonly regionItems = viewChildren(KbqFocusRegionItem);

    /** @docs-private */
    protected readonly mode = signal<KbqInlineEditMode>('view');
    /** @docs-private */
    protected readonly overlayWidth = signal<number | string>('');
    /** @docs-private */
    protected readonly scrollStrategy = signal<ScrollStrategy>(this.overlay.scrollStrategies.reposition());
    /** @docs-private */
    readonly modeAsReadonly = computed(() => this.mode());

    /** @docs-private */
    protected readonly className = computed(() => `${baseClass}_${this.mode()}`);
    /** @docs-private */
    protected readonly isEditMode = computed(() => this.mode() === 'edit');
    /** @docs-private */
    protected readonly hasInteractiveContent = signal(false);
    /** @docs-private */
    protected readonly anchorFocused = signal(false);
    /** @docs-private */
    protected readonly tabIndex = computed(() => {
        if (this.isEditMode() || this.disabled() || this.hasInteractiveContent()) return -1;

        return 0;
    });

    /** @docs-private */
    protected readonly placements = PopUpPlacements;

    /** @docs-private */
    protected readonly colors = KbqComponentColors;

    private initialValue: unknown;

    constructor() {
        toObservable(this.mode)
            .pipe(skip(1), takeUntilDestroyed())
            .subscribe((currentMode) => this.modeChange.emit(currentMode));

        effect(() => {
            this.overlayOrigin = this.label() ? this.viewContainer().nativeElement : this.elementRef.nativeElement;
        });

        effect((onCleanup) => {
            const selectors = this.interactiveSelectors();

            const timeoutId = setTimeout(() => this.detectInteractiveContent(selectors));

            onCleanup(() => clearTimeout(timeoutId));
        });
    }

    /** Manually switch mode */
    toggleMode(): void {
        this.mode.update((mode) => (mode === 'view' ? 'edit' : 'view'));
    }

    /**
     * Implements `KbqConnectedOverlayOriginProvider`, letting a nested `KbqFormField`'s control
     * anchor its overlay to this element instead of the form-field's own container.
     * When no override is needed, the form-field falls back to its default.
     * @docs-private
     */
    getConnectedOverlayOrigin(): ElementRef | undefined {
        return this.isSingleSelect() ? this.elementRef : undefined;
    }

    /** Saves the current value and returns to view mode, running the same validation as a normal save. */
    commit(): void {
        this.save();
    }

    /** @docs-private */
    protected onClick(event: Event): void {
        if (this.disabled() || this.isEditMode() || this.isInteractiveElement(event.target)) return;

        event.preventDefault();
        event.stopPropagation();

        this.toggleMode();
    }

    /** @docs-private */
    protected onAttach(): void {
        this.setOverlayWidth();
        this.setOverlayKeydownListener();

        const formFieldRefList = this.formFieldRefList();

        merge(...formFieldRefList.map((ref) => ref.control().stateChanges))
            .pipe(takeUntil(this.overlayDir()!.overlayRef.detachments()))
            .subscribe(() => {
                if (!this.isInvalid()) {
                    const tooltipTrigger = this.tooltipTrigger();

                    if (tooltipTrigger?.isOpen) {
                        tooltipTrigger.hide();
                    }
                }
            });

        setTimeout(() => {
            const formFieldRef = this.formFieldRef();

            if (!formFieldRef) return;

            formFieldRef.focus();

            this.initialValue = this.getValue();

            const input = this.getInputNativeElement();

            if (this.initialValue) input?.select();

            this.openPanel(formFieldRef);
        }, 0);
    }

    /** @docs-private */
    protected save($event?: Event): void {
        // Guards against a control triggering both its own commit() and the overlay's outside-click handler for the
        // same interaction — without this, the second call would toggle back into edit mode.
        if (!this.isEditMode()) return;

        if (this.isInvalid()) {
            $event?.stopPropagation();

            if (this.showTooltipOnError() && this.validationTooltip()) {
                this.showValidationTooltip();
            }
        } else {
            this.toggleMode();
            this.saved.emit();
        }
    }

    /**
     * Shows the validation tooltip, scrolling the invalid control into view first if it isn't fully visible.
     *
     * `scrollIntoView({ behavior: 'smooth' })` finishes asynchronously — for a long scroll distance it can take
     * a while — so showing the tooltip right away would anchor its overlay to a stale, pre-scroll position.
     * `scrollend` reports when the scroll actually completes;
     * the timeout is a fallback for browsers without `scrollend` support and cases where nothing ends up scrolling.
     */
    private showValidationTooltip(): void {
        const rect = this.overlayOrigin.getBoundingClientRect();
        const isFullyVisible =
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= this.window.innerHeight &&
            rect.right <= this.window.innerWidth;

        if (isFullyVisible) {
            this.tooltipTrigger()?.show();

            return;
        }

        let shown = false;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        let detachSubscription: Subscription | null = null;

        const cleanup = (): void => {
            this.window.removeEventListener('scrollend', showTooltip);

            if (timeoutId !== null) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }

            detachSubscription?.unsubscribe();
            detachSubscription = null;
        };

        const showTooltip = (): void => {
            if (shown) return;

            shown = true;
            cleanup();
            this.tooltipTrigger()?.updatePosition();
            this.tooltipTrigger()?.show();
        };

        detachSubscription = this.overlayDir()
            .overlayRef.detachments()
            .subscribe(() => cleanup());

        this.ngZone.runOutsideAngular(() => {
            this.window.addEventListener('scrollend', showTooltip, { once: true });
        });
        timeoutId = setTimeout(showTooltip, VALIDATION_TOOLTIP_SCROLL_TIMEOUT);

        this.overlayOrigin.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
    }

    /** @docs-private */
    protected cancel(): void {
        this.setValue(this.initialValue);

        const input = this.getInputNativeElement();

        if (input) {
            input.selectionStart = input.selectionEnd = null;
        }

        this.toggleMode();
        this.canceled.emit();
    }

    /** @docs-private */
    protected onOverlayKeydown(event: KeyboardEvent): void {
        this.markAllAsTouched();
        const canSaveOnEnter = this.canSaveOnEnter();

        switch (event.key) {
            case 'Escape': {
                this.cancel();
                break;
            }
            case 'Enter': {
                if (canSaveOnEnter(event)) {
                    event.preventDefault();
                    this.markAllAsTouched();
                    setTimeout(() => this.save(event));
                }

                break;
            }
            default: {
                return;
            }
        }
    }

    /**
     * Block propagation of overlay outside click.
     * Used to prevent reopening when target is inline edit itself.
     * @docs-private
     */
    protected onOverlayOutsideClick($event: Event) {
        if (isElement($event.target) && this.elementRef.nativeElement.contains($event.target)) {
            $event.preventDefault();
            $event.stopPropagation();
        }

        this.save($event);
    }

    private detectInteractiveContent(selectors: string[]): void {
        if (!selectors.length) {
            this.hasInteractiveContent.set(false);

            return;
        }

        const viewContent = this.viewContainer().nativeElement.querySelector('.kbq-inline-edit__view-content');

        this.hasInteractiveContent.set(!!viewContent?.querySelector(selectors.join(',')));
    }

    private isInteractiveElement(target: EventTarget | null): boolean {
        const selectors = this.interactiveSelectors();

        if (!selectors.length) return false;

        return isElement(target) && !!target.closest(selectors.join(','));
    }

    /**
     * Sets up Tab key listeners on region items.
     * Single item: Tab moves to next edit.
     * Multiple items: Shift+Tab on first or Tab on last moves to next edit.
     */
    private setOverlayKeydownListener(): void {
        const regionItems = this.regionItems();

        if (regionItems.length === 0) return;

        const firstItem = regionItems.at(0);
        const lastItem = regionItems.at(regionItems.length - 1);

        if (regionItems.length === 1) {
            firstItem?.tabOut.subscribe((event) => this.saveAndFocusNextInlineEdit(event));
        } else {
            firstItem?.tabOut.subscribe(
                (event) => hasModifierKey(event, 'shiftKey') && this.saveAndFocusNextInlineEdit(event)
            );

            lastItem?.tabOut.subscribe(
                (event) => !hasModifierKey(event, 'shiftKey') && this.saveAndFocusNextInlineEdit(event)
            );
        }
    }

    private saveAndFocusNextInlineEdit(event: Event): void {
        this.save(event);
        if (this.isInvalid()) return;

        setTimeout(() => {
            const activeElement = this.document.activeElement;

            if (activeElement?.classList?.contains('kbq-inline-edit')) {
                activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
            }
        });
    }

    private isInvalid(): boolean {
        const formFieldRefList = this.formFieldRefList();

        if (!formFieldRefList.length) return false;

        return formFieldRefList.some((ref) => ref.invalid);
    }

    private getValue() {
        const getValueHandler = this.getValueHandler();

        if (getValueHandler) return getValueHandler();

        const formFieldRefList = this.formFieldRefList();

        if (!formFieldRefList.length) return;

        return this.formFieldRefList().map((ref) => this.coerceControl(ref)?.value);
    }

    private setValue<T>(value: T): void {
        const setValue = this.setValueHandler();

        if (setValue) {
            setValue(value);

            return;
        }

        const formFieldRefList = this.formFieldRefList();

        if (!formFieldRefList.length || !Array.isArray(value)) return;

        value.forEach((controlValue, index) => {
            const control = this.coerceControl(formFieldRefList[index]);

            if (!control) return;

            if (control instanceof AbstractControl) {
                control.setValue(controlValue);
            } else {
                control.value = controlValue;
            }
        });
    }

    private coerceControl(formFieldRef: KbqFormField) {
        const control = formFieldRef.control();

        if (control.ngControl instanceof NgControl) {
            return control.ngControl.control;
        }

        return control;
    }

    private setOverlayWidth(): void {
        const editModeWidth = this.editModeWidth();

        if (editModeWidth) {
            this.overlayWidth.set(editModeWidth);

            return;
        }

        const element: HTMLElement | null = this.label()
            ? this.elementRef.nativeElement.querySelector('.kbq-inline-edit__focus_container')
            : this.elementRef.nativeElement;

        if (element) {
            const overlayRef = this.overlayDir().overlayRef;

            this.resizeObserver
                .observe(element)
                .pipe(takeUntil(overlayRef.detachments()))
                .subscribe(() => {
                    this.overlayWidth.set(element.offsetWidth);
                    overlayRef.updatePosition();
                });
        }

        this.overlayWidth.set(element?.offsetWidth ?? '');
    }

    private openPanel(formFieldRef: KbqFormField) {
        const control = formFieldRef.control();

        control?.open?.();
    }

    private getInputNativeElement(): HTMLInputElement | HTMLTextAreaElement | null {
        return this.overlayDir()?.overlayRef.overlayElement.querySelector('input:not([type="file"]),textarea') ?? null;
    }

    private markAllAsTouched(): void {
        this.formFieldRefList().forEach((formField) => formField.control().ngControl?.control?.markAsTouched());
    }
}

import { animate, style, transition, trigger } from '@angular/animations';
import { CdkMonitorFocus, CdkTrapFocus, FocusMonitor, FocusOrigin, InteractivityChecker } from '@angular/cdk/a11y';
import { hasModifierKey } from '@angular/cdk/keycodes';
import { ContentObserver } from '@angular/cdk/observers';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { CdkConnectedOverlay, Overlay, ScrollDispatcher, ScrollStrategy } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    contentChildren,
    DestroyRef,
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
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { debounceTime, merge, skip, startWith } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

const KBQ_INLINE_EDIT_ACTION_BUTTONS_ANIMATION = trigger('panelAnimation', [
    transition(':enter', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate(
            `${KbqAnimationDurations.Instant} ${KbqAnimationCurves.DecelerationCurve}`,
            style({ transform: 'translateY(0%)', opacity: 1 })
        )
    ])
]);

const baseClass = 'kbq-inline-edit';

/**
 * Fallback delay before showing the validation tooltip if `scrollend` never fires — e.g. the browser doesn't
 * support it, or nothing needed to scroll.
 */
const VALIDATION_TOOLTIP_SCROLL_TIMEOUT = 800;

/**
 * Every live inline edit, keyed by its host element, so Tab-chaining can call the neighbour's public API
 * instead of driving it through the DOM with a fabricated `KeyboardEvent`.
 */
const inlineEditRegistry = new WeakMap<HTMLElement, KbqInlineEdit>();

export type KbqInlineEditMode = 'view' | 'edit';

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
        CdkTrapFocus
    ],
    templateUrl: './inline-edit.html',
    styleUrls: ['./inline-edit.scss', './inline-edit-tokens.scss'],
    providers: [{ provide: KBQ_CONNECTED_OVERLAY_ORIGIN, useExisting: forwardRef(() => KbqInlineEdit) }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: baseClass,
        // The widget semantics live on the view content, so the focus ring has to follow the subtree.
        cdkMonitorSubtreeFocus: '',
        '[class]': 'className()',
        '[class.kbq-inline-edit_with-label]': '!!label()',
        '[class.kbq-inline-edit_with-menu]': '!!menu()',
        '[class.kbq-inline-edit_disabled]': 'disabled()',
        '[class.kbq-inline-edit_anchor-focused]': 'anchorFocused()',
        '[class.kbq-inline-edit_select]': 'isSingleSelect()',
        // `aria-label` is an input, and the host itself carries no role, where naming is prohibited.
        '[attr.aria-label]': 'null',
        '(click)': 'onClick($event)',
        '(keydown.enter)': 'onClick($event)',
        '(keydown.space)': 'onClick($event)'
    },
    hostDirectives: [CdkMonitorFocus],
    animations: [KBQ_INLINE_EDIT_ACTION_BUTTONS_ANIMATION],
    exportAs: 'kbqInlineEdit'
})
export class KbqInlineEdit implements KbqConnectedOverlayOriginProvider {
    /** Accessible names for the icon-only save/cancel buttons and for the view mode itself. */
    protected readonly a11yLocaleConfiguration = kbqInjectA11yLocaleConfiguration();

    private readonly overlay = inject(Overlay);
    private readonly document = inject(DOCUMENT);
    private readonly window = inject(KBQ_WINDOW);
    private readonly resizeObserver = inject(SharedResizeObserver);
    protected readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly ngZone = inject(NgZone);
    private readonly scrollDispatcher = inject(ScrollDispatcher);
    private readonly contentObserver = inject(ContentObserver);
    private readonly interactivityChecker = inject(InteractivityChecker);
    private readonly focusMonitor = inject(FocusMonitor);

    /**
     * The validation tooltip is anchored inside the edit-mode overlay — an overlay inside another
     * overlay. Its default `close()` scroll strategy would close it the moment either overlay's
     * origin scrolls (including the programmatic scroll `showValidationTooltip()` uses to bring an
     * invalid control into view), so it's overridden to `reposition()` here — passed directly as a
     * per-instance override to this tooltip's `[kbqTooltipScrollStrategy]` input, rather than a DI
     * override, so it doesn't leak into any `kbqTooltip` in projected content.
     * @docs-private
     */
    protected readonly validationTooltipScrollStrategy = (): ScrollStrategy =>
        this.overlay.scrollStrategies.reposition();

    /**
     * Whether to show save/cancel action buttons in edit mode.
     * @default false
     */
    readonly showActions = input(false, { transform: booleanAttribute });
    /**
     * Whether to automatically show validation error tooltips on save attempts.
     * Has no effect unless `validationTooltip` is set.
     * @default true
     */
    readonly showTooltipOnError = input(true, { transform: booleanAttribute });
    /** Custom validation tooltip message. */
    readonly validationTooltip = input<string | TemplateRef<unknown>>();
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
    readonly setValueHandler = input<(value: unknown) => void>();
    /**
     * Accessible name of the control that opens the editor. Defaults to the localized "Edit"; set a
     * field-specific name where the projected value alone doesn't say what is being edited.
     */
    readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });
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
    readonly saved = output();
    /** Emitted when the inline edit is canceled and changes are discarded. */
    readonly canceled = output();
    /** Emitted when mode switched to edit/view */
    readonly modeChange = output<KbqInlineEditMode>();

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
    protected readonly tooltipTrigger = viewChild.required(KbqTooltipTrigger);
    /** @docs-private */
    protected readonly viewContainer = viewChild.required<ElementRef<HTMLElement>>('viewContainer');
    /** @docs-private */
    protected readonly viewContent = viewChild.required<ElementRef<HTMLElement>>('viewContent');
    /** @docs-private */
    protected readonly overlayDir = viewChild.required(CdkConnectedOverlay);

    /** @docs-private */
    protected readonly mode = signal<KbqInlineEditMode>('view');
    /** @docs-private */
    protected readonly overlayWidth = signal<number | string>('');
    /** Distance the panel is pulled up by so that it covers the view it replaces. */
    protected readonly overlayOffsetY = signal(0);
    /**
     * Built on first read rather than in the field initializer: a list of inline edits would otherwise
     * allocate one strategy per row, including the rows nobody ever opens.
     * @docs-private
     */
    protected readonly scrollStrategy = computed(() => this.overlay.scrollStrategies.reposition());
    /** @docs-private */
    readonly modeAsReadonly = computed(() => this.mode());

    /** @docs-private */
    protected readonly overlayOrigin = computed<HTMLElement>(() =>
        this.label() ? this.viewContainer().nativeElement : this.elementRef.nativeElement
    );

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

    /**
     * Widget role of the view content. Dropped once the projected content is interactive, because a
     * `button` wrapping a link or a tag is a `nested-interactive` violation — the focus anchor carries
     * the semantics in that case instead.
     * @docs-private
     */
    protected readonly viewContentRole = computed(() => (this.hasInteractiveContent() ? null : 'button'));

    /** @docs-private */
    protected readonly accessibleName = computed(() => this.ariaLabel() ?? this.a11yLocaleConfiguration().edit);

    /** @docs-private */
    protected readonly placements = PopUpPlacements;

    /** @docs-private */
    protected readonly colors = KbqComponentColors;

    private initialValue: unknown;

    /** Handle for an in-flight `showValidationTooltip()` scroll/settle request, if any. */
    private validationTooltipScrollHandle: { cancel: () => void } | null = null;

    /** How edit mode was entered, so leaving it restores the same focus style. */
    private editModeOrigin: FocusOrigin = null;

    /** Set while Tab-chaining, where the next inline edit — not this one — has to end up focused. */
    private chainingToNextInlineEdit = false;

    constructor() {
        inlineEditRegistry.set(this.elementRef.nativeElement, this);

        const destroyRef = inject(DestroyRef);

        destroyRef.onDestroy(() => {
            inlineEditRegistry.delete(this.elementRef.nativeElement);
            this.validationTooltipScrollHandle?.cancel();
        });

        toObservable(this.mode)
            .pipe(skip(1), takeUntilDestroyed())
            .subscribe((currentMode) => this.modeChange.emit(currentMode));

        effect((onCleanup) => {
            const selectors = this.interactiveSelectors();
            const viewContent = this.viewContent().nativeElement;

            // Projected content can arrive long after the first pass — a value fetched from a server, or
            // the `@if (value) { … } @else { placeholder }` shape every example uses — so detection has to
            // follow the content rather than run once. `debounceTime` also defers the first pass out of the
            // current change detection, which is what the one-shot timeout used to do.
            const subscription = this.contentObserver
                .observe(viewContent)
                .pipe(startWith(null), debounceTime(0))
                .subscribe(() => this.detectInteractiveContent(viewContent, selectors));

            onCleanup(() => subscription.unsubscribe());
        });
    }

    /** Manually switch mode */
    toggleMode(): void {
        if (this.isEditMode()) {
            this.mode.set('view');

            return;
        }

        // Measured before the overlay opens: the panel is pulled up by exactly the height of the view it
        // replaces, and reading it from a template binding would force a layout flush on every tick.
        this.overlayOffsetY.set(-this.overlayOrigin().offsetHeight);
        this.mode.set('edit');
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

        this.editModeOrigin = event instanceof KeyboardEvent ? 'keyboard' : 'mouse';

        this.toggleMode();
    }

    /** @docs-private */
    protected onAttach(): void {
        this.setOverlayWidth();

        this.overlayDir()!
            .overlayRef.detachments()
            .pipe(take(1))
            .subscribe(() => this.validationTooltipScrollHandle?.cancel());

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

        // Saving is what makes the controls touched, not typing into them: the display state has to be
        // caught up before the error styling is allowed to appear.
        this.markAllAsTouched();

        if (this.isInvalid()) {
            $event?.stopPropagation();

            if (this.showTooltipOnError() && this.validationTooltip()) {
                this.showValidationTooltip();
            }
        } else {
            this.toggleMode();
            this.saved.emit();
            this.restoreFocus();
        }
    }

    /**
     * Whether `overlayOrigin` is fully within the viewport and every registered `CdkScrollable`
     * ancestor between it and the viewport. Ancestors without the `CdkScrollable` directive aren't
     * visible to `ScrollDispatcher` and aren't checked — same limitation as the rest of overlay
     * positioning.
     */
    private isOverlayOriginFullyVisible(): boolean {
        const overlayOrigin = this.overlayOrigin();
        const rect = overlayOrigin.getBoundingClientRect();

        const isWithin = (container: { top: number; left: number; bottom: number; right: number }): boolean =>
            rect.top >= container.top &&
            rect.left >= container.left &&
            rect.bottom <= container.bottom &&
            rect.right <= container.right;

        if (!isWithin({ top: 0, left: 0, bottom: this.window.innerHeight, right: this.window.innerWidth })) {
            return false;
        }

        return this.scrollDispatcher
            .getAncestorScrollContainers(overlayOrigin)
            .every((scrollable) => isWithin(scrollable.getElementRef().nativeElement.getBoundingClientRect()));
    }

    /**
     * Shows the validation tooltip, scrolling the invalid control into view first if it isn't fully visible.
     *
     * `scrollIntoView({ behavior: 'smooth' })` finishes asynchronously — for a long scroll distance it can take
     * a while — so showing the tooltip right away would anchor its overlay to a stale, pre-scroll position.
     * `scrollend` reports when the scroll actually completes; the timeout is a fallback for browsers without
     * `scrollend` support and cases where nothing ends up scrolling.
     *
     * TODO(DS-5420): "scroll an element into view, then act once settled" isn't inline-edit-specific — worth
     * extracting into `packages/components/core` in a follow-up. Kept local to this fix for now.
     */
    private showValidationTooltip(): void {
        // save() can fire repeatedly while the control stays invalid (Save button + onOverlayOutsideClick on
        // every outside click) — let an in-flight request finish rather than stacking a second scroll/listener/timer.
        if (this.validationTooltipScrollHandle) return;

        if (this.isOverlayOriginFullyVisible()) {
            this.ngZone.run(() => this.tooltipTrigger()?.show());

            return;
        }

        let shown = false;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        const removeScrollEndListener = (): void =>
            this.window.removeEventListener('scrollend', onScrollEnd, { capture: true });

        const clearFallbackTimer = (): void => {
            if (timeoutId !== null) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
        };

        const onScrollEnd = (): void => {
            const wasShown = shown;

            shown = true;
            clearFallbackTimer();
            this.validationTooltipScrollHandle?.cancel();

            this.ngZone.run(() => {
                if (!wasShown) {
                    this.showValidationTooltipIfStillInvalid();

                    return;
                }

                // Already shown via the fallback timeout at a stale position — this late scrollend corrects
                // it instead of re-showing (which would re-trigger the enter animation).
                if (this.isInvalid() && this.tooltipTrigger()?.isOpen) {
                    this.tooltipTrigger()?.updatePosition(true);
                }
            });
        };

        const onTimeout = (): void => {
            timeoutId = null;
            shown = true;
            // The handle deliberately stays installed: the scrollend listener is still armed so a late
            // scrollend can correct the stale position, and `cancel()` is the only thing that removes it.
            this.ngZone.run(() => this.showValidationTooltipIfStillInvalid());
        };

        this.ngZone.runOutsideAngular(() => {
            this.window.addEventListener('scrollend', onScrollEnd, { capture: true });
        });

        timeoutId = setTimeout(onTimeout, VALIDATION_TOOLTIP_SCROLL_TIMEOUT);

        this.validationTooltipScrollHandle = {
            cancel: (): void => {
                removeScrollEndListener();
                clearFallbackTimer();
                this.validationTooltipScrollHandle = null;
            }
        };

        this.overlayOrigin().scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
    }

    private showValidationTooltipIfStillInvalid(): void {
        if (!(this.isInvalid() && this.showTooltipOnError() && this.validationTooltip())) return;

        this.tooltipTrigger()?.show();
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
        this.restoreFocus();
    }

    /** @docs-private */
    protected onOverlayKeydown(event: KeyboardEvent): void {
        const canSaveOnEnter = this.canSaveOnEnter();

        switch (event.key) {
            case 'Escape': {
                this.cancel();
                break;
            }
            case 'Enter': {
                if (canSaveOnEnter(event)) {
                    event.preventDefault();
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
     * Tab out of the panel's first or last tabbable control saves and moves on to the next inline edit.
     * The boundary is resolved against the panel itself, so the overlay holds no extra tab stops of its own.
     * @docs-private
     */
    protected onPanelTab(event: Event, panel: HTMLElement, backwards: boolean): void {
        if (!isElement(event.target)) return;

        const tabbable = this.getTabbableElements(panel);
        const boundary = backwards ? tabbable.at(0) : tabbable.at(-1);

        if (!boundary || boundary !== event.target) return;

        this.saveAndFocusNextInlineEdit(event);
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

    private getTabbableElements(panel: Element): HTMLElement[] {
        return Array.from(panel.querySelectorAll<HTMLElement>('*')).filter(
            (element) => this.interactivityChecker.isTabbable(element) && !this.interactivityChecker.isDisabled(element)
        );
    }

    /**
     * Takes focus back when leaving edit mode would otherwise drop it on `<body>`: the element that was
     * focused when the overlay opened may have been destroyed meanwhile, which is exactly the case CDK's
     * `cdkTrapFocusAutoCapture` restore cannot handle, so the target is resolved after the view is back.
     */
    private restoreFocus(): void {
        if (this.chainingToNextInlineEdit) return;

        const activeElement = this.document.activeElement;
        const overlayElement = this.overlayDir()?.overlayRef?.overlayElement;

        if (!(activeElement === this.document.body || !!overlayElement?.contains(activeElement))) return;

        const origin = this.editModeOrigin;

        this.editModeOrigin = null;

        setTimeout(() => {
            const host = this.elementRef.nativeElement;

            if (!host.isConnected) return;

            // Resolved here rather than held across the destroy: the focus anchor is a different node on
            // every return to view mode, and the one captured on the way in is already detached.
            const target =
                host.querySelector<HTMLElement>('.kbq-inline-edit__focus-anchor') ??
                host.querySelector<HTMLElement>('.kbq-inline-edit__view-content');

            if (target) this.focusMonitor.focusVia(target, origin ?? 'program');
        });
    }

    private detectInteractiveContent(viewContent: HTMLElement, selectors: string[]): void {
        this.hasInteractiveContent.set(!!selectors.length && !!viewContent.querySelector(selectors.join(',')));
    }

    private isInteractiveElement(target: EventTarget | null): boolean {
        const selectors = this.interactiveSelectors();

        if (!selectors.length || !isElement(target)) return false;

        const match = target.closest(selectors.join(','));

        // The walk has to stop at the component: an inline edit rendered inside an `<a>` — a clickable table
        // row, say — would otherwise read every click as interactive and could never be opened by pointer.
        return !!match && this.elementRef.nativeElement.contains(match);
    }

    private saveAndFocusNextInlineEdit(event: Event): void {
        this.chainingToNextInlineEdit = true;
        this.save(event);
        this.chainingToNextInlineEdit = false;

        if (this.isInvalid()) return;

        setTimeout(() => {
            const host = isElement(this.document.activeElement)
                ? this.document.activeElement.closest<HTMLElement>(`.${baseClass}`)
                : null;
            const next = host ? inlineEditRegistry.get(host) : undefined;

            // Focus lands on the host for an interactive view, and on the focus anchor otherwise, so the
            // neighbour is resolved from the closest host element rather than from the focused node itself.
            if (!next || next === this || next.disabled() || next.modeAsReadonly() !== 'view') return;

            next.toggleMode();
        });
    }

    /**
     * Whether any projected control rejects its current value. Read from the control rather than from
     * `KbqFormField.invalid`, which is the cached `ErrorStateMatcher` verdict — `touched || submitted` —
     * and so reports a pristine invalid control as valid. Error *styling* still follows the matcher.
     */
    private isInvalid(): boolean {
        const formFieldRefList = this.formFieldRefList();

        if (!formFieldRefList.length) return false;

        return formFieldRefList.some((ref) => ref.control().ngControl?.control?.invalid ?? ref.invalid);
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
                    this.overlayOffsetY.set(-this.overlayOrigin().offsetHeight);
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

import { animate, style, transition, trigger } from '@angular/animations';
import { CdkMonitorFocus, CdkTrapFocus, InteractivityChecker } from '@angular/cdk/a11y';
import { hasModifierKey } from '@angular/cdk/keycodes';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { CdkConnectedOverlay, Overlay, ScrollDispatcher, ScrollStrategy } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import {
    afterNextRender,
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
    Injector,
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
    KBQ_A11Y_LOCALE_CONFIGURATION,
    KBQ_CONNECTED_OVERLAY_ORIGIN,
    KBQ_WINDOW,
    KbqAnimationCurves,
    KbqAnimationDurations,
    KbqComponentColors,
    KbqConnectedOverlayOriginProvider,
    KbqLocaleOverridesDirective,
    PopUpPlacements
} from '@koobiq/components/core';
import { KbqDropdownTrigger } from '@koobiq/components/dropdown';
import { KbqFormField, KbqLabel } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import {
    delayBeforeDisplayingResultWithoutOptions,
    KbqSelect,
    minimumTimeToDisplayLoading
} from '@koobiq/components/select';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { concat, defer, merge, Observable, of, skip, Subscription, timer } from 'rxjs';
import { catchError, concatMap, defaultIfEmpty, ignoreElements, map, take, takeUntil, takeWhile } from 'rxjs/operators';

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

export type KbqInlineEditMode = 'view' | 'edit';

/**
 * Saves the edited value, e.g. sends it to a server. Success is the first emitted value or completion without
 * values, failure is an error notification. The returned observable must emit or complete — otherwise the inline
 * edit stays in the saving state.
 *
 * Only the first value counts, so a stream reporting intermediate states — `HttpClient` with `observe: 'events'`,
 * for one — has to be narrowed to its final response before it's returned from here.
 */
export type KbqInlineEditSaveHandler = () => Observable<unknown>;

/**
 * State of the save request started by `saveHandler`:
 * - `idle` — no request;
 * - `pending` — the request is in flight, the progress indicator isn't shown yet;
 * - `progress` — the request is in flight and the progress indicator is shown;
 * - `error` — the last request failed.
 */
export type KbqInlineEditSaveStatus = 'idle' | 'pending' | 'progress' | 'error';

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
    if (typeof value !== 'object' || value === null) return false;

    const prototype = Object.getPrototypeOf(value);

    return prototype === Object.prototype || prototype === null;
};

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
    providers: [{ provide: KBQ_CONNECTED_OVERLAY_ORIGIN, useExisting: forwardRef(() => KbqInlineEdit) }],
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
        '[class.kbq-inline-edit_progress]': 'saveStatus() === "progress"',
        '[class.kbq-inline-edit_save-error]': 'saveStatus() === "error"',
        // The select-style editor hides its field in the panel, and without action buttons there's no other place
        // left to show the progress state, so the shared indicator goes on the host.
        '[class.kbq-progress]': 'saveStatus() === "progress" && isSingleSelect() && !showActions()',
        '(click)': 'onClick($event)',
        '(keydown.enter)': 'onClick($event)',
        '(keydown.space)': 'onClick($event)'
    },
    hostDirectives: [
        CdkMonitorFocus,
        { directive: KbqLocaleOverridesDirective, inputs: ['kbqLocaleOverrides: localeOverrides'] }
    ],
    animations: [KBQ_INLINE_EDIT_ACTION_BUTTONS_ANIMATION],
    exportAs: 'kbqInlineEdit'
})
export class KbqInlineEdit implements KbqConnectedOverlayOriginProvider {
    /** Accessible names for the icon-only save/cancel buttons. */
    protected readonly a11yLocaleConfiguration = inject(KbqLocaleOverridesDirective, { self: true }).read(
        'a11y',
        KBQ_A11Y_LOCALE_CONFIGURATION
    );

    private readonly overlay = inject(Overlay);
    private readonly document = inject(DOCUMENT);
    private readonly window = inject(KBQ_WINDOW);
    private readonly resizeObserver = inject(SharedResizeObserver);
    protected readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly ngZone = inject(NgZone);
    private readonly scrollDispatcher = inject(ScrollDispatcher);
    private readonly injector = inject(Injector);
    private readonly interactivityChecker = inject(InteractivityChecker);
    private readonly destroyRef = inject(DestroyRef);

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
    /**
     * Handler that saves a valid value asynchronously. While its observable is pending, the component stays in edit
     * mode, blocks input and shows the progress state; on success it returns to view mode and emits `saved`, on
     * error it stays in edit mode and shows `validationTooltip`. Without it, a valid value is saved immediately.
     */
    readonly saveHandler = input<KbqInlineEditSaveHandler>();
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
    protected readonly saveStatus = signal<KbqInlineEditSaveStatus>('idle');
    /** @docs-private */
    protected readonly isSaving = computed(() => this.saveStatus() === 'pending' || this.saveStatus() === 'progress');

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

    /** Value sent by the last `saveHandler` request, compared to detect edits after a failed save. */
    private submittedValue: unknown;

    private saveSubscription: Subscription | null = null;

    /** Direction of the Tab that started the in-flight save, replayed once the save succeeds. */
    private pendingTabOut: 'forward' | 'backward' | null = null;

    /** Handle for an in-flight `showValidationTooltip()` scroll/settle request, if any. */
    private validationTooltipScrollHandle: { cancel: () => void } | null = null;

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

    /**
     * Saves the current value, running the same validation as a normal save. With `saveHandler` the save is
     * asynchronous: view mode is entered once the request succeeds, and a failed request keeps edit mode open.
     */
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
        this.setSaveGuardListeners();

        this.overlayDir()!
            .overlayRef.detachments()
            .pipe(take(1))
            .subscribe(() => {
                this.validationTooltipScrollHandle?.cancel();
                this.cancelSave();
            });

        const formFieldRefList = this.formFieldRefList();

        merge(...formFieldRefList.map((ref) => ref.control().stateChanges))
            .pipe(takeUntil(this.overlayDir()!.overlayRef.detachments()))
            .subscribe(() => this.clearFailedSaveOnEdit());

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

        if (this.isSaving()) {
            $event?.stopPropagation();

            return;
        }

        // Deliberately `isInvalid()` rather than `hasError()`: a failed request leaves the value itself valid, and
        // resubmitting it unchanged has to stay possible.
        if (this.isInvalid()) {
            $event?.stopPropagation();

            if (this.showTooltipOnError() && this.validationTooltip()) {
                this.showValidationTooltip();
            }

            return;
        }

        const saveHandler = this.saveHandler();

        if (saveHandler) {
            $event?.stopPropagation();
            this.startSave(saveHandler);

            return;
        }

        this.toggleMode();
        this.saved.emit();
    }

    /**
     * Runs `saveHandler` once and maps its lifecycle onto `saveStatus`. The progress state appears only if the
     * request outlasts `delayBeforeDisplayingResultWithoutOptions` and then stays for at least
     * `minimumTimeToDisplayLoading`, so a fast response causes no flicker.
     */
    private startSave(saveHandler: KbqInlineEditSaveHandler): void {
        this.submittedValue = this.getValue();
        this.validationTooltipScrollHandle?.cancel();
        this.hideValidationTooltip();
        this.closeControlPanels();
        this.saveStatus.set('pending');

        const result$ = defer(saveHandler).pipe(
            take(1),
            map(() => 'success' as const),
            defaultIfEmpty('success' as const),
            catchError(() => of('error' as const))
        );
        const progress$ = timer(delayBeforeDisplayingResultWithoutOptions).pipe(map(() => 'progress' as const));

        const subscription = merge(result$, progress$)
            .pipe(
                // Completes on the result, dropping the progress timer when the request settles first.
                takeWhile((status) => status === 'progress', true),
                // A result arriving while the progress state is shown is queued behind the minimum display time.
                concatMap((status) =>
                    status === 'progress'
                        ? concat(of(status), timer(minimumTimeToDisplayLoading).pipe(ignoreElements()))
                        : of(status)
                ),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((status) => {
                if (status === 'progress') {
                    this.saveStatus.set('progress');

                    return;
                }

                this.saveSubscription = null;

                if (status === 'success') {
                    this.onSaveSucceeded();
                } else {
                    this.onSaveFailed();
                }
            });

        // A handler settling synchronously runs the subscriber above before `subscribe()` returns, so the
        // subscription is already closed here and there is nothing left to cancel.
        this.saveSubscription = subscription.closed ? null : subscription;
    }

    /**
     * Closes an overlay the control renders on its own — `KbqSelect`'s options, for one. It lives outside this
     * component's panel, so neither `blockInputWhileSaving()` nor `pointer-events: none` would keep the user from
     * picking another value while the request is in flight.
     */
    private closeControlPanels(): void {
        this.formFieldRefList().forEach((ref) => (ref.control() as { close?: () => void }).close?.());
    }

    private onSaveSucceeded(): void {
        const pendingTabOut = this.pendingTabOut;

        this.pendingTabOut = null;
        this.saveStatus.set('idle');
        this.toggleMode();
        this.saved.emit();

        if (!pendingTabOut) return;

        // The Tab that started the save was blocked to keep focus in the control, so its navigation is replayed once
        // edit mode closes and focus is restored to the host — as the browser does right after a synchronous save.
        setTimeout(() => {
            this.getAdjacentTabbableElement(pendingTabOut)?.focus();
            this.focusNextInlineEdit();
        });
    }

    /** Finds the element the browser's Tab (or Shift+Tab) would move focus to from the host. */
    private getAdjacentTabbableElement(direction: 'forward' | 'backward'): HTMLElement | null {
        const host = this.elementRef.nativeElement;
        const walker = this.document.createTreeWalker(this.document.body, NodeFilter.SHOW_ELEMENT);

        walker.currentNode = host;

        let node = direction === 'forward' ? walker.nextNode() : walker.previousNode();

        while (node) {
            const element = node as HTMLElement;

            if (
                !host.contains(element) &&
                this.interactivityChecker.isFocusable(element) &&
                this.interactivityChecker.isTabbable(element)
            ) {
                return element;
            }

            node = direction === 'forward' ? walker.nextNode() : walker.previousNode();
        }

        return null;
    }

    private onSaveFailed(): void {
        this.pendingTabOut = null;
        this.saveStatus.set('error');
        this.formFieldRef()?.focus();

        // The consumer usually sets the server message in `validationTooltip` from the failed observable. It reaches
        // the tooltip only once this component re-renders, so showing it synchronously would use the previous text,
        // or do nothing while the tooltip is still disabled.
        afterNextRender(
            () => {
                if (this.isEditMode() && this.saveStatus() === 'error') {
                    this.showValidationTooltipIfNeeded();
                }
            },
            { injector: this.injector }
        );
    }

    private cancelSave(): void {
        this.saveSubscription?.unsubscribe();
        this.saveSubscription = null;
        this.pendingTabOut = null;
        this.saveStatus.set('idle');
    }

    /**
     * Keeps the edited value frozen while a request is in flight.
     *
     * The keydown listener runs in the capture phase on purpose: a projected control handles its own keys first,
     * so a bubbling listener would only see a value that has already changed — Space toggling a checkbox, or
     * Enter picking an option in a `KbqSelect`. `input`/`change` complement the `stateChanges` stream, which stays
     * silent for edit-mode content without a `KbqFormField` (a custom `getValueHandler`, for one).
     */
    private setSaveGuardListeners(): void {
        const overlayElement = this.overlayDir().overlayRef.overlayElement;

        const blockKeyboardWhileSaving = (event: KeyboardEvent): void => {
            // Shortcuts that don't edit — copy, select all — stay available; the editing ones are stopped by
            // `blockInputWhileSaving()`, which sees paste and cut as `beforeinput`.
            if (!this.isSaving() || hasModifierKey(event, 'ctrlKey', 'metaKey')) return;

            event.preventDefault();
            event.stopPropagation();

            if (event.key === 'Tab') this.deferTabOut(event);
        };
        const clearFailedSaveOnEdit = (): void => this.clearFailedSaveOnEdit();

        overlayElement.addEventListener('keydown', blockKeyboardWhileSaving, { capture: true });
        overlayElement.addEventListener('input', clearFailedSaveOnEdit);
        overlayElement.addEventListener('change', clearFailedSaveOnEdit);

        this.overlayDir()
            .overlayRef.detachments()
            .pipe(take(1))
            .subscribe(() => {
                overlayElement.removeEventListener('keydown', blockKeyboardWhileSaving, { capture: true });
                overlayElement.removeEventListener('input', clearFailedSaveOnEdit);
                overlayElement.removeEventListener('change', clearFailedSaveOnEdit);
            });
    }

    /**
     * A failed save stays reported until the value itself changes: the sources that trigger this — `stateChanges`
     * and the DOM input events — also fire on focus and error state changes, and refocusing the control right
     * after the failure must not hide its tooltip.
     */
    private clearFailedSaveOnEdit(): void {
        if (this.saveStatus() === 'error' && !this.isSameValue(this.submittedValue, this.getValue())) {
            this.saveStatus.set('idle');
        }

        if (!this.hasError()) {
            this.hideValidationTooltip();
        }
    }

    /** Remembers which way a Tab blocked during a save pointed, so `onSaveSucceeded()` can replay the navigation. */
    private deferTabOut(event: KeyboardEvent): void {
        this.pendingTabOut ??= hasModifierKey(event, 'shiftKey') ? 'backward' : 'forward';
    }

    /**
     * Whether `overlayOrigin` is fully within the viewport and every registered `CdkScrollable`
     * ancestor between it and the viewport. Ancestors without the `CdkScrollable` directive aren't
     * visible to `ScrollDispatcher` and aren't checked — same limitation as the rest of overlay
     * positioning.
     */
    private isOverlayOriginFullyVisible(): boolean {
        const rect = this.overlayOrigin.getBoundingClientRect();

        const isWithin = (container: { top: number; left: number; bottom: number; right: number }): boolean =>
            rect.top >= container.top &&
            rect.left >= container.left &&
            rect.bottom <= container.bottom &&
            rect.right <= container.right;

        if (!isWithin({ top: 0, left: 0, bottom: this.window.innerHeight, right: this.window.innerWidth })) {
            return false;
        }

        return this.scrollDispatcher
            .getAncestorScrollContainers(this.overlayOrigin)
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
            clearFallbackTimer();

            if (!shown) {
                shown = true;
                removeScrollEndListener();
                this.validationTooltipScrollHandle = null;
                this.ngZone.run(() => this.showValidationTooltipIfNeeded());

                return;
            }

            // Already shown via the fallback timeout at a stale position — this late scrollend corrects it
            // instead of re-showing (which would re-trigger the enter animation).
            removeScrollEndListener();
            this.validationTooltipScrollHandle = null;
            this.ngZone.run(() => {
                if (this.hasError() && this.tooltipTrigger()?.isOpen) {
                    this.tooltipTrigger()?.updatePosition(true);
                }
            });
        };

        const onTimeout = (): void => {
            timeoutId = null;
            shown = true;
            this.validationTooltipScrollHandle = null;
            this.ngZone.run(() => this.showValidationTooltipIfNeeded());
            // Deliberately keep the scrollend listener alive: a late scrollend still corrects the stale
            // position via the branch above. Removed by cancel() or the next onScrollEnd call.
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

        this.overlayOrigin.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
    }

    private showValidationTooltipIfNeeded(): void {
        if (!(this.hasError() && this.showTooltipOnError() && this.validationTooltip())) return;

        this.tooltipTrigger()?.show();
    }

    private hideValidationTooltip(): void {
        const tooltipTrigger = this.tooltipTrigger();

        if (tooltipTrigger?.isOpen) {
            tooltipTrigger.hide();
        }
    }

    /** Whether the control is invalid or the last save request failed — both are reported by the validation tooltip. */
    private hasError(): boolean {
        return this.isInvalid() || this.saveStatus() === 'error';
    }

    /** @docs-private */
    protected cancel(): void {
        // The request may have already reached the server, so the value can't be safely reverted until it settles.
        if (this.isSaving()) return;

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
        if (this.isSaving()) {
            // Keys pressed inside the panel are already stopped in the capture phase by `setSaveGuardListeners()`;
            // what still reaches this handler comes from an overlay the control renders on its own, where only the
            // Tab that would move focus out of the edit mode is ours to block.
            if (event.key === 'Tab') {
                event.preventDefault();
                this.deferTabOut(event);
            }

            return;
        }

        this.markAllAsTouched();
        const canSaveOnEnter = this.canSaveOnEnter();

        switch (event.key) {
            case 'Escape': {
                this.cancel();
                break;
            }
            case 'Enter': {
                // A button in edit mode runs its own action on Enter — saving here as well would fire both, and
                // for the cancel button the browser then blurs it the moment saving disables it.
                if (event.target instanceof HTMLButtonElement) return;

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
     * Blocks editing while a save request is in flight. Unlike `inert` or disabling the control, it keeps focus
     * in the control and doesn't change the form state.
     * @docs-private
     */
    protected blockInputWhileSaving(event: Event): void {
        if (this.isSaving()) {
            event.preventDefault();
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

    private saveAndFocusNextInlineEdit(event: KeyboardEvent): void {
        this.save(event);

        // Focus has to stay in the control both while the request is in flight and after it failed — a handler
        // failing synchronously has already refocused the control by now, and the native navigation would undo it.
        if (this.isSaving() || this.saveStatus() === 'error') {
            event.preventDefault();

            // Only an in-flight request gets its navigation replayed, once it succeeds.
            if (this.isSaving()) this.deferTabOut(event);

            return;
        }

        if (this.isInvalid()) return;

        this.focusNextInlineEdit();
    }

    private focusNextInlineEdit(): void {
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

    /**
     * Compares values returned by `getValue()`. It wraps form field values in a new array on every call, and a
     * custom `getValueHandler` composing several fields usually returns a new object — identity alone would report
     * an edit that never happened. Anything else, a `Date` in particular, is left to identity: comparing it by its
     * own enumerable keys would find no difference between two different dates.
     */
    private isSameValue(a: unknown, b: unknown): boolean {
        if (Object.is(a, b)) return true;

        if (Array.isArray(a) && Array.isArray(b)) {
            return a.length === b.length && a.every((item, index) => Object.is(item, b[index]));
        }

        if (isPlainObject(a) && isPlainObject(b)) {
            const keys = Object.keys(a);

            return keys.length === Object.keys(b).length && keys.every((key) => Object.is(a[key], b[key]));
        }

        return false;
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

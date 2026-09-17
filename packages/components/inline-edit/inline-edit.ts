import { animate, style, transition, trigger } from '@angular/animations';
import { CdkMonitorFocus, CdkTrapFocus } from '@angular/cdk/a11y';
import { hasModifierKey } from '@angular/cdk/keycodes';
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
    InjectionToken,
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
import { concat, defer, merge, Observable, of, skip, timer } from 'rxjs';
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
 * - `progress` — the request is in flight and view mode shows the progress indicator;
 * - `error` — the last request failed, and view mode keeps reporting it until the user reacts.
 */
export type KbqInlineEditSaveStatus = 'idle' | 'pending' | 'progress' | 'error';

/** Failed save, reported through `saveError` and `KBQ_INLINE_EDIT_SAVE_ERROR_HANDLER`. */
export interface KbqInlineEditSaveErrorContext {
    /** Error the `saveHandler` observable failed with. */
    readonly error: unknown;
    /**
     * Inline edit whose save failed. Its `retrySave()`, `toggleMode()` and `rollback()` back the three recovery
     * actions a notification usually offers: retry, edit again and discard the unsaved value.
     */
    readonly inlineEdit: KbqInlineEdit;
}

/** Reaction to a failed save, e.g. opening a toast. */
export type KbqInlineEditSaveErrorHandler = (context: KbqInlineEditSaveErrorContext) => void;

/**
 * Handler called whenever a `saveHandler` request fails. Provide it once for the application to report every failed
 * save the same way; `saveError` covers the cases where a single inline edit needs its own reaction.
 */
export const KBQ_INLINE_EDIT_SAVE_ERROR_HANDLER = new InjectionToken<KbqInlineEditSaveErrorHandler>(
    'KbqInlineEditSaveErrorHandler'
);

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
        '[class.kbq-inline-edit_save-error]': 'saveStatus() === "error"',
        // The background save is reported on the row itself, which by then is back in view mode.
        '[class.kbq-progress]': 'saveStatus() === "progress"',
        '[attr.aria-busy]': 'isSaving() || null',
        '[attr.aria-invalid]': 'saveStatus() === "error" || null',
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
     * Handler that saves a valid value in the background. Edit mode closes as soon as client-side validation
     * passes, and view mode shows the progress state while the request is in flight: on success it emits `saved`,
     * on error it reports the failure through `saveError` and keeps the unsaved value marked. Without it, a valid
     * value is saved immediately.
     */
    readonly saveHandler = input<KbqInlineEditSaveHandler>();
    /**
     * Reaction to a failed save, called with the same context `saveError` carries. Defaults to the handler provided
     * for the application through `KBQ_INLINE_EDIT_SAVE_ERROR_HANDLER`: binding it replaces that default for this
     * inline edit alone, and binding `null` leaves it without one.
     */
    readonly saveErrorHandler = input<KbqInlineEditSaveErrorHandler | null>(
        inject(KBQ_INLINE_EDIT_SAVE_ERROR_HANDLER, { optional: true })
    );
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
    /** Emitted when a `saveHandler` request fails. */
    protected readonly saveError = output<KbqInlineEditSaveErrorContext>();
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

    private readonly saveStatusSource = signal<KbqInlineEditSaveStatus>('idle');
    /** State of the background save started by `saveHandler`. */
    readonly saveStatus = computed(() => this.saveStatusSource());
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
        if (this.isEditMode() || this.disabled() || this.hasInteractiveContent() || this.isSaving()) return -1;

        return 0;
    });

    /** @docs-private */
    protected readonly placements = PopUpPlacements;

    /** @docs-private */
    protected readonly colors = KbqComponentColors;

    private initialValue: unknown;

    /** Value sent by the in-flight `saveHandler` request, which becomes `lastSavedValue` once it succeeds. */
    private submittedValue: unknown;

    /** Last value the server accepted — what `rollback()` restores after a failed save. */
    private lastSavedValue: unknown;

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
     * Saves the current value, running the same validation as a normal save. With `saveHandler` it returns to view
     * mode right away and the request runs in the background — the outcome arrives through `saved` or `saveError`.
     */
    commit(): void {
        this.save();
    }

    /**
     * Repeats the request for a value the server rejected. Does nothing unless the last save failed, so a
     * notification can call it without tracking the state itself.
     */
    retrySave(): void {
        const saveHandler = this.saveHandler();

        if (this.saveStatus() !== 'error' || !saveHandler) return;

        this.startSave(saveHandler);
    }

    /** Discards the value the server rejected, restoring the last saved one and clearing the failed state. */
    rollback(): void {
        if (this.saveStatus() !== 'error') return;

        this.setValue(this.lastSavedValue);
        this.saveStatusSource.set('idle');
    }

    /** @docs-private */
    protected onClick(event: Event): void {
        // Editing is closed while the request is in flight: reopening it would let the user edit a value that is
        // already on its way to the server.
        if (this.disabled() || this.isEditMode() || this.isSaving() || this.isInteractiveElement(event.target)) return;

        event.preventDefault();
        event.stopPropagation();

        this.toggleMode();
    }

    /** @docs-private */
    protected onAttach(): void {
        this.setOverlayWidth();
        this.setOverlayKeydownListener();

        this.overlayDir()!
            .overlayRef.detachments()
            .pipe(take(1))
            .subscribe(() => this.validationTooltipScrollHandle?.cancel());

        const formFieldRefList = this.formFieldRefList();

        merge(...formFieldRefList.map((ref) => ref.control().stateChanges))
            .pipe(takeUntil(this.overlayDir()!.overlayRef.detachments()))
            .subscribe(() => {
                if (!this.isInvalid()) {
                    this.hideValidationTooltip();
                }
            });

        setTimeout(() => {
            const formFieldRef = this.formFieldRef();

            if (!formFieldRef) return;

            formFieldRef.focus();

            this.initialValue = this.getValue();

            // Opening the editor over a value the server rejected must not turn that value into the one
            // `rollback()` restores.
            if (this.saveStatus() !== 'error') {
                this.lastSavedValue = this.initialValue;
            }

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

            return;
        }

        const saveHandler = this.saveHandler();

        // Client-side validation has passed, so editing is over either way: with a handler the request runs in the
        // background, and view mode reports how it went.
        this.toggleMode();

        if (saveHandler) {
            this.startSave(saveHandler);

            return;
        }

        this.saved.emit();
    }

    /**
     * Runs `saveHandler` once and maps its lifecycle onto `saveStatus`. The progress state appears only if the
     * request outlasts `delayBeforeDisplayingResultWithoutOptions` and then stays for at least
     * `minimumTimeToDisplayLoading`, so a fast response causes no flicker.
     */
    private startSave(saveHandler: KbqInlineEditSaveHandler): void {
        this.submittedValue = this.getValue();
        this.saveStatusSource.set('pending');

        const success = { status: 'success' } as const;
        const result$ = defer(saveHandler).pipe(
            take(1),
            map(() => success),
            defaultIfEmpty(success),
            catchError((error: unknown) => of({ status: 'error', error } as const))
        );
        const progress$ = timer(delayBeforeDisplayingResultWithoutOptions).pipe(
            map(() => ({ status: 'progress' }) as const)
        );

        // Nothing cancels the request: a new one can only be started from the failed state, and the value it
        // carries is already on its way to the server.
        merge(result$, progress$)
            .pipe(
                // Completes on the result, dropping the progress timer when the request settles first.
                takeWhile((result) => result.status === 'progress', true),
                // A result arriving while the progress state is shown is queued behind the minimum display time.
                concatMap((result) =>
                    result.status === 'progress'
                        ? concat(of(result), timer(minimumTimeToDisplayLoading).pipe(ignoreElements()))
                        : of(result)
                ),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((result) => {
                if (result.status === 'progress') {
                    this.saveStatusSource.set('progress');

                    return;
                }

                if (result.status === 'success') {
                    this.onSaveSucceeded();
                } else {
                    this.onSaveFailed(result.error);
                }
            });
    }

    private onSaveSucceeded(): void {
        this.lastSavedValue = this.submittedValue;
        this.saveStatusSource.set('idle');
        this.saved.emit();
    }

    private onSaveFailed(error: unknown): void {
        this.saveStatusSource.set('error');

        const context: KbqInlineEditSaveErrorContext = { error, inlineEdit: this };

        this.saveError.emit(context);
        this.saveErrorHandler()?.(context);
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
                if (this.isInvalid() && this.tooltipTrigger()?.isOpen) {
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
        if (!(this.isInvalid() && this.showTooltipOnError() && this.validationTooltip())) return;

        this.tooltipTrigger()?.show();
    }

    private hideValidationTooltip(): void {
        const tooltipTrigger = this.tooltipTrigger();

        if (tooltipTrigger?.isOpen) {
            tooltipTrigger.hide();
        }
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
                // A button in edit mode runs its own action on Enter — saving here as well would fire both.
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

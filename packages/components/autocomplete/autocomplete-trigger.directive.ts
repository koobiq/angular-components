import { Directionality } from '@angular/cdk/bidi';
import {
    ConnectedPosition,
    FlexibleConnectedPositionStrategy,
    FlexibleConnectedPositionStrategyOrigin,
    Overlay,
    OverlayConfig,
    OverlayRef,
    PositionStrategy,
    ScrollDispatcher,
    ScrollStrategy
} from '@angular/cdk/overlay';
import { _getEventTarget, _getFocusedElementPierceShadowDom } from '@angular/cdk/platform';
import { TemplatePortal } from '@angular/cdk/portal';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { DOCUMENT } from '@angular/common';
import {
    afterNextRender,
    AfterViewInit,
    booleanAttribute,
    ChangeDetectorRef,
    Directive,
    effect,
    ElementRef,
    forwardRef,
    inject,
    InjectionToken,
    input,
    NgZone,
    OnDestroy,
    output,
    Provider,
    Renderer2,
    untracked,
    ViewContainerRef
} from '@angular/core';
import { outputToObservable, toObservable } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
    defaultOffsetY,
    DOWN_ARROW,
    ENTER,
    ESCAPE,
    hasModifierKey,
    KBQ_CONNECTED_OVERLAY_ABOVE_CLASS,
    KBQ_CONNECTED_OVERLAY_BELOW_CLASS,
    KBQ_WINDOW,
    KbqCaretRect,
    kbqCreateCaretOrigin,
    kbqCreateTextMirror,
    kbqGetCaretRect,
    kbqGetPanelWidthOrigin,
    kbqGetTextQuery,
    kbqIsTextLaidOutFromStart,
    kbqListenForCaretMoves,
    KbqOption,
    kbqOptionalNumberAttribute,
    KbqOptionSelectionChange,
    kbqRepositionScrollStrategyFactory,
    KbqResolvedPanelWidth,
    kbqResolvePanelWidth,
    KbqSiblingPopup,
    kbqSiblingPopupProvider,
    KbqTextMirror,
    KbqTextQuery,
    KeyboardNavigationHandler,
    RIGHT_ARROW,
    TAB,
    UP_ARROW
} from '@koobiq/components/core';
import { KBQ_FORM_FIELD } from '@koobiq/components/form-field';
import { defer, fromEvent, merge, Observable, of as observableOf, Subject, Subscription } from 'rxjs';
import { delay, filter, map, switchMap, take, tap } from 'rxjs/operators';
import { KbqAutocompleteOrigin } from './autocomplete-origin.directive';
import { KbqAutocomplete } from './autocomplete.component';

/**
 * The total height of the autocomplete panel.
 *
 * @deprecated Unused — the panel is capped by `--kbq-autocomplete-size-panel-max-height` and reveals its
 * active option through `KbqOption.focus`, so nothing computes a scroll offset from this. Will be removed
 * in the next major release.
 */
export const AUTOCOMPLETE_PANEL_HEIGHT = 256;

/**
 * Injection token that determines the scroll handling while the autocomplete panel is open. The root default
 * keeps the trigger usable outside `KbqAutocompleteModule`'s injector; providing the token anywhere still wins
 * over it.
 */
export const KBQ_AUTOCOMPLETE_SCROLL_STRATEGY = new InjectionToken<() => ScrollStrategy>(
    'kbq-autocomplete-scroll-strategy',
    {
        providedIn: 'root',
        factory: () => KBQ_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY(inject(ScrollDispatcher))
    }
);

/** @docs-private */
export function KBQ_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY(scrollDispatcher: ScrollDispatcher): () => ScrollStrategy {
    return kbqRepositionScrollStrategyFactory(scrollDispatcher);
}

/** @docs-private */
export const KBQ_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER = {
    provide: KBQ_AUTOCOMPLETE_SCROLL_STRATEGY,
    deps: [ScrollDispatcher],
    useFactory: KBQ_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY
};

/**
 * Provider that allows the autocomplete to register as a ControlValueAccessor.
 * @docs-private
 */
export const KBQ_AUTOCOMPLETE_VALUE_ACCESSOR: Provider = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => KbqAutocompleteTrigger),
    multi: true
};

/** Class of the layer that draws the inline hint over the field. */
const INLINE_HINT_CLASS = 'kbq-autocomplete-inline-hint';

/**
 * `type` of the fields whose native role, `textbox` or `searchbox`, supports `aria-autocomplete` and
 * `aria-activedescendant`. A textarea reports `textarea`.
 */
const TEXT_FIELD_TYPES = new Set(['text', 'search', 'email', 'tel', 'url', 'textarea']);

/**
 * Creates an error to be thrown when attempting to use an autocomplete trigger without a panel.
 * @internal
 */
export function getKbqAutocompleteMissingPanelError(): Error {
    return Error(
        'Attempting to open an undefined instance of `kbq-autocomplete`. ' +
            'Make sure that the id passed to the `kbqAutocomplete` is correct and that ' +
            "you're attempting to open it after the ngAfterContentInit hook."
    );
}

@Directive({
    selector: `input[kbqAutocomplete], textarea[kbqAutocomplete]`,
    providers: [KBQ_AUTOCOMPLETE_VALUE_ACCESSOR, kbqSiblingPopupProvider(KbqAutocompleteTrigger)],
    host: {
        class: 'kbq-autocomplete-trigger',
        '[attr.autocomplete]': 'autocompleteAttribute()',
        // WAI-ARIA 1.2 combobox. A field that cannot take the role (see `isCombobox`) keeps its native one, which does
        // not support `aria-expanded`.
        '[attr.role]': 'isCombobox ? "combobox" : null',
        '[attr.aria-expanded]': 'isCombobox ? panelOpen : null',
        '[attr.aria-autocomplete]': 'exposesPanel ? (textMode() && inlineHint() ? "both" : "list") : null',
        '[attr.aria-controls]': 'exposesPanel && panelOpen ? autocomplete().listboxId : null',
        '[attr.aria-activedescendant]': 'exposesPanel && panelOpen ? activeOption?.id : null',
        // Note: we use `focusin`, as opposed to `focus`, in order to open the panel
        // a little earlier. This avoids issues where IE delays the focusing of the input.
        '(focusin)': 'handleFocus()',
        '(blur)': 'onTouched()',
        '(input)': 'handleInput($event)',
        '(keydown)': 'handleKeydown($event)',
        '(click)': 'handleClick($event)'
    },
    exportAs: 'kbqAutocompleteTrigger'
})
export class KbqAutocompleteTrigger
    implements AfterViewInit, ControlValueAccessor, OnDestroy, KeyboardNavigationHandler, KbqSiblingPopup
{
    private elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
    private viewContainerRef = inject(ViewContainerRef);
    private changeDetectorRef = inject(ChangeDetectorRef);
    private overlay = inject(Overlay);
    private zone = inject(NgZone);
    private dir = inject(Directionality, { optional: true })!;
    private readonly formField = inject(KBQ_FORM_FIELD, { optional: true, host: true });
    private viewportRuler = inject(ViewportRuler);

    protected readonly document = inject<Document>(DOCUMENT);

    readonly optionSelections: Observable<KbqOptionSelectionChange> = defer(() => {
        const autocomplete = this.autocomplete();

        if (autocomplete && autocomplete.options) {
            return merge(...autocomplete.options.map((option) => option.onSelectionChange));
        }

        // If there are any subscribers before `ngAfterViewInit`, the `autocomplete` will be undefined.
        // Return a stream that we'll replace with the real one once everything is in place.
        return this.zone.onStable.asObservable().pipe(
            take(1),
            switchMap(() => this.optionSelections)
        );
    });

    /** The currently active option, coerced to MatOption type. */
    get activeOption(): KbqOption | null {
        return this.autocomplete()?.keyManager?.activeItem;
    }

    get panelOpen(): boolean {
        return this.overlayAttached && this.autocomplete().showPanel();
    }

    /** The autocomplete panel to be attached to this trigger. */
    readonly autocomplete = input<KbqAutocomplete>(undefined!, { alias: 'kbqAutocomplete' });

    /** Whether the autocomplete panel is currently on screen. Part of the `KbqSiblingPopup` contract. */
    get isAttached(): boolean {
        return this.overlayAttached;
    }

    /**
     * Emits `true` when the panel opens and `false` when it closes. Part of the `KbqSiblingPopup`
     * contract.
     *
     * Built on top of the `autocomplete` signal rather than read once: the panel is bound after the consumers
     * of this stream are created (a tooltip on the same element subscribes in its constructor).
     */
    readonly openedChange: Observable<boolean> = toObservable(this.autocomplete).pipe(
        filter(Boolean),
        switchMap((autocomplete) =>
            merge(
                outputToObservable(autocomplete.opened).pipe(map(() => true)),
                outputToObservable(autocomplete.closed).pipe(map(() => false))
            )
        )
    );

    /**
     * Reference relative to which to position the autocomplete panel.
     * Defaults to the autocomplete trigger element.
     */
    readonly connectedTo = input<KbqAutocompleteOrigin>(undefined!, { alias: 'kbqAutocompleteConnectedTo' });

    /**
     * `autocomplete` attribute to be set on the input element.
     * @docs-private
     */
    readonly autocompleteAttribute = input<string>('off', { alias: 'autocomplete' });

    /**
     * Whether the autocomplete is disabled. When disabled, the element will
     * act as a regular input and the user won't be able to open the panel.
     */
    readonly autocompleteDisabled = input(false, {
        alias: 'kbqAutocompleteDisabled',
        transform: booleanAttribute
    });

    /**
     * Event handler for input blur events.
     * Determines whether the blur event is triggered outside the specific target
     * @returns A boolean indicating if the blur event happened outside the target element
     */
    readonly onInputBlur = input(
        (event: FocusEvent): boolean => {
            const target: HTMLElement = event.relatedTarget as HTMLElement;

            return !target || target.tagName !== 'KBQ-OPTION';
        },
        { alias: 'kbqAutocompleteOnBlur' }
    );

    /**
     * Whether the panel opens from the text caret instead of the field: its left edge at the caret, right below the
     * caret's line, following the caret while it moves. The panel is only as wide as its options — `panelMinWidth`
     * does not apply there, an explicit `panelWidth` still does.
     */
    readonly relativeToCaret = input<boolean, boolean | string | null | undefined>(false, {
        alias: 'kbqAutocompleteRelativeToCaret',
        transform: booleanAttribute
    });

    /**
     * Whether the autocomplete completes the text at the caret instead of the whole value. The query is the word
     * before the caret, or the text after one of `kbqAutocompleteTriggers`; choosing an option replaces the query,
     * trigger included, with the option. The form value stays the whole text.
     */
    readonly textMode = input<boolean, boolean | string | null | undefined>(false, {
        alias: 'kbqAutocompleteTextMode',
        transform: booleanAttribute
    });

    /** Strings that start a query in text mode, such as `/` or `@`. When empty, the query is the word before the caret. */
    readonly queryTriggers = input<readonly string[]>([], { alias: 'kbqAutocompleteTriggers' });

    /** Shortest query that opens the panel in text mode. Defaults to `1` for a word and to `0` after a trigger. */
    readonly queryMinLength = input<number | undefined, number | string | null | undefined>(undefined, {
        alias: 'kbqAutocompleteMinLength',
        transform: kbqOptionalNumberAttribute
    });

    /**
     * Whether text mode draws the rest of the active option after the caret, to be accepted with `Tab` or `→`. The
     * field has to be inside `kbq-form-field`.
     */
    readonly inlineHint = input<boolean, boolean | string | null | undefined>(true, {
        alias: 'kbqAutocompleteInlineHint',
        transform: booleanAttribute
    });

    /**
     * Emits the query at the caret in text mode whenever it changes, or `null` once there is none. The query is read
     * again as the user types or clicks in the field, and as the caret moves while the panel is open. It carries the
     * trigger it starts with, which tells apart the options to show for each trigger.
     */
    readonly queryChange = output<KbqTextQuery | null>({ alias: 'kbqAutocompleteQueryChange' });

    /**
     * Whether the host takes the `combobox` role. ARIA in HTML allows it on a text input only: a textarea and the
     * other text fields keep their native role.
     */
    protected get isCombobox(): boolean {
        return this.exposesPanel && this.elementRef.nativeElement.type === 'text';
    }

    /**
     * Whether the host exposes the panel to assistive technology: a text field with the autocomplete enabled. Other
     * fields, such as a number input, keep their native semantics.
     */
    protected get exposesPanel(): boolean {
        return !this.autocompleteDisabled() && TEXT_FIELD_TYPES.has(this.elementRef.nativeElement.type);
    }

    private readonly renderer = inject(Renderer2);

    /** Origin of a caret-anchored panel, measured again whenever the panel is positioned. */
    private readonly caretOrigin = kbqCreateCaretOrigin(() => this.measureCaretOrigin());

    /** Query at the caret in text mode, or `null` while there is none. */
    private query: KbqTextQuery | null = null;

    /** Stops the listeners that follow the caret while the panel is open. */
    private stopCaretListeners: (() => void) | null = null;

    /** Layer that draws the inline hint, created the first time there is a hint to draw. */
    private textMirror: KbqTextMirror | null = null;

    /** Inline hint drawn after the caret, or `''` while there is none. */
    private inlineHintText = '';

    private overlayAttached: boolean = false;

    private overlayRef: OverlayRef | null;

    private portal: TemplatePortal;

    private componentDestroyed = false;

    private scrollStrategy: () => ScrollStrategy;

    /** Old value of the native input. Used to work around issues with the `input` event on IE. */
    private previousValue: string | number | null;

    /** Strategy that is used to position the panel. */
    private positionStrategy: FlexibleConnectedPositionStrategy;

    /** The subscription for closing actions (some are bound to document). */
    private closingActionsSubscription: Subscription;

    /** Subscription to viewport size changes. */
    private viewportSubscription = Subscription.EMPTY;

    /**
     * Whether the autocomplete can open the next time it is focused. Used to prevent a focused,
     * closed autocomplete from being reopened if the user switches to another browser tab and then
     * comes back.
     */
    private canOpenOnNextFocus = true;

    /** Stream of keyboard events that can close the panel. */
    private readonly closeKeyEventStream = new Subject<void>();
    private readonly window = inject(KBQ_WINDOW);

    constructor() {
        const zone = this.zone;
        const scrollStrategy = inject(KBQ_AUTOCOMPLETE_SCROLL_STRATEGY);

        afterNextRender(() => {
            zone.runOutsideAngular(() => this.window.addEventListener('blur', this.windowBlurHandler));
        });

        // A hint drawn before text mode, the hint or the autocomplete itself was switched off must not stay behind.
        effect(() => {
            this.textMode();
            this.inlineHint();
            this.autocompleteDisabled();
            untracked(() => this.updateInlineHint());
        });

        this.scrollStrategy = scrollStrategy;
    }

    ngAfterViewInit(): void {
        const autocomplete = this.autocomplete();

        if (autocomplete) {
            autocomplete.keyManager?.change.subscribe(() => {
                const autocompleteValue = this.autocomplete();

                // The host binding that announces the active option is not checked otherwise when this view is OnPush.
                this.changeDetectorRef.markForCheck();

                if (this.panelOpen) {
                    this.scrollActiveOptionIntoView();
                    // Focus returns to the input on every arrow key; it must not drag the scroll with it.
                    this.elementRef.nativeElement.focus({ preventScroll: true });
                    this.updateInlineHint();
                } else if (!this.panelOpen && autocompleteValue.keyManager.activeItem) {
                    autocompleteValue.keyManager.activeItem?.selectViaInteraction();
                }
            });
        }
    }

    ngOnDestroy() {
        this.window.removeEventListener('blur', this.windowBlurHandler);

        this.viewportSubscription.unsubscribe();
        this.componentDestroyed = true;
        this.destroyPanel();
        this.textMirror?.destroy();
        this.closeKeyEventStream.complete();
    }

    /** `View -> model callback called when value changes` */
    onChange: (value: any) => void = () => {};

    /** `View -> model callback called when autocomplete has been touched` */
    onTouched: () => void = () => {};

    /** Opens the autocomplete suggestion panel. */
    open(): void {
        this.attachOverlay();
    }

    closePanel(): void {
        if (!this.overlayAttached) {
            return;
        }

        if (this.panelOpen) {
            // TODO: The 'emit' function requires a mandatory void argument
            this.autocomplete().closed.emit();
        }

        this.stopFollowingCaret();
        this.inlineHintText = '';
        this.textMirror?.hide();

        this.overlayAttached = false;
        this.autocomplete().attached.set(false);

        if (this.overlayRef && this.overlayRef.hasAttached()) {
            this.overlayRef.detach();
            this.closingActionsSubscription.unsubscribe();
        }

        // Note that in some cases this can end up being called after the component is destroyed.
        // Add a check to ensure that we don't try to run change detection on a destroyed view.
        if (!this.componentDestroyed) {
            // We need to trigger change detection manually, because
            // `fromEvent` doesn't seem to do it at the proper time.
            // This ensures that the label is reset when the
            // user clicks outside.
            this.changeDetectorRef.detectChanges();
        }
    }

    /**
     * Updates the position of the autocomplete suggestion panel to ensure that it fits all options
     * within the viewport.
     */
    updatePosition(): void {
        if (this.overlayAttached) {
            this.overlayRef!.updatePosition();
        }
    }

    /**
     * A stream of actions that should close the autocomplete panel, including
     * when an option is selected, on blur, and when TAB is pressed.
     */
    get panelClosingActions(): Observable<KbqOptionSelectionChange | null> {
        return merge(
            this.optionSelections,
            this.autocomplete().keyManager.tabOut.pipe(filter(() => this.overlayAttached)),
            this.closeKeyEventStream,
            this.getOutsideClickStream(),
            this.overlayRef ? this.overlayRef.detachments().pipe(filter(() => this.overlayAttached)) : observableOf()
        ).pipe(
            // Normalize the output so we return a consistent type.
            map((event) => (event instanceof KbqOptionSelectionChange ? event : null))
        );
    }

    // Implemented as part of ControlValueAccessor.
    writeValue(value: any): void {
        Promise.resolve(null).then(() => {
            this.setTriggerValue(value);

            // The text changed without an input event: the query, its options and its hint belong to the old text.
            if (this.textMode()) {
                this.setQuery(null);
                this.closePanel();
            }
        });
    }

    // Implemented as part of ControlValueAccessor.
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    registerOnChange(fn: (value: any) => {}): void {
        this.onChange = fn;
    }

    // Implemented as part of ControlValueAccessor.
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    registerOnTouched(fn: () => {}) {
        this.onTouched = fn;
    }

    // Implemented as part of ControlValueAccessor.
    setDisabledState(isDisabled: boolean) {
        this.elementRef.nativeElement.disabled = isDisabled;
    }

    handleKeydown(event: KeyboardEvent): void {
        const keyCode = event.keyCode;

        // Prevent the default action on all escape key presses. This is here primarily to bring IE
        // in line with other browsers. By default, pressing escape on IE will cause it to revert
        // the input value to the one that it had on focus, however it won't dispatch any events
        // which means that the model value will be out of sync with the view.
        if (keyCode === ESCAPE) {
            event.preventDefault();
        }

        const autocomplete = this.autocomplete();

        // In text mode Shift with an arrow selects text, as in any other text, instead of walking the options.
        if (this.textMode() && event.shiftKey && (keyCode === UP_ARROW || keyCode === DOWN_ARROW)) return;

        if (this.acceptsInlineHint(event)) {
            event.preventDefault();
            this.activeOption!.selectViaInteraction();

            return;
        }

        if (this.activeOption && keyCode === ENTER && this.panelOpen) {
            this.activeOption.selectViaInteraction();
            this.resetActiveItem();
            event.preventDefault();
        } else if (autocomplete) {
            const prevActiveItem = autocomplete.keyManager.activeItem;

            if (this.panelOpen || keyCode === TAB) {
                autocomplete.onKeydown(event);
            } else if (!this.panelOpen && keyCode === DOWN_ARROW && this.canOpen() && !this.textMode()) {
                // In text mode the arrow moves the caret to the next line, as it does in any other text.
                this.open();
            }

            const isArrowKey = keyCode === UP_ARROW || keyCode === DOWN_ARROW;

            if (isArrowKey && event.shiftKey && autocomplete.keyManager.activeItem !== prevActiveItem) {
                autocomplete.keyManager.activeItem?.selectViaInteraction();
            }
        }
    }

    handleInput(event: KeyboardEvent): void {
        const target = event.target as HTMLInputElement;
        let value: number | string | null = target.value;

        // Based on `NumberValueAccessor` from forms.
        if (target.type === 'number') {
            value = value === '' ? null : parseFloat(value);
        }

        // If the input has a placeholder, IE will fire the `input` event on page load,
        // focus and blur, in addition to when the user actually changed the value. To
        // filter out all of the extra events, we save the value on focus and between
        // `input` events, and we check whether it changed.
        // See: https://connect.microsoft.com/IE/feedback/details/885747/
        if (this.previousValue !== value) {
            this.previousValue = value;
            this.onChange(value);

            if (this.textMode()) {
                this.refreshQuery(true);
            } else if (this.canOpen() && _getFocusedElementPierceShadowDom() === target) {
                this.open();
            }
        }
    }

    /**
     * Keeps `openOnFocus` from opening the panel the next time the input is focused. Lets a host that
     * restores focus itself — after clearing, say — do so without the panel springing open.
     *
     * @docs-private
     */
    suppressOpenOnNextFocus(): void {
        this.canOpenOnNextFocus = false;
    }

    handleFocus(): void {
        if (!this.canOpenOnNextFocus) {
            this.canOpenOnNextFocus = true;
        } else if (!this.panelOpen && this.canOpen() && this.autocomplete().openOnFocus()) {
            this.previousValue = this.elementRef.nativeElement.value;

            if (this.textMode()) {
                this.refreshQuery(true);
            } else {
                this.attachOverlay();
            }
        }
    }

    handleClick($event: MouseEvent) {
        if (_getFocusedElementPierceShadowDom() !== $event.target) return;

        if (this.textMode()) {
            this.refreshQuery(true);
        } else if (!this.panelOpen && this.canOpen()) {
            this.open();
        }
    }

    scrollActiveOptionIntoView(): void {
        this.autocomplete().keyManager.activeItem?.focus();
    }

    /** Stream of clicks outside of the autocomplete panel. */
    private getOutsideClickStream(): Observable<any> {
        return merge(
            fromEvent(this.document, 'click') as Observable<MouseEvent>,
            fromEvent(this.document, 'auxclick') as Observable<MouseEvent>,
            fromEvent(this.document, 'touchend') as Observable<TouchEvent>
        ).pipe(
            filter((event) => {
                const clickTarget = _getEventTarget<HTMLElement>(event);
                const formField = this.formField ? this.formField.elementRef.nativeElement : null;
                const connectedTo = this.connectedTo();
                const customOrigin = connectedTo ? connectedTo.elementRef.nativeElement : null;

                return (
                    this.overlayAttached &&
                    clickTarget !== this.elementRef.nativeElement &&
                    (!formField || !formField.contains(clickTarget)) &&
                    (!customOrigin || !customOrigin.contains(clickTarget)) &&
                    !!this.overlayRef &&
                    !this.overlayRef.overlayElement.contains(clickTarget)
                );
            })
        );
    }

    /**
     * Event handler for when the window is blurred. Needs to be an
     * arrow function in order to preserve the context.
     */
    private windowBlurHandler = () => {
        // If the user blurred the window while the autocomplete is focused, it means that it'll be
        // refocused when they come back. In this case we want to skip the first focus event, if the
        // pane was closed, in order to avoid reopening it unintentionally.
        this.canOpenOnNextFocus = this.document.activeElement !== this.elementRef.nativeElement || this.panelOpen;
    };

    /**
     * This method listens to a stream of panel closing actions and resets the
     * stream every time the option list changes.
     */
    private subscribeToClosingActions(): Subscription {
        const firstStable = this.zone.onStable.asObservable().pipe(take(1));
        const optionChanges = this.autocomplete().options.changes.pipe(
            tap(() => this.positionStrategy.reapplyLastPosition()),
            // Defer emitting to the stream until the next tick, because changing
            // bindings in here will cause "changed after checked" errors.
            delay(0)
        );

        // When the zone is stable initially, and when the option list changes...
        return (
            merge(firstStable, optionChanges)
                .pipe(
                    // create a new stream of panelClosingActions, replacing any previous streams
                    // that were created, and flatten it so our stream only emits closing events...
                    switchMap(() => {
                        const wasOpen = this.panelOpen;

                        // Visibility first: the key manager reports the new active option to a handler that selects
                        // it whenever the panel is not open, and a panel whose options arrived after it was attached
                        // is not open until the visibility is updated.
                        this.autocomplete().setVisibility();
                        this.resetActiveItem();
                        // The active option can stay at the same index while the option behind it changes, which
                        // the key manager does not report.
                        this.changeDetectorRef.markForCheck();
                        this.updateInlineHint();

                        if (this.panelOpen) {
                            this.overlayRef!.updatePosition();

                            // If the `panelOpen` state changed, we need to make sure to emit the `opened`
                            // event, because we may not have emitted it when the panel was attached. This
                            // can happen if the users opens the panel and there are no options, but the
                            // options come in slightly later or as a result of the value changing.
                            if (wasOpen !== this.panelOpen) {
                                // TODO: The 'emit' function requires a mandatory void argument
                                this.autocomplete().opened.emit();
                            }
                        }

                        return this.panelClosingActions;
                    }),
                    // when the first closing event occurs...
                    take(1)
                )
                // set the value, close the panel, and complete.
                .subscribe((event) => this.setValueAndClose(event))
        );
    }

    /** Destroys the autocomplete suggestion panel. */
    private destroyPanel(): void {
        if (this.overlayRef) {
            this.closePanel();
            this.overlayRef.dispose();
            this.overlayRef = null;
        }
    }

    private setTriggerValue(value: any): void {
        const autocomplete = this.autocomplete();
        const displayWith = autocomplete?.displayWith();
        // In text mode the value is the text itself, and `displayWith` maps options, not the text around them.
        const toDisplay = displayWith && !this.textMode() ? displayWith(value) : value;

        // Simply falling back to an empty string if the display value is falsy does not work properly.
        // The display value can also be the number zero and shouldn't fall back to an empty string.

        const inputValue = toDisplay != null ? toDisplay : '';

        // If it's used within a `MatFormField`, we should set it through the property so it can go
        // through change detection.
        if (this.formField) {
            this.formField.control().value = inputValue;
        } else {
            this.elementRef.nativeElement.value = inputValue;
        }

        this.previousValue = inputValue;
    }

    /** This method closes the panel, and if a value is specified, also sets the associated
     * control to that value. It will also mark the control as dirty if this interaction
     * stemmed from the user.
     */
    private setValueAndClose(event: KbqOptionSelectionChange | null): void {
        if (event?.source) {
            this.clearPreviousSelectedOption(event.source);

            if (this.textMode()) {
                this.insertOption(event.source);
            } else {
                this.setTriggerValue(event.source.value);
                this.onChange(event.source.value);
            }

            this.elementRef.nativeElement.focus();

            this.autocomplete().emitSelectEvent(event.source);
        }

        this.closePanel();
    }

    /** Clear any previous selected option and emit a selection change event for this option */
    private clearPreviousSelectedOption(skip: KbqOption) {
        this.autocomplete().options.forEach((option) => {
            if (option !== skip && option.selected) {
                option.deselect();
            }
        });
    }

    private attachOverlay(): void {
        const autocomplete = this.autocomplete();

        if (!autocomplete) {
            throw getKbqAutocompleteMissingPanelError();
        }

        let overlayRef = this.overlayRef;

        if (!overlayRef) {
            this.portal = new TemplatePortal(autocomplete.template(), this.viewContainerRef);
            overlayRef = this.overlay.create(this.getOverlayConfig());
            this.overlayRef = overlayRef;

            // Use the `keydownEvents` in order to take advantage of
            // the overlay event targeting provided by the CDK overlay.
            overlayRef.keydownEvents().subscribe((event) => {
                // Close when pressing ESCAPE or ALT + UP_ARROW, based on the a11y guidelines.
                // See: https://www.w3.org/TR/wai-aria-practices-1.1/#textbox-keyboard-interaction
                if (event.keyCode === ESCAPE || (event.keyCode === UP_ARROW && event.altKey)) {
                    this.resetActiveItem();
                    this.closeKeyEventStream.next();
                }
            });

            if (this.viewportRuler) {
                this.viewportSubscription = this.viewportRuler.change().subscribe(() => {
                    if (this.panelOpen && overlayRef) {
                        overlayRef.updateSize(this.getOverlaySize());
                    }
                });
            }
        } else {
            const position = overlayRef.getConfig().positionStrategy as FlexibleConnectedPositionStrategy;

            // Update the trigger, panel width and direction, in case anything has changed.
            position.setOrigin(this.getPositionOrigin()).withPositions(this.getPanelPositions());
            overlayRef.updateSize(this.getOverlaySize());
        }

        if (overlayRef && !overlayRef.hasAttached()) {
            overlayRef.attach(this.portal);
            this.closingActionsSubscription = this.subscribeToClosingActions();
            this.startFollowingCaret();
        }

        const wasOpen = this.panelOpen;

        autocomplete.listboxName.set(this.getListboxName());
        autocomplete.setVisibility();
        this.overlayAttached = true;
        autocomplete.attached.set(true);

        // We need to do an extra `panelOpen` check in here, because the
        // autocomplete won't be shown if there are no options.
        if (this.panelOpen && wasOpen !== this.panelOpen) {
            // TODO: The 'emit' function requires a mandatory void argument
            autocomplete.opened.emit();
        }

        this.zone.onStable
            .asObservable()
            .pipe(take(1))
            .subscribe(() => {
                this.resetActiveItem();

                // Overlay width may not be final on first open, so re-measure when the layout is stable.
                if (this.panelOpen && this.overlayRef) {
                    this.overlayRef.updateSize(this.getOverlaySize());
                }
            });
    }

    private getOverlayConfig(): OverlayConfig {
        return new OverlayConfig({
            positionStrategy: this.getOverlayPosition(),
            scrollStrategy: this.scrollStrategy(),
            direction: this.dir,
            ...this.getOverlaySize()
        });
    }

    private getOverlayPosition(): PositionStrategy {
        this.positionStrategy = this.overlay
            .position()
            .flexibleConnectedTo(this.getPositionOrigin())
            .withFlexibleDimensions(false)
            .withPush(false)
            // CDK measures the pane before the trigger↔panel gap padding (kbq-connected-overlay-gap) is
            // applied, so a position can be judged "fits" without accounting for that extra space. Giving
            // it a margin at least as big as the gap (defaultOffsetY) keeps the fit check conservative
            // enough to absorb the padding that lands afterwards.
            .withViewportMargin(defaultOffsetY)
            .withPositions(this.getPanelPositions());

        return this.positionStrategy;
    }

    private getConnectedElement(): ElementRef<HTMLElement> {
        const connectedTo = this.connectedTo();

        if (connectedTo) {
            return connectedTo.elementRef;
        }

        return this.formField ? this.formField.getConnectedOverlayOrigin() : this.elementRef;
    }

    /**
     * Positions of the panel, below and then above its origin, starting where the origin starts. A panel opened from
     * the caret may also end at the caret: nothing else holds it on screen when the caret is near the right edge.
     */
    private getPanelPositions(): ConnectedPosition[] {
        const below: ConnectedPosition = {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top',
            panelClass: KBQ_CONNECTED_OVERLAY_BELOW_CLASS
        };
        const above: ConnectedPosition = {
            originX: 'start',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'bottom',
            panelClass: KBQ_CONNECTED_OVERLAY_ABOVE_CLASS
        };

        return this.relativeToCaret()
            ? [below, above, { ...below, overlayX: 'end' }, { ...above, overlayX: 'end' }]
            : [below, above];
    }

    /** What the panel is positioned against: the caret when anchored to the caret, otherwise the field. */
    private getPositionOrigin(): FlexibleConnectedPositionStrategyOrigin {
        return this.relativeToCaret() ? this.caretOrigin : this.getConnectedElement();
    }

    /** The caret's line, or the field when the caret cannot be located. */
    private measureCaretOrigin(): KbqCaretRect {
        const caret = kbqGetCaretRect(this.elementRef.nativeElement);

        if (caret) return caret;

        const { left, top, width, height } = this.getConnectedElement().nativeElement.getBoundingClientRect();

        return { x: left, y: top, width, height };
    }

    private getOverlaySize(): KbqResolvedPanelWidth {
        const autocomplete = this.autocomplete();

        // A caret has no width to match, and a panel opened from it is meant to be only as wide as its options.
        if (this.relativeToCaret()) {
            return kbqResolvePanelWidth(autocomplete.panelWidth(), 0, 0);
        }

        return kbqResolvePanelWidth(autocomplete.panelWidth(), autocomplete.panelMinWidth(), this.getHostWidth());
    }

    private getHostWidth(): number {
        return kbqGetPanelWidthOrigin(this.getConnectedElement());
    }

    /**
     * Name of the option list, taken from what names the field, in the order its own name is computed:
     * `aria-labelledby`, `aria-label`, its labels, `title`, the placeholder.
     */
    private getListboxName(): { labelledby: string | null; label: string | null } {
        const element = this.elementRef.nativeElement;
        const ariaLabelledby = element.getAttribute('aria-labelledby')?.trim();

        if (ariaLabelledby) return { labelledby: ariaLabelledby, label: null };

        const ariaLabel = element.getAttribute('aria-label')?.trim();

        if (ariaLabel) return { labelledby: null, label: ariaLabel };

        const labels = Array.from(element.labels ?? []);

        // Labels are referenced when every one of them can be; a label without an id, which a plain `<label for>` or
        // a wrapping label may be, lends its text instead.
        if (labels.length && labels.every(({ id }) => id)) {
            return { labelledby: labels.map(({ id }) => id).join(' '), label: null };
        }

        const labelText = labels
            .map(({ textContent }) => textContent?.trim())
            .filter(Boolean)
            .join(' ');

        return { labelledby: null, label: labelText || element.title || element.placeholder || null };
    }

    /**
     * Resets the active item to -1 so arrow events will activate the
     * correct options, or to 0 if the consumer opted into it.
     */
    private resetActiveItem(): void {
        const autocomplete = this.autocomplete();

        if (autocomplete.autoActiveFirstOption()) {
            autocomplete.keyManager.setFirstItemActive();
        } else {
            autocomplete.keyManager.setActiveItem(-1);
        }
    }

    /**
     * Re-reads the query at the caret in text mode and closes the panel once there is none. `open` lets a query open
     * the panel: typing, focusing and clicking do, moving the caret through the text does not.
     */
    private refreshQuery(open: boolean): void {
        const query = this.readQuery();

        this.setQuery(query);

        if (!query) {
            this.closePanel();

            return;
        }

        if (
            open &&
            !this.overlayAttached &&
            this.canOpen() &&
            _getFocusedElementPierceShadowDom() === this.elementRef.nativeElement
        ) {
            this.attachOverlay();
        }

        this.updateInlineHint();
    }

    /** Query at the caret, or `null` when there is none — including while text is selected, which is no caret. */
    private readQuery(): KbqTextQuery | null {
        const { selectionStart, selectionEnd, value } = this.elementRef.nativeElement;

        if (selectionStart === null || selectionStart !== selectionEnd) return null;

        return kbqGetTextQuery(value, selectionStart, {
            triggers: this.queryTriggers(),
            minLength: this.queryMinLength()
        });
    }

    /** Stores the query and reports it when it differs from the stored one. */
    private setQuery(query: KbqTextQuery | null): void {
        const previous = this.query;

        this.query = query;

        if (
            query?.text !== previous?.text ||
            query?.trigger !== previous?.trigger ||
            query?.start !== previous?.start
        ) {
            this.queryChange.emit(query);
        }
    }

    /**
     * Follows the caret while the panel is open, outside the zone and at most once per attach: text mode re-reads the
     * query, and a caret-anchored panel is positioned again, which measures the caret anew.
     */
    private startFollowingCaret(): void {
        if (this.stopCaretListeners || !(this.relativeToCaret() || this.textMode())) return;

        this.zone.runOutsideAngular(() => {
            this.stopCaretListeners = kbqListenForCaretMoves(this.renderer, this.elementRef.nativeElement, () => {
                if (this.textMode()) {
                    this.zone.run(() => this.refreshQuery(false));
                }

                if (this.relativeToCaret() && this.overlayAttached) {
                    this.overlayRef?.updatePosition();
                }
            });
        });
    }

    private stopFollowingCaret(): void {
        this.stopCaretListeners?.();
        this.stopCaretListeners = null;
    }

    /**
     * Replaces the query at the caret, trigger included, with the option, and puts the caret right after it. Without a
     * query — the panel was opened with `open()`, or text is selected — the option goes in at the caret, over the
     * selection. The query is read from the field again: the text may have changed since it was last read.
     *
     * `setRangeText` dispatches no `input`, and `KbqTextarea` grows on that event, so it is dispatched by hand — with
     * `previousValue` already updated, so that `handleInput` does not take it for the user typing a new query.
     */
    private insertOption(option: KbqOption): void {
        const element = this.elementRef.nativeElement;
        const text = this.getOptionText(option);
        const { selectionStart, selectionEnd } = element;

        if (selectionStart === null || selectionEnd === null) {
            // A field without a text selection, such as an `email` input, has no position to insert at.
            this.setTriggerValue(text);
        } else {
            const query = this.readQuery();

            element.setRangeText(text, query?.start ?? selectionStart, query?.end ?? selectionEnd, 'end');
        }

        this.setQuery(null);
        this.previousValue = element.value;
        this.onChange(element.value);
        // Selection state means nothing for an option that was inserted into the text, and a selected option would
        // look chosen the next time the panel opens.
        option.deselect(false);
        // The panel closes right after; following the caret into the inserted text would read it as a new query.
        this.stopFollowingCaret();
        element.dispatchEvent(new Event('input', { bubbles: true }));
    }

    /** Text the option puts into the field. */
    private getOptionText(option: KbqOption): string {
        const displayWith = this.autocomplete().displayWith();
        const text = displayWith ? displayWith(option.value) : option.value;

        return text != null ? `${text}` : '';
    }

    /**
     * Whether `event` accepts the inline hint. The hint is checked against the field again first: the text can change
     * without an input event, and a hint drawn for the old text would write the option into the new one.
     */
    private acceptsInlineHint(event: KeyboardEvent): boolean {
        if (!this.inlineHintText || hasModifierKey(event) || (event.keyCode !== TAB && event.keyCode !== RIGHT_ARROW)) {
            return false;
        }

        this.refreshQuery(false);

        return !!this.inlineHintText;
    }

    /** Draws the rest of the active option after the caret, or hides the hint when there is none to draw. */
    private updateInlineHint(): void {
        const hint = this.resolveInlineHint();

        this.inlineHintText = hint;

        if (!hint) {
            this.textMirror?.hide();

            return;
        }

        const element = this.elementRef.nativeElement;
        const { value } = element;
        const caret = this.query!.end;

        this.textMirror ??= kbqCreateTextMirror(element, INLINE_HINT_CLASS);

        // A hint the field would lay out elsewhere, or outside the part of the field in view, is not a hint to accept.
        if (!this.textMirror.update(value.slice(0, caret), hint, value.slice(caret))) {
            this.inlineHintText = '';
        }
    }

    /**
     * Rest of the active option to draw after the caret, or `''`. A hint is only drawn where accepting it produces the
     * text drawn: the option has to continue the text it replaces, and nothing may follow the caret on its line, where
     * the hint would be drawn over it.
     */
    private resolveInlineHint(): string {
        const query = this.query;
        const option = this.activeOption;

        if (
            !this.textMode() ||
            !this.inlineHint() ||
            this.autocompleteDisabled() ||
            !this.formField ||
            !query ||
            !option ||
            !this.panelOpen
        ) {
            return '';
        }

        const element = this.elementRef.nativeElement;
        const { value } = element;
        const nextCharacter = value.charAt(query.end);

        if (
            (nextCharacter && nextCharacter !== '\n') ||
            !kbqIsTextLaidOutFromStart(this.window.getComputedStyle(element))
        ) {
            return '';
        }

        const text = this.getOptionText(option);
        const replaced = value.slice(query.start, query.end);

        return text.toLocaleLowerCase().startsWith(replaced.toLocaleLowerCase()) ? text.slice(replaced.length) : '';
    }

    private canOpen(): boolean {
        const element = this.elementRef.nativeElement;

        return !element.readOnly && !element.disabled && !this.autocompleteDisabled();
    }
}

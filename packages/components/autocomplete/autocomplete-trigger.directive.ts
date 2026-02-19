import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    ConnectedPosition,
    FlexibleConnectedPositionStrategy,
    Overlay,
    OverlayConfig,
    OverlayRef,
    PositionStrategy,
    ScrollStrategy
} from '@angular/cdk/overlay';
import { _getEventTarget } from '@angular/cdk/platform';
import { TemplatePortal } from '@angular/cdk/portal';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { DOCUMENT } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Directive,
    ElementRef,
    Host,
    Inject,
    InjectionToken,
    Input,
    NgZone,
    OnDestroy,
    Optional,
    Provider,
    ViewContainerRef,
    afterNextRender,
    forwardRef,
    inject
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DOWN_ARROW, ENTER, ESCAPE, TAB, UP_ARROW } from '@koobiq/cdk/keycodes';
import {
    KBQ_WINDOW,
    KbqOption,
    KbqOptionSelectionChange,
    KeyboardNavigationHandler,
    defaultOffsetY
} from '@koobiq/components/core';
import { KbqFormField } from '@koobiq/components/form-field';
import { Observable, Subject, Subscription, defer, fromEvent, merge, of as observableOf } from 'rxjs';
import { delay, filter, map, switchMap, take, tap } from 'rxjs/operators';
import { KbqAutocompleteOrigin } from './autocomplete-origin.directive';
import { KbqAutocomplete } from './autocomplete.component';

/**
 * The following style constants are necessary to save here in order
 * to properly calculate the scrollTop of the panel. Because we are not
 * actually focusing the active item, scroll must be handled manually.
 */

/** The total height of the autocomplete panel. */
export const AUTOCOMPLETE_PANEL_HEIGHT = 256;

/** Injection token that determines the scroll handling while the autocomplete panel is open. */
export const KBQ_AUTOCOMPLETE_SCROLL_STRATEGY = new InjectionToken<() => ScrollStrategy>(
    'kbq-autocomplete-scroll-strategy'
);

export function KBQ_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY(overlay: Overlay): () => ScrollStrategy {
    return () => overlay.scrollStrategies.reposition();
}

export const KBQ_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER = {
    provide: KBQ_AUTOCOMPLETE_SCROLL_STRATEGY,
    deps: [Overlay],
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

/**
 * Creates an error to be thrown when attempting to use an autocomplete trigger without a panel.
 * @docs-private
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
    host: {
        class: 'kbq-autocomplete-trigger',
        '[attr.autocomplete]': 'autocompleteAttribute',
        // Note: we use `focusin`, as opposed to `focus`, in order to open the panel
        // a little earlier. This avoids issues where IE delays the focusing of the input.
        '(focusin)': 'handleFocus()',
        '(blur)': 'onTouched()',
        '(input)': 'handleInput($event)',
        '(keydown)': 'handleKeydown($event)',
        '(click)': 'handleClick($event)'
    },
    exportAs: 'kbqAutocompleteTrigger',
    providers: [KBQ_AUTOCOMPLETE_VALUE_ACCESSOR]
})
export class KbqAutocompleteTrigger
    implements AfterViewInit, ControlValueAccessor, OnDestroy, KeyboardNavigationHandler
{
    protected readonly document = inject<Document>(DOCUMENT);

    readonly optionSelections: Observable<KbqOptionSelectionChange> = defer(() => {
        if (this.autocomplete && this.autocomplete.options) {
            return merge(...this.autocomplete.options.map((option) => option.onSelectionChange));
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
        return this.autocomplete?.keyManager?.activeItem;
    }

    get panelOpen(): boolean {
        return this.overlayAttached && this.autocomplete.showPanel;
    }

    /** The autocomplete panel to be attached to this trigger. */
    @Input('kbqAutocomplete') autocomplete: KbqAutocomplete;

    /**
     * Reference relative to which to position the autocomplete panel.
     * Defaults to the autocomplete trigger element.
     */
    @Input('kbqAutocompleteConnectedTo') connectedTo: KbqAutocompleteOrigin;

    /**
     * `autocomplete` attribute to be set on the input element.
     * @docs-private
     */
    @Input('autocomplete') autocompleteAttribute: string = 'off';

    /**
     * Whether the autocomplete is disabled. When disabled, the element will
     * act as a regular input and the user won't be able to open the panel.
     */
    @Input('kbqAutocompleteDisabled')
    get autocompleteDisabled(): boolean {
        return this._autocompleteDisabled;
    }

    set autocompleteDisabled(value: boolean) {
        this._autocompleteDisabled = coerceBooleanProperty(value);
    }

    /**
     * Event handler for input blur events.
     * Determines whether the blur event is triggered outside the specific target
     * @returns A boolean indicating if the blur event happened outside the target element
     */
    @Input('kbqAutocompleteOnBlur') onInputBlur = (event: FocusEvent): boolean => {
        const target: HTMLElement = event.relatedTarget as HTMLElement;

        return !target || target.tagName !== 'KBQ-OPTION';
    };

    private _autocompleteDisabled = false;

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

    constructor(
        private elementRef: ElementRef<HTMLInputElement>,
        private viewContainerRef: ViewContainerRef,
        private changeDetectorRef: ChangeDetectorRef,
        private overlay: Overlay,
        private zone: NgZone,
        @Inject(KBQ_AUTOCOMPLETE_SCROLL_STRATEGY) scrollStrategy: any,
        @Optional() private dir: Directionality,
        @Optional() @Host() private formField: KbqFormField,
        // @breaking-change 8.0.0 Make `_viewportRuler` required.
        private viewportRuler?: ViewportRuler
    ) {
        afterNextRender(() => {
            zone.runOutsideAngular(() => this.window.addEventListener('blur', this.windowBlurHandler));
        });

        this.scrollStrategy = scrollStrategy;
    }

    ngAfterViewInit(): void {
        if (this.autocomplete) {
            this.autocomplete.keyManager?.change.subscribe(() => {
                if (this.panelOpen) {
                    this.scrollActiveOptionIntoView();
                    this.elementRef.nativeElement.focus();
                } else if (!this.panelOpen && this.autocomplete.keyManager.activeItem) {
                    this.autocomplete.keyManager.activeItem?.selectViaInteraction();
                }
            });
        }
    }

    ngOnDestroy() {
        this.window.removeEventListener('blur', this.windowBlurHandler);

        this.viewportSubscription.unsubscribe();
        this.componentDestroyed = true;
        this.destroyPanel();
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

    /**
     * @deprecated Will be removed in next major release. Use `open` instead.
     * @docs-private
     */
    openPanel(): void {
        this.open();
    }

    closePanel(): void {
        if (!this.overlayAttached) {
            return;
        }

        if (this.panelOpen) {
            this.autocomplete.closed.emit();
        }

        this.autocomplete.isOpen = this.overlayAttached = false;

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
            this.autocomplete.keyManager.tabOut.pipe(filter(() => this.overlayAttached)),
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
        Promise.resolve(null).then(() => this.setTriggerValue(value));
    }

    // Implemented as part of ControlValueAccessor.
    // eslint-disable-next-line @typescript-eslint/ban-types
    registerOnChange(fn: (value: any) => {}): void {
        this.onChange = fn;
    }

    // Implemented as part of ControlValueAccessor.
    // eslint-disable-next-line @typescript-eslint/ban-types
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

        if (this.activeOption && keyCode === ENTER && this.panelOpen) {
            this.activeOption.selectViaInteraction();
            this.resetActiveItem();
            event.preventDefault();
        } else if (this.autocomplete) {
            const prevActiveItem = this.autocomplete.keyManager.activeItem;

            if (this.panelOpen || keyCode === TAB) {
                this.autocomplete.onKeydown(event);
            } else if (!this.panelOpen && keyCode === DOWN_ARROW && this.canOpen()) {
                this.openPanel();
            }

            const isArrowKey = keyCode === UP_ARROW || keyCode === DOWN_ARROW;

            if (isArrowKey && event.shiftKey && this.autocomplete.keyManager.activeItem !== prevActiveItem) {
                this.autocomplete.keyManager.activeItem?.selectViaInteraction();
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

            if (this.canOpen() && this.document.activeElement === event.target) {
                this.openPanel();
            }
        }
    }

    handleFocus(): void {
        if (!this.canOpenOnNextFocus) {
            this.canOpenOnNextFocus = true;
        } else if (!this.panelOpen && this.canOpen() && this.autocomplete.openOnFocus) {
            this.previousValue = this.elementRef.nativeElement.value;
            this.attachOverlay();
        }
    }

    handleClick($event: MouseEvent) {
        if (!this.panelOpen && this.canOpen() && this.document.activeElement === $event.target) {
            this.openPanel();
        }
    }

    scrollActiveOptionIntoView(): void {
        this.autocomplete.keyManager.activeItem?.focus();
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
                const customOrigin = this.connectedTo ? this.connectedTo.elementRef.nativeElement : null;

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
        const optionChanges = this.autocomplete.options.changes.pipe(
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

                        this.resetActiveItem();
                        this.autocomplete.setVisibility();

                        if (this.panelOpen) {
                            this.overlayRef!.updatePosition();

                            // If the `panelOpen` state changed, we need to make sure to emit the `opened`
                            // event, because we may not have emitted it when the panel was attached. This
                            // can happen if the users opens the panel and there are no options, but the
                            // options come in slightly later or as a result of the value changing.
                            if (wasOpen !== this.panelOpen) {
                                this.autocomplete.opened.emit();
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
        const toDisplay =
            this.autocomplete && this.autocomplete.displayWith ? this.autocomplete.displayWith(value) : value;

        // Simply falling back to an empty string if the display value is falsy does not work properly.
        // The display value can also be the number zero and shouldn't fall back to an empty string.

        const inputValue = toDisplay != null ? toDisplay : '';

        // If it's used within a `MatFormField`, we should set it through the property so it can go
        // through change detection.
        if (this.formField) {
            this.formField.control.value = inputValue;
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
            this.setTriggerValue(event.source.value);
            this.onChange(event.source.value);
            this.elementRef.nativeElement.focus();

            this.autocomplete.emitSelectEvent(event.source);
        }

        this.closePanel();
    }

    /** Clear any previous selected option and emit a selection change event for this option */
    private clearPreviousSelectedOption(skip: KbqOption) {
        this.autocomplete.options.forEach((option) => {
            if (option !== skip && option.selected) {
                option.deselect();
            }
        });
    }

    private attachOverlay(): void {
        if (!this.autocomplete) {
            throw getKbqAutocompleteMissingPanelError();
        }

        let overlayRef = this.overlayRef;

        if (!overlayRef) {
            this.portal = new TemplatePortal(this.autocomplete.template, this.viewContainerRef);
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
                        overlayRef.updateSize({ width: this.getPanelWidth() });
                    }
                });
            }
        } else {
            const position = overlayRef.getConfig().positionStrategy as FlexibleConnectedPositionStrategy;

            // Update the trigger, panel width and direction, in case anything has changed.
            position.setOrigin(this.getConnectedElement());
            overlayRef.updateSize({ width: this.getPanelWidth() });
        }

        if (overlayRef && !overlayRef.hasAttached()) {
            overlayRef.attach(this.portal);
            this.closingActionsSubscription = this.subscribeToClosingActions();
        }

        const wasOpen = this.panelOpen;

        this.autocomplete.setVisibility();
        this.autocomplete.isOpen = this.overlayAttached = true;

        // We need to do an extra `panelOpen` check in here, because the
        // autocomplete won't be shown if there are no options.
        if (this.panelOpen && wasOpen !== this.panelOpen) {
            this.autocomplete.opened.emit();
        }

        this.zone.onStable
            .asObservable()
            .pipe(take(1))
            .subscribe(() => this.resetActiveItem());
    }

    private getOverlayConfig(): OverlayConfig {
        return new OverlayConfig({
            positionStrategy: this.getOverlayPosition(),
            scrollStrategy: this.scrollStrategy(),
            width: this.getPanelWidth(),
            direction: this.dir
        });
    }

    private getOverlayPosition(): PositionStrategy {
        this.positionStrategy = this.overlay
            .position()
            .flexibleConnectedTo(this.getConnectedElement())
            .withFlexibleDimensions(false)
            .withPush(false)
            .withPositions([
                {
                    originX: 'start',
                    originY: 'bottom',
                    overlayX: 'start',
                    overlayY: 'top',
                    offsetY: defaultOffsetY
                },
                {
                    originX: 'start',
                    originY: 'top',
                    overlayX: 'start',
                    overlayY: 'bottom',
                    offsetY: -defaultOffsetY
                }
            ] as ConnectedPosition[]);

        return this.positionStrategy;
    }

    private getConnectedElement(): ElementRef<HTMLElement> {
        if (this.connectedTo) {
            return this.connectedTo.elementRef;
        }

        return this.formField ? this.formField.getConnectedOverlayOrigin() : this.elementRef;
    }

    private getPanelWidth(): number | string {
        return this.autocomplete.panelWidth || this.getHostWidth();
    }

    private getHostWidth(): number {
        return this.getConnectedElement().nativeElement.getBoundingClientRect().width;
    }

    /**
     * Resets the active item to -1 so arrow events will activate the
     * correct options, or to 0 if the consumer opted into it.
     */
    private resetActiveItem(): void {
        if (this.autocomplete.autoActiveFirstOption) {
            this.autocomplete.keyManager.setFirstItemActive();
        } else {
            this.autocomplete.keyManager.setActiveItem(-1);
        }
    }

    private canOpen(): boolean {
        const element = this.elementRef.nativeElement;

        return !element.readOnly && !element.disabled && !this._autocompleteDisabled;
    }
}

import { FocusKeyManager, FocusMonitor } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import { ENTER, SPACE } from '@angular/cdk/keycodes';
import {
    AfterContentInit,
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    computed,
    contentChildren,
    effect,
    ElementRef,
    forwardRef,
    inject,
    Injector,
    input,
    isDevMode,
    numberAttribute,
    OnDestroy,
    output,
    untracked,
    ViewEncapsulation
} from '@angular/core';
import { Subject } from 'rxjs';
import { KbqAccordionItem } from './accordion-item';
import { KBQ_ACCORDION_STATE_STORE, KbqAccordionState } from './accordion-state-store';

/** Available visual variants of the accordion. */
export type KbqAccordionVariant = 'fill' | 'hug' | 'hugSpaceBetween';

/** Determines whether one or multiple items can be expanded at the same time. */
export type KbqAccordionType = 'single' | 'multiple';

/** The layout orientation of the accordion. */
export type KbqAccordionOrientation = 'horizontal' | 'vertical';

let uniqueIdCounter: number = 0;

@Component({
    selector: 'kbq-accordion, [kbq-accordion]',
    template: '<ng-content />',
    styleUrls: ['accordion.scss', 'accordion-tokens.scss'],
    providers: [
        { provide: UniqueSelectionDispatcher, useClass: UniqueSelectionDispatcher }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-accordion',
        '[attr.data-orientation]': 'orientation()',
        '(keydown)': 'keydownHandler($event)'
    }
})
export class KbqAccordion implements OnDestroy, AfterViewInit, AfterContentInit {
    /** @docs-private */
    protected readonly focusMonitor = inject(FocusMonitor);
    /** @docs-private */
    protected readonly elementRef = inject(ElementRef);
    /** @docs-private */
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);
    /** @docs-private */
    protected readonly selectionDispatcher = inject(UniqueSelectionDispatcher);
    /** @docs-private */
    protected readonly dir = inject(Directionality, { optional: true });

    private readonly injector = inject(Injector);
    private readonly stateStore = inject(KBQ_ACCORDION_STATE_STORE);

    /** @docs-private */
    protected keyManager: FocusKeyManager<KbqAccordionItem>;

    /** Emits every time `openAll()` or `closeAll()` is called. @docs-private */
    readonly openCloseAllActions = new Subject<boolean>();

    /** The accordion items projected into this accordion. @docs-private */
    readonly items = contentChildren(
        forwardRef(() => KbqAccordionItem),
        { descendants: true }
    );

    /** Whether the accordion persists the expanded state of its items across reloads. Defaults to `false`. */
    readonly useStateSaving = input(false, { transform: booleanAttribute });

    /**
     * A stable, consumer-provided key used to persist state when `useStateSaving` is enabled.
     * Strongly recommended: without it the accordion falls back to an auto-generated,
     * instantiation-order-dependent id that is unreliable under lazy/conditional/reordered rendering.
     */
    readonly stateSavingKey = input<string>('');

    /** The visual variant of the accordion. Defaults to `fill`. */
    readonly variant = input<KbqAccordionVariant>('fill');

    /** Whether the whole accordion is disabled. */
    readonly disabled = input<boolean, unknown>(undefined!, { transform: booleanAttribute });

    /** The layout orientation of the accordion. Defaults to `vertical`. */
    readonly orientation = input<KbqAccordionOrientation>('vertical');

    /**
     * The `aria-level` applied to the item headings. Defaults to `2`.
     * Set it to match the surrounding document outline (e.g. `3` when nested under an `<h2>` section).
     */
    readonly level = input(2, { transform: numberAttribute });

    /**
     * The value of the item(s) to expand when initially rendered.
     * Use when you do not need to control the state of the items.
     */
    readonly defaultValue = input<string[] | string>([]);

    /** Determines whether one or multiple items can be expanded at the same time. */
    readonly type = input<KbqAccordionType>('single');

    /** Whether an expanded item can be collapsed by the user. Defaults to `true`. */
    readonly collapsible = input(true);

    /**
     * The raw controlled `value` input. Must stay `public`: a `protected` input cannot be bound from
     * a consumer template (TS2445 under full AOT template type-checking).
     * @docs-private
     */
    // `input()` (not `model()`): a `model()` would auto-create a colliding `valueChange` output.
    readonly valueInput = input<string[] | string | undefined>(undefined, { alias: 'value' });

    /**
     * The controlled value of the item(s) to expand, reshaped by mode. Supports `[(value)]`.
     * Falls back to `defaultValue` while `value` is unbound.
     *
     * Always an array in `multiple` mode and always a string in `single` mode — an empty string
     * when nothing is expanded, matching what `valueChange` emits.
     */
    readonly value = computed<string[] | string>(() => {
        const value = this.valueInput() ?? this.defaultValue();

        const array = Array.isArray(value) ? value : [value];

        return this.isMultiple ? array : (array[0] ?? '');
    });

    /** Emits the current value whenever the expanded state of the accordion changes. */
    readonly valueChange = output<string[] | string>();

    /** The unique id of this accordion. */
    get id(): string {
        return this._id;
    }

    /** Whether multiple items can be expanded at the same time. */
    get isMultiple(): boolean {
        return this.type() === 'multiple';
    }

    /** Whether a persisted state exists for this accordion. */
    get hasSavedState(): boolean {
        return typeof this.state === 'object' && this.state !== null;
    }

    /** `defaultValue` normalized to an array for internal coordination. */
    private readonly defaultValueArray = computed(() => {
        const value = this.defaultValue();

        return Array.isArray(value) ? value : [value];
    });

    private _id = `kbq-accordion-${uniqueIdCounter++}`;

    private state: KbqAccordionState | null = null;

    constructor() {
        // Re-emit `valueChange` whenever any (current or future) item toggles its expanded state.
        // Reading `items()` inside the effect keeps the subscriptions in sync with dynamically
        // added/removed items.
        effect((onCleanup) => {
            const subscriptions = this.items().map((item) =>
                item.expandedChange.subscribe(() => this.valueChange.emit(this.getCurrentValue()))
            );

            onCleanup(() => subscriptions.forEach((subscription) => subscription.unsubscribe()));
        });

        // Notify the selection dispatcher when the controlled `[value]` changes (the old setter's
        // side-effect). The `undefined` sentinel keeps the mandatory first run a no-op when unbound;
        // when bound it re-notifies the value `ngAfterContentInit` already sent (idempotent).
        effect(() => {
            const value = this.valueInput();

            if (value === undefined) return;

            untracked(() => this.selectionDispatcher.notify(this.value() as unknown as string, this.id));
        });
    }

    ngAfterContentInit(): void {
        if (this.useStateSaving()) {
            if (isDevMode() && !this.stateSavingKey()) {
                // eslint-disable-next-line no-console
                console.warn(
                    'KbqAccordion: `useStateSaving` is enabled without a `stateSavingKey`. Falling back to an ' +
                        'auto-generated id, which is unreliable across lazy/conditional/reordered rendering. ' +
                        'Provide a stable `stateSavingKey`.'
                );
            }

            this.state = this.stateStore.getState(this.stateStorageKey);
        }

        if (this.valueInput() !== undefined) {
            this.selectionDispatcher.notify(this.value() as unknown as string, this.id);
        } else if (this.useStateSaving() && this.hasSavedState) {
            const expandedValues = Object.keys(this.state!)
                .filter((key) => this.state![key].expanded)
                .map((key) => this.state![key].value);

            if (expandedValues.length) {
                this.selectionDispatcher.notify(
                    (this.isMultiple ? expandedValues : expandedValues[0]) as unknown as string,
                    this.id
                );
            }
        } else {
            this.selectionDispatcher.notify(this.defaultValueArray() as unknown as string, this.id);
        }

        // Seed initial state for any items missing from the store (without overwriting existing entries).
        if (this.useStateSaving()) {
            this.items().forEach((item) => this.saveItemState(item, false));
        }

        this.keyManager = new FocusKeyManager(this.items, this.injector).withHomeAndEnd();

        if (this.orientation() === 'horizontal') {
            this.keyManager.withHorizontalOrientation(this.dir?.value || 'ltr');
        } else {
            this.keyManager.withVerticalOrientation();
        }
    }

    ngAfterViewInit(): void {
        this.focusMonitor.monitor(this.elementRef, true);
    }

    ngOnDestroy(): void {
        this.focusMonitor.stopMonitoring(this.elementRef);
        this.openCloseAllActions.complete();
        this.keyManager?.destroy();
    }

    /** @docs-private */
    keydownHandler(event: KeyboardEvent) {
        if (!this.keyManager) return;

        if (!this.keyManager.activeItem) {
            this.keyManager.setFirstItemActive();
        }

        const activeItem = this.keyManager.activeItem;

        if (
            (event.keyCode === ENTER || event.keyCode === SPACE) &&
            !this.keyManager.isTyping() &&
            activeItem &&
            !activeItem.disabled
        ) {
            event.preventDefault();
            activeItem.toggle();
        } else {
            // Arrow/Home/End move between headers; Tab falls through natively (WAI-ARIA APG pattern).
            this.keyManager.onKeydown(event);
        }
    }

    /** Opens all enabled accordion items in an accordion where `type` is `multiple`. */
    openAll(): void {
        if (this.isMultiple) {
            this.openCloseAllActions.next(true);
        }
    }

    /** Closes all enabled accordion items. */
    closeAll(): void {
        this.openCloseAllActions.next(false);
    }

    /** @docs-private */
    setActiveItem(item: KbqAccordionItem) {
        this.keyManager?.setActiveItem(item);
    }

    /**
     * Persists the current state of the given item when `useStateSaving` is enabled.
     * @docs-private
     */
    saveItemState(item: KbqAccordionItem, force: boolean = true): void {
        if (!this.useStateSaving()) return;
        if (!force && this.state?.[item.id]) return;

        this.state = this.state ?? {};
        this.state[item.id] = item.getState();

        this.stateStore.setState(this.stateStorageKey, this.state);
    }

    /** The current expanded value(s) derived from the live item state. */
    private getCurrentValue(): string[] | string {
        const expandedValues = this.items()
            .filter((item) => item.expanded)
            .map((item) => item.value());

        return this.isMultiple ? expandedValues : (expandedValues[0] ?? '');
    }

    /** The key used to persist/restore state. */
    private get stateStorageKey(): string {
        return this.stateSavingKey() || this.id;
    }
}

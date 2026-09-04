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
    numberAttribute,
    OnDestroy,
    output,
    Signal,
    untracked,
    ViewEncapsulation
} from '@angular/core';
import { kbqStateSaving } from '@koobiq/components/core';
import { Subject } from 'rxjs';
import { KbqAccordionItem } from './accordion-item';

/** Available visual variants of the accordion. */
export type KbqAccordionVariant = 'fill' | 'hug' | 'hugSpaceBetween';

/** Determines whether one or multiple items can be expanded at the same time. */
export type KbqAccordionType = 'single' | 'multiple';

/** The layout orientation of the accordion. */
export type KbqAccordionOrientation = 'horizontal' | 'vertical';

/**
 * The persisted state of an accordion — the values of the items that were expanded.
 * Mirrors `KbqAccordion.value` normalized to an array.
 */
export type KbqAccordionState = string[];

let uniqueIdCounter: number = 0;

/** Normalizes a value input to an array, dropping the empty string that stands for "nothing expanded". */
const toValueArray = (value: string[] | string): string[] => (Array.isArray(value) ? value : [value]).filter(Boolean);

/** Whether two value sets hold the same values, regardless of order. */
const sameValues = (a: string[], b: string[]): boolean =>
    a.length === b.length && a.every((value) => b.includes(value));

/**
 * Coerces a raw persisted payload into a `KbqAccordionState`, returning `null` for anything
 * unrecognizable. Web storage is origin-wide and user-writable, so a payload is never trusted —
 * without this, an entry such as `{"a": null}` would crash the accordion while restoring.
 *
 * Also upgrades the previous `{ [itemId]: { expanded, value } }` format, so state persisted by an
 * earlier version is carried over instead of silently resetting.
 */
const normalizeAccordionState = (parsed: unknown): KbqAccordionState | null => {
    if (Array.isArray(parsed)) {
        const values = parsed.filter((value): value is string => typeof value === 'string');

        // An array that held nothing usable is somebody else's payload, not "nothing was expanded" — the
        // difference matters, because a state that exists suppresses `defaultValue` from then on.
        return values.length || !parsed.length ? values : null;
    }

    if (parsed !== null && typeof parsed === 'object') {
        const snapshots = Object.values(parsed as Record<string, unknown>).filter(
            (snapshot): snapshot is { expanded: boolean; value: string } => {
                const { expanded, value } = (snapshot ?? {}) as { expanded?: unknown; value?: unknown };

                return typeof expanded === 'boolean' && typeof value === 'string';
            }
        );

        // Same reasoning as above: only an object that actually holds snapshots is the previous format.
        return snapshots.length ? snapshots.filter(({ expanded }) => expanded).map(({ value }) => value) : null;
    }

    return null;
};

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
        '[attr.data-orientation]': 'orientation()'
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

    /** @docs-private */
    protected keyManager: FocusKeyManager<KbqAccordionItem>;

    /** Emits every time `openAll()` or `closeAll()` is called. @docs-private */
    readonly openCloseAllActions = new Subject<boolean>();

    /**
     * Every item the content query matches, including those of a nested accordion.
     * Use `items` instead — this one is the raw, unfiltered query.
     * @docs-private
     */
    // The generic is explicit because `forwardRef` erases the locator type, which would leave both
    // this query and `items` as `Signal<any[]>` in the public API report.
    protected readonly allItems: Signal<readonly KbqAccordionItem[]> = contentChildren(
        forwardRef(() => KbqAccordionItem),
        { descendants: true }
    );

    /**
     * The accordion items that belong to this accordion.
     *
     * A descendant content query resolves against the template the tag is authored in and does not
     * stop at a nested component of the same type, so `allItems` of an outer accordion also matches
     * the items of an accordion rendered inside an item's content. Each item's own `accordion` is
     * injected and therefore always its nearest one, which makes ownership the reliable filter.
     * Without it the key manager would move focus into the nested accordion's headers, `valueChange`
     * would report a nested item's value and state saving would persist it under the outer key.
     * @docs-private
     */
    readonly items: Signal<readonly KbqAccordionItem[]> = computed(() =>
        this.allItems().filter((item) => item.accordion === this)
    );

    /**
     * Whether the accordion persists the expanded state of its items across reloads. Defaults to `true`.
     *
     * `defaultValue` then applies to the first visit only — from the second one on, what the user left
     * open wins. Set it to `false` for an accordion whose initial state the application owns.
     */
    readonly useStateSaving = input(true, { transform: booleanAttribute });

    /**
     * The key the state is persisted under. While it is empty the key is derived from where the
     * accordion sits in the document, which moves when the surrounding markup is restructured — an `id`
     * on the accordion or any ancestor pins it just as well as this input does.
     */
    readonly stateSavingKey = input<string>('');

    // Declared after the inputs it reads: field initializers run in order.
    private readonly stateSaving = kbqStateSaving<KbqAccordionState>({
        name: 'KbqAccordion',
        enabled: this.useStateSaving,
        key: this.stateSavingKey,
        normalize: normalizeAccordionState
    });

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
        const array = this.valueArray();

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

    /**
     * Whether state is currently persisted for this accordion — restored on init, or written since.
     * Always `false` while `useStateSaving` is unset, and `false` again after `clearSavedState()`.
     */
    get hasSavedState(): boolean {
        return this.stateSaving.state !== null;
    }

    /**
     * `value()` as an array, reshaped by mode — the shape the selection dispatcher is notified with.
     * Falls back to `defaultValue` while `value` is unbound, so it doubles as the uncontrolled default.
     */
    private readonly valueArray = computed(() => {
        const array = toValueArray(this.valueInput() ?? this.defaultValue());

        return this.isMultiple ? array : array.slice(0, 1);
    });

    private _id = `kbq-accordion-${uniqueIdCounter++}`;

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

            untracked(() => this.notifySelection(this.valueArray()));
        });
    }

    ngAfterContentInit(): void {
        const savedState = this.stateSaving.read();

        this.stateSaving.applying(() => this.notifySelection(this.initialValue(savedState)));

        // Reconcile the store with what was actually applied: this drops values whose item no longer exists
        // and collapses a `single` accordion that was persisted with several items expanded. When the two
        // already agree — an ordinary load — nothing is written.
        //
        // Only when there is an item set to reconcile against. An accordion whose sections arrive later
        // (`@if`, `@for` over an async list) has none here, and reconciling would delete the saved values
        // before the sections that own them exist. Restoring is one-shot, so those sections are not
        // expanded when they do arrive — but their state survives for the next load.
        if (savedState !== null && this.items().length > 0 && !sameValues(savedState, this.expandedValues())) {
            this.saveState();
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

    /**
     * Handles a key pressed on an item's trigger.
     *
     * Invoked by `KbqAccordionTriggerDirective`, not bound on the accordion host: a root listener
     * also receives keys bubbling from the section content and from controls placed next to the
     * trigger, and would swallow their Enter/Space and hijack their arrow keys. It would also
     * activate the first item — stealing focus — the first time any key was pressed anywhere inside.
     * @docs-private
     */
    keydownHandler(event: KeyboardEvent) {
        const activeItem = this.keyManager?.activeItem;

        if (!activeItem) return;

        if (
            (event.keyCode === ENTER || event.keyCode === SPACE) &&
            !this.keyManager.isTyping() &&
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
     * Persists the values of the currently expanded items when `useStateSaving` is enabled.
     * @docs-private
     */
    saveState(): void {
        // Both checked before the snapshot is built: this runs on every item toggle, and `expandedValues()`
        // walks the content query — wasted work for an accordion that persists nothing. A controlled
        // `[value]` is one of those: the expanded set belongs to the application and always wins over the
        // persisted state, so writing it would only overwrite the user's own with something never read back.
        if (!this.useStateSaving() || this.valueInput() !== undefined) return;

        this.stateSaving.write(this.expandedValues());
    }

    /**
     * Removes the state persisted for this accordion.
     *
     * Persistence itself stays on — the next change is written again. Unset `useStateSaving` to stop it.
     */
    clearSavedState(): void {
        this.stateSaving.clear();
    }

    /**
     * The values to expand on first render: a controlled `value` wins, then the persisted state, then
     * `defaultValue`. Always an array, because only the array payload can also *close* the items that
     * are not part of it — a scalar cannot express an empty selection at all.
     */
    private initialValue(savedState: KbqAccordionState | null): string[] {
        // `valueArray()` already resolves the controlled value and falls back to `defaultValue`.
        if (this.valueInput() !== undefined || savedState === null) return this.valueArray();

        return this.isMultiple ? savedState : savedState.slice(0, 1);
    }

    /** The values of the items that are currently expanded. */
    private expandedValues(): string[] {
        return this.items()
            .filter((item) => item.expanded)
            .map((item) => item.value());
    }

    /** The current expanded value(s) derived from the live item state. */
    private getCurrentValue(): string[] | string {
        const expandedValues = this.expandedValues();

        return this.isMultiple ? expandedValues : (expandedValues[0] ?? '');
    }

    /**
     * Notifies the items of the whole expanded set.
     *
     * `UniqueSelectionDispatcher` types its payload as a `string`, which only an individual item toggle
     * ever is — the accordion always sends the full set, the only shape that also closes the items
     * outside it. The cast lives here alone so the rest of the component keeps working with the real type.
     */
    private notifySelection(values: string[]): void {
        this.selectionDispatcher.notify(values as unknown as string, this.id);
    }
}

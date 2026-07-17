import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import {
    booleanAttribute,
    ChangeDetectorRef,
    computed,
    contentChild,
    Directive,
    forwardRef,
    inject,
    input,
    Input,
    OnDestroy,
    output
} from '@angular/core';
import { Subscription } from 'rxjs';
import { KbqAccordion, KbqAccordionOrientation } from './accordion';
import { KbqAccordionContentDirective } from './accordion-content.directive';
import type { KbqAccordionItemSnapshot } from './accordion-state-store';
import { KbqAccordionTrigger } from './accordion-trigger';
import { KbqAccordionTriggerDirective } from './accordion-trigger.directive';

let uniqueIdCounter: number = 0;

export type KbqAccordionItemState = 'open' | 'closed';

@Directive({
    selector: 'kbq-accordion-item, [kbq-accordion-item]',
    host: {
        class: 'kbq-accordion-item',
        '[attr.data-state]': 'dataState',
        '[attr.data-disabled]': 'disabled',
        '[attr.data-orientation]': 'orientation'
    }
})
export class KbqAccordionItem implements OnDestroy {
    /** @docs-private */
    protected readonly accordion = inject(KbqAccordion);
    /** @docs-private */
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);
    /** @docs-private */
    protected readonly expansionDispatcher = inject(UniqueSelectionDispatcher);

    /** @docs-private */
    readonly trigger = contentChild(KbqAccordionTriggerDirective);
    /** @docs-private */
    readonly triggerComponent = contentChild(KbqAccordionTrigger);

    /** @docs-private */
    readonly content = contentChild(forwardRef(() => KbqAccordionContentDirective));

    /** The unique AccordionItem id. */
    get id(): string {
        return this._id;
    }

    private _id = `kbq-accordion-item-${uniqueIdCounter++}`;

    /** The current open/closed state of the item. @docs-private */
    get dataState(): KbqAccordionItemState {
        return this.expanded ? 'open' : 'closed';
    }

    /** The layout orientation inherited from the parent accordion. @docs-private */
    get orientation(): KbqAccordionOrientation {
        return this.accordion.orientation();
    }

    /** Whether the AccordionItem is expanded. */
    // Kept as an `@Input` accessor (not `model()`): the setter runs a synchronous side-effect
    // cascade (emits opened/closed/expandedChange, notifies the selection dispatcher, toggles the
    // content and persists state) that sibling items rely on within the same change-detection tick.
    @Input({ transform: booleanAttribute })
    get expanded(): boolean {
        return this._expanded;
    }

    set expanded(expanded: boolean) {
        // Only emit events and update the internal value if the value changes.
        if (this._expanded !== expanded) {
            this._expanded = expanded;
            this.expandedChange.emit(expanded);

            if (expanded) {
                // TODO: The 'emit' function requires a mandatory void argument
                this.opened.emit();
                /**
                 * In the unique selection dispatcher, the id parameter is the id of the KbqAccordionItem,
                 * the name value is the id of the accordion.
                 */
                this.expansionDispatcher.notify(this.value(), this.accordion.id);
            } else {
                // TODO: The 'emit' function requires a mandatory void argument
                this.closed.emit();
            }

            this.content()?.toggle();

            this.accordion.saveItemState(this);

            // Ensures that the animation will run when the value is set outside of an `@Input`.
            // This includes cases like the open, close and toggle methods.
            this.changeDetectorRef.markForCheck();
        }
    }

    private _expanded = false;

    /** The item's own `value` input. @docs-private */
    protected readonly valueInput = input<string>('', { alias: 'value' });

    /** The item's effective value — its own value, or the item id when none is provided. */
    readonly value = computed(() => this.valueInput() || this.id);

    /** Whether the AccordionItem is disabled. */
    // Kept as an `@Input` accessor (not a signal): `KbqAccordionItem` is a `FocusKeyManager` option,
    // and `ListKeyManagerOption.disabled` (core/a11y/key-manager) is read as a plain `boolean` — a
    // signal function is always truthy, which makes the key manager treat every item as disabled.
    // The getter also merges the item's own state with the parent accordion's (an effective value).
    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        return this.accordion.disabled() || this._disabled;
    }

    set disabled(value: boolean) {
        this._disabled = value;
    }

    private _disabled = false;

    /** Event emitted every time the AccordionItem is closed. */
    readonly closed = output<void>();
    /** Event emitted every time the AccordionItem is opened. */
    readonly opened = output<void>();

    /**
     * Emits whenever the expanded state of the accordion item changes.
     * Primarily used to facilitate two-way binding.
     * @docs-private
     */
    readonly expandedChange = output<boolean>();

    /** Unregister function for expansionDispatcher. */
    private removeUniqueSelectionListener: () => void;

    /** Subscription to openAll/closeAll events. */
    private openCloseAllSubscription = Subscription.EMPTY;

    constructor() {
        this.removeUniqueSelectionListener = this.expansionDispatcher.listen((id: string, accordionId: string) => {
            if (this.accordion.id !== accordionId) return;

            // The dispatcher payload is a single value (individual toggle / single-mode value) or an
            // array (controlled `[value]`, default value and restored state). Match exactly to avoid
            // substring collisions (e.g. `item-10` must not open `item-1`).
            const value = id as unknown as string | string[];

            const ownValue = this.value();

            if (Array.isArray(value)) {
                // Sync to array membership: opens members, closes non-members.
                this.expanded = value.includes(ownValue);
            } else if (this.accordion.isMultiple) {
                // Individual toggle in multiple mode: only the matching item opens; others stay independent.
                if (value === ownValue) {
                    this.expanded = true;
                }
            } else {
                // Individual toggle / controlled value in single mode: exactly one item stays open.
                this.expanded = value === ownValue;
            }
        });

        // When an accordion item is hosted in an accordion, subscribe to open/close events.
        this.openCloseAllSubscription = this.subscribeToOpenCloseAllActions();
    }

    ngOnDestroy() {
        this.removeUniqueSelectionListener();
        this.openCloseAllSubscription.unsubscribe();
    }

    /** Moves focus to the item's trigger. */
    focus(): void {
        this.trigger()?.focus();
    }

    /** Toggles the expanded state of the accordion item. */
    toggle(): void {
        if (!this.disabled) {
            this.expanded = !this.expanded;
        }
    }

    /** Sets the expanded state of the accordion item to false. */
    close(): void {
        if (!this.disabled) {
            this.expanded = false;
        }
    }

    /** Sets the expanded state of the accordion item to true. */
    open(): void {
        if (!this.disabled) {
            this.expanded = true;
        }
    }

    /** Returns a snapshot of the item's current persisted state. @docs-private */
    getState(): KbqAccordionItemSnapshot {
        return {
            expanded: this.expanded,
            value: this.value()
        };
    }

    /** Disables the open/close animation of the item's content and chevron. @docs-private */
    disableAnimation() {
        this.content()?.disableAnimation();
        this.triggerComponent()?.disableAnimation();
    }

    /** Restores the open/close animation of the item's content and chevron. @docs-private */
    enableAnimation() {
        this.content()?.enableAnimation();
        this.triggerComponent()?.enableAnimation();
    }

    private subscribeToOpenCloseAllActions(): Subscription {
        return this.accordion.openCloseAllActions.subscribe((expanded) => {
            // Only change expanded state if item is enabled
            if (!this.disabled) {
                this.expanded = expanded;
            }
        });
    }
}

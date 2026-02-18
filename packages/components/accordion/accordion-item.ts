import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import {
    booleanAttribute,
    ChangeDetectorRef,
    ContentChild,
    Directive,
    EventEmitter,
    forwardRef,
    inject,
    Input,
    OnDestroy,
    Output
} from '@angular/core';
import { Subscription } from 'rxjs';
import { KbqAccordionContentDirective } from './accordion-content.directive';
import { KbqAccordionTriggerDirective } from './accordion-trigger.directive';
import { KbqAccordion, KbqAccordionOrientation } from './accordion.component';
import { KbqAccordionTrigger } from './accordion-trigger.component';

let uniqueIdCounter: number = 0;

/** @deprecated Use KbqAccordionItemState instead. */
export type RdxAccordionItemState = 'open' | 'closed';

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
    @ContentChild(KbqAccordionTriggerDirective, { descendants: true }) trigger: KbqAccordionTriggerDirective;
    /** @docs-private */
    @ContentChild(KbqAccordionTrigger, { descendants: true }) triggerComponent: KbqAccordionTrigger;

    /** @docs-private */
    @ContentChild(forwardRef(() => KbqAccordionContentDirective), { descendants: true })
    content: KbqAccordionContentDirective;

    /** The unique AccordionItem id. */
    get id(): string {
        return this._id;
    }

    private _id = `kbq-accordion-item-${uniqueIdCounter++}`;

    get dataState(): KbqAccordionItemState {
        return this.expanded ? 'open' : 'closed';
    }

    get orientation(): KbqAccordionOrientation {
        return this.accordion.orientation;
    }

    /** Whether the AccordionItem is expanded. */
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
                this.opened.emit();
                /**
                 * In the unique selection dispatcher, the id parameter is the id of the CdkAccordionItem,
                 * the name value is the id of the accordion.
                 */
                const accordionId = this.accordion ? this.accordion.id : this.value;

                this.expansionDispatcher.notify(this.value, accordionId);
            } else {
                this.closed.emit();
            }

            this.content.toggle();

            this.accordion.saveItemState(this);

            // Ensures that the animation will run when the value is set outside of an `@Input`.
            // This includes cases like the open, close and toggle methods.
            this.changeDetectorRef.markForCheck();
        }
    }

    private _expanded = false;

    @Input()
    set value(value: string) {
        this._value = value;
    }

    get value(): string {
        return this._value || this.id;
    }

    private _value?: string;

    /** Whether the AccordionItem is disabled. */
    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        return this.accordion.disabled ?? this._disabled;
    }

    set disabled(value: boolean) {
        this._disabled = value;
    }

    private _disabled = false;

    /** Event emitted every time the AccordionItem is closed. */
    @Output() readonly closed: EventEmitter<void> = new EventEmitter<void>();
    /** Event emitted every time the AccordionItem is opened. */
    @Output() readonly opened: EventEmitter<void> = new EventEmitter<void>();

    /**
     * Event emitted when the AccordionItem is destroyed.
     * @docs-private
     */
    readonly destroyed: EventEmitter<void> = new EventEmitter<void>();

    /**
     * Emits whenever the expanded state of the accordion changes.
     * Primarily used to facilitate two-way binding.
     * @docs-private
     */
    @Output() readonly expandedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    /** Unregister function for expansionDispatcher. */
    private removeUniqueSelectionListener: () => void;

    /** Subscription to openAll/closeAll events. */
    private openCloseAllSubscription = Subscription.EMPTY;

    constructor() {
        this.removeUniqueSelectionListener = this.expansionDispatcher.listen((id: string, accordionId: string) => {
            if (this.accordion.isMultiple) {
                if (this.accordion.id === accordionId && id.includes(this.value)) {
                    this.expanded = true;
                }
            } else {
                this.expanded = this.accordion.id === accordionId && id.includes(this.value);
            }
        });

        // When an accordion item is hosted in an accordion, subscribe to open/close events.
        if (this.accordion) {
            this.openCloseAllSubscription = this.subscribeToOpenCloseAllActions();
        }

        this.accordion.saveItemState(this, false);
    }

    /** Emits an event for the accordion item being destroyed. */
    ngOnDestroy() {
        this.opened.complete();
        this.closed.complete();
        this.destroyed.emit();
        this.destroyed.complete();
        this.removeUniqueSelectionListener();
        this.openCloseAllSubscription.unsubscribe();
    }

    focus(): void {
        this.trigger.focus();
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

    getState(): any {
        return {
            expanded: this.expanded,
            value: this.value
        };
    }

    disableAnimation() {
        this.content.disableAnimation();
        this.triggerComponent.disableAnimation();
    }

    enableAnimation() {
        this.content.enableAnimation();
        this.triggerComponent.enableAnimation();
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

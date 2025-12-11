import { FocusKeyManager, FocusMonitor } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import { ENTER, SPACE, TAB } from '@angular/cdk/keycodes';
import {
    AfterContentInit,
    afterNextRender,
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    forwardRef,
    inject,
    Input,
    OnDestroy,
    Output,
    QueryList,
    ViewEncapsulation
} from '@angular/core';
import { KBQ_WINDOW } from '@koobiq/components/core';
import { merge, Subject, Subscription } from 'rxjs';
import { KbqAccordionItem } from './accordion-item';

export enum KbqAccordionVariant {
    fill = 'fill',
    hug = 'hug',
    hugSpaceBetween = 'hugSpaceBetween'
}

export type KbqAccordionType = 'single' | 'multiple';
export type KbqAccordionOrientation = 'horizontal' | 'vertical';

let uniqueIdCounter: number = 0;

interface KbqAccordionState {
    [itemId: string]: {
        expanded: boolean;
    };
}

@Component({
    selector: 'kbq-accordion, [kbq-accordion]',
    template: '<ng-content />',
    styleUrls: ['accordion.component.scss', 'accordion-tokens.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'kbq-accordion',
        '[attr.data-orientation]': 'orientation',
        '(keydown)': 'handleKeydown($event)'
    },
    providers: [
        { provide: UniqueSelectionDispatcher, useClass: UniqueSelectionDispatcher }]
})
export class KbqAccordion implements OnDestroy, AfterViewInit, AfterContentInit {
    private readonly localStorage = inject(KBQ_WINDOW)?.localStorage;

    protected readonly focusMonitor = inject(FocusMonitor);
    protected readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    @Input() variant: KbqAccordionVariant | string = KbqAccordionVariant.fill;

    public state: KbqAccordionState = {};

    get id(): string {
        return this._id;
    }

    private _id = `kbq-accordion-${uniqueIdCounter++}`;

    constructor() {
        this.getState();

        afterNextRender({
            write: () => {
                console.log('kbq-accordion afterNextRender write: ');
                console.log('state: ', this.state);
            },
            read: () => {
                console.log('kbq-accordion afterNextRender read: ');
            }
        });
    }

    /** @docs-private */
    protected readonly selectionDispatcher = inject(UniqueSelectionDispatcher);
    /** @docs-private */
    protected readonly dir = inject(Directionality, { optional: true });
    /** @docs-private */
    protected keyManager: FocusKeyManager<KbqAccordionItem>;
    /** @docs-private */
    readonly openCloseAllActions = new Subject<boolean>();

    get isMultiple(): boolean {
        return this.type === 'multiple';
    }

    /** Whether the Accordion is disabled. */
    @Input({ transform: booleanAttribute }) disabled: boolean;

    /** The orientation of the accordion. */
    @Input() orientation: KbqAccordionOrientation = 'vertical';
    /**  @docs-private */
    @ContentChildren(forwardRef(() => KbqAccordionItem), { descendants: true })
    items: QueryList<KbqAccordionItem>;

    /**
     * The value of the item to expand when initially rendered and type is "single". Use when you do not need to control the state of the items.
     */
    @Input()
    set defaultValue(value: string[] | string) {
        if (value !== this._defaultValue) {
            this._defaultValue = Array.isArray(value) ? value : [value];
        }
    }

    get defaultValue(): string[] | string {
        return this.isMultiple ? this._defaultValue : this._defaultValue[0];
    }

    /**
     * Determines whether one or multiple items can be opened at the same time.
     */
    @Input() type: KbqAccordionType = 'single';
    /** @docs-private */
    @Input() collapsible = true;
    /** The controlled value of the item to expand */
    @Input()
    set value(value: string[] | string) {
        if (value !== this._value) {
            this._value = Array.isArray(value) ? value : [value];

            this.selectionDispatcher.notify(this.value as unknown as string, this.id);
        }
    }

    get value(): string[] | string {
        if (this._value === undefined) {
            return this.defaultValue;
        }

        return this.isMultiple ? this._value : this._value[0];
    }

    @Output() readonly onValueChange: EventEmitter<void> = new EventEmitter<void>();

    private _value?: string[];
    private _defaultValue: string[] | string = [];

    private onValueChangeSubscription: Subscription;

    ngAfterContentInit(): void {
        this.selectionDispatcher.notify((this._value ?? this._defaultValue) as unknown as string, this.id);

        this.keyManager = new FocusKeyManager(this.items).withHomeAndEnd();

        if (this.orientation === 'horizontal') {
            this.keyManager.withHorizontalOrientation(this.dir?.value || 'ltr');
        } else {
            this.keyManager.withVerticalOrientation();
        }

        this.onValueChangeSubscription = merge(...this.items.map((item) => item.expandedChange)).subscribe(() =>
            this.onValueChange.emit()
        );
    }

    ngAfterViewInit(): void {
        this.focusMonitor.monitor(this.elementRef, true);
    }

    ngOnDestroy(): void {
        this.focusMonitor.stopMonitoring(this.elementRef);
        this.openCloseAllActions.complete();
        this.onValueChangeSubscription.unsubscribe();
    }

    /** @docs-private */
    handleKeydown(event: KeyboardEvent) {
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
        } else if (event.keyCode === TAB && event.shiftKey) {
            if (this.keyManager.activeItemIndex === 0) return;

            this.keyManager.setPreviousItemActive();
            event.preventDefault();
        } else if (event.keyCode === TAB) {
            if (this.keyManager.activeItemIndex === this.items.length - 1) return;

            this.keyManager.setNextItemActive();
            event.preventDefault();
        } else {
            this.keyManager.onKeydown(event);
        }
    }

    /** Opens all enabled accordion items in an accordion where multi is enabled.
     * @docs-private
     */
    openAll(): void {
        if (this.isMultiple) {
            this.openCloseAllActions.next(true);
        }
    }

    /** Closes all enabled accordion items.
     * @docs-private
     */
    closeAll(): void {
        this.openCloseAllActions.next(false);
    }

    /** @docs-private */
    setActiveItem(item: KbqAccordionItem) {
        this.keyManager.setActiveItem(item);
    }

    saveItemState(id: string, item: KbqAccordionItem) {
        // console.log(`saveItemState for ${id}: `, item);

        this.state[id] = item.getState();

        this.localStorage.setItem(this.id, JSON.stringify(this.state));
    }

    private getState() {
        this.state = JSON.parse(this.localStorage.getItem(this.id) as string);

        if (this.state) {
            console.log('state exist: ');
        } else {
            this.state = {};
            console.log('state dont exist, need create: ');
        }
    }
}

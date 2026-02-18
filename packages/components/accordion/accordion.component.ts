import { FocusKeyManager, FocusMonitor } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import { ENTER, SPACE, TAB } from '@angular/cdk/keycodes';
import {
    AfterContentInit,
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    forwardRef,
    HostAttributeToken,
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
import { Platform } from '@angular/cdk/platform';

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
        value: string;
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
        '(keydown)': 'keydownHandler($event)'
    },
    providers: [
        { provide: UniqueSelectionDispatcher, useClass: UniqueSelectionDispatcher }]
})
export class KbqAccordion implements OnDestroy, AfterViewInit, AfterContentInit {
    private readonly isBrowser = inject(Platform).isBrowser;
    private readonly localStorage = inject(KBQ_WINDOW)?.localStorage;
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
    /** @docs-private */
    protected keyManager: FocusKeyManager<KbqAccordionItem>;
    /** @docs-private */
    readonly openCloseAllActions = new Subject<boolean>();

    /**  @docs-private */
    @ContentChildren(forwardRef(() => KbqAccordionItem), { descendants: true })
    items: QueryList<KbqAccordionItem>;

    /** Whether the Accordion is disabled. */
    @Input({ transform: booleanAttribute }) useStateSaving: boolean = false;

    @Input() variant: KbqAccordionVariant | string = KbqAccordionVariant.fill;

    /** Whether the Accordion is disabled. */
    @Input({ transform: booleanAttribute }) disabled: boolean;


    /** The orientation of the accordion. */
    @Input() orientation: KbqAccordionOrientation = 'vertical';

    /**
     * The value of the item to expand when initially rendered and type is "single". Use when you do not need to control the state of the items.
     */
    @Input()
    get defaultValue(): string[] | string {
        return this.isMultiple ? this._defaultValue : this._defaultValue[0];
    }

    set defaultValue(value: string[] | string) {
        if (value !== this._defaultValue) {
            this._defaultValue = Array.isArray(value) ? value : [value];
        }
    }

    /** Determines whether one or multiple items can be opened at the same time. */
    @Input() type: KbqAccordionType = 'single';

    @Input() collapsible = true;

    /** The controlled value of the item to expand */
    @Input()
    get value(): string[] | string {
        if (this._value === undefined) {
            return this.defaultValue;
        }

        return this.isMultiple ? this._value : this._value[0];
    }

    set value(value: string[] | string) {
        if (value !== this._value) {
            this._value = Array.isArray(value) ? value : [value];

            this.selectionDispatcher.notify(this.value as unknown as string, this.id);
        }
    }

    @Output() readonly onValueChange: EventEmitter<void> = new EventEmitter<void>();

    get id(): string {
        return this._id;
    }

    get isMultiple(): boolean {
        return this.type === 'multiple';
    }

    get hasSavedState(): boolean {
        return typeof this.state === 'object' && this.state !== null;
    }

    private _value?: string[];
    private _defaultValue: string[] | string = [];

    private onValueChangeSubscription: Subscription;

    private _id = `kbq-accordion-${uniqueIdCounter++}`;

    private state: KbqAccordionState | null;

    constructor() {
        this.useStateSaving = inject(new HostAttributeToken('useStateSaving'), { optional: true }) !== null;

        if (this.useStateSaving) {
            this.getSavedState();
        }
    }

    ngAfterContentInit(): void {
        if (this._value) {
            this.selectionDispatcher.notify(this._value as unknown as string, this.id);
        } else if (this.useStateSaving && this.hasSavedState) {
            Object.keys(this.state!).forEach((key: string) => {
                if (this.state && this.state[key].expanded) {
                    this.selectionDispatcher.notify(this.state[key].value as unknown as string, this.id);
                }
            })
        } else {
            this.selectionDispatcher.notify(this._defaultValue as string, this.id);
        }

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
    keydownHandler(event: KeyboardEvent) {
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

    /** Opens all enabled accordion items in an accordion where multi is enabled. */
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
        this.keyManager.setActiveItem(item);
    }

    /** @docs-private */
    saveItemState(item: KbqAccordionItem, force: boolean = true): void {
        if (!this.isBrowser || (!force && !!this.state && !!this.state[item.id])) return;

        this.state = this.state || {};

        this.state[item.id] = item.getState();

        this.localStorage.setItem(this.id, JSON.stringify(this.state));
    }

    private getSavedState() {
        if (!this.isBrowser) return;

        this.state = JSON.parse(this.localStorage.getItem(this.id) as string);
    }
}

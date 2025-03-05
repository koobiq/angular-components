import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    computed,
    contentChild,
    contentChildren,
    Directive,
    ElementRef,
    inject,
    input,
    numberAttribute,
    signal,
    TemplateRef,
    viewChild,
    viewChildren
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, merge, skip } from 'rxjs';

/**
 * Template context for the `KbqOverflowItemsResult` directive.
 *
 * @see `KbqOverflowItemsResult`
 */
export type KbqOverflowItemsResultContext = {
    /**
     * Set of hidden item ID's.
     *
     * Example:
     *
     * ```html
     * <ng-template kbqOverflowItemsResult let-hiddenItemIDs>
     *  {{ hiddenItemIDs.size }}
     * </ng-template>
     * ````
     */
    $implicit: ReadonlySet<unknown>;
    /**
     * Set of hidden item ID's.
     *
     * Example:
     *
     * ```html
     * <ng-template kbqOverflowItemsResult let-hiddenItemIDs="hiddenItemIDs">
     *  @if (hiddenItemIDs.has(SOME_ID)) {...}
     * </ng-template>
     * ````
     */
    hiddenItemIDs: ReadonlySet<unknown>;
};

/**
 * Directive for providing `KbqOverflowItemsResultContext` to the `KbqOverflowItems` component.
 *
 * @see `KbqOverflowItemsResultContext`
 */
@Directive({
    standalone: true,
    selector: 'ng-template[kbqOverflowItemsResult]'
})
export class KbqOverflowItemsResult {
    /**
     * TemplateRef for the overflow result.
     *
     * @docs-private
     */
    readonly templateRef = inject<TemplateRef<KbqOverflowItemsResultContext>>(TemplateRef);
}

/**
 * Structure directive for providing items to the `KbqOverflowItems`.
 */
@Directive({
    standalone: true,
    selector: '[kbqOverflowItem]'
})
export class KbqOverflowItem {
    /**
     * Identifier for the item.
     */
    readonly id = input.required({ alias: 'kbqOverflowItem' });

    /**
     * Whether the item is hidden.
     *
     * @docs-private
     */
    hidden: boolean = false;

    /**
     * TemplateRef for the item.
     *
     * @docs-private
     */
    readonly templateRef = inject(TemplateRef);
}

/**
 * Component for automatically hiding elements with dynamic adaptation to the container width.
 */
@Component({
    standalone: true,
    selector: 'kbq-overflow-items',
    imports: [NgTemplateOutlet],
    template: `
        @if (reverseOverflowOrder()) {
            <ng-container [ngTemplateOutlet]="template" />
        }

        @for (item of items(); track item) {
            <div
                class="kbq-overflow-items__item"
                #itemRef
                [attr.aria-hidden]="item.hidden"
                [class.kbq-overflow-items__item_hidden]="item.hidden"
            >
                <ng-container [ngTemplateOutlet]="item.templateRef" />
            </div>
        }

        @if (!reverseOverflowOrder()) {
            <ng-container [ngTemplateOutlet]="template" />
        }

        <ng-template #template>
            <div
                class="kbq-overflow-items__result"
                #resultRef
                [attr.aria-hidden]="resultHidden()"
                [class.kbq-overflow-items__result_hidden]="resultHidden()"
            >
                <ng-container
                    [ngTemplateOutlet]="result()?.templateRef || null"
                    [ngTemplateOutletContext]="resultTemplateContext()"
                />
            </div>
        </ng-template>
    `,
    styleUrl: './overflow-items.scss',
    host: {
        class: 'kbq-overflow-items'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqOverflowItems {
    private readonly itemElementRefs = viewChildren<string, ElementRef<HTMLElement>>('itemRef', { read: ElementRef });

    /**
     * `KbqOverflowItem` directive references.
     *
     * @docs-private
     */
    protected readonly items = contentChildren(KbqOverflowItem);

    /**
     * `KbqOverflowItemsResult` directive reference.
     *
     * @docs-private
     */
    protected readonly result = contentChild(KbqOverflowItemsResult);

    private readonly resultElementRef = viewChild<string, ElementRef<HTMLElement>>('resultRef', { read: ElementRef });

    /**
     * Template context for the `KbqOverflowItemsResult` directive.
     *
     * @docs-private
     */
    protected readonly resultTemplateContext = computed<KbqOverflowItemsResultContext>(() => {
        const hiddenItemIDs = this.hiddenItemIDs();
        return {
            $implicit: hiddenItemIDs,
            hiddenItemIDs: hiddenItemIDs
        };
    });

    private readonly hiddenItemIDs = signal<ReadonlySet<unknown>>(new Set([]));

    /**
     * Whether the overflow result is hidden.
     *
     * @docs-private
     */
    protected readonly resultHidden = computed(() => this.hiddenItemIDs().size === 0);

    /**
     * Whether the overflow order should be reversed.
     * Also changes the position of the `resultTemplateRef`.
     *
     * @default false
     */
    readonly reverseOverflowOrder = input(false, { transform: booleanAttribute });

    /**
     * Debounce time for recalculating items visibility.
     *
     * @default 100
     */
    readonly debounceTime = input(100, { transform: numberAttribute });

    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly resizeObserver = inject(SharedResizeObserver);
    private readonly changeDetectorRef = inject(ChangeDetectorRef);

    constructor() {
        merge(
            toObservable(this.items),
            toObservable(this.reverseOverflowOrder).pipe(skip(1)),
            this.resizeObserver.observe(this.elementRef.nativeElement)
        )
            .pipe(debounceTime(this.debounceTime()), takeUntilDestroyed())
            .subscribe(() => {
                const items = this.items();
                this.updateItemsVisibility(
                    items,
                    this.itemElementRefs(),
                    this.reverseOverflowOrder(),
                    this.resultElementRef(),
                    this.elementRef.nativeElement
                );
                this.hiddenItemIDs.set(new Set(items.filter(this.isHiddenItem).map(({ id }) => id())));
                this.changeDetectorRef.markForCheck();
            });
    }

    /**
     * Updates items visibility, based on the container width and the `reverseOverflowOrder` flag.
     */
    private updateItemsVisibility(
        items: readonly KbqOverflowItem[],
        itemElementRefs: readonly ElementRef<HTMLElement>[],
        reverseOverflowOrder: boolean,
        resultElementRef: ElementRef<HTMLElement> | undefined,
        { offsetWidth: totalWidth }: HTMLElement
    ): void {
        items.forEach((item) => {
            item.hidden = false;
        });
        let itemsWidth = items.reduce((width, _, index) => width + itemElementRefs[index].nativeElement.offsetWidth, 0);
        const startIndex = reverseOverflowOrder ? 0 : items.length - 1;
        const endIndex = reverseOverflowOrder ? items.length : -1;
        const step = reverseOverflowOrder ? 1 : -1;
        const resultWidth = resultElementRef?.nativeElement.offsetWidth || 0;
        for (let index = startIndex; index !== endIndex; index += step) {
            const current = items[index];
            const currentWidth = itemElementRefs[index].nativeElement.offsetWidth;
            const _resultWidth = items.some(this.isHiddenItem) ? resultWidth : 0;
            if (itemsWidth + _resultWidth > totalWidth) {
                current.hidden = true;
                itemsWidth -= currentWidth;
            } else {
                const isEdgeElement = reverseOverflowOrder ? index === 0 : index === items.length - 1;
                const _resultWidth = isEdgeElement ? 0 : resultWidth;
                if (itemsWidth + currentWidth + _resultWidth <= totalWidth) {
                    current.hidden = false;
                    itemsWidth += currentWidth;
                }
            }
        }
    }

    /**
     * Determines if the given item is hidden.
     */
    private isHiddenItem = ({ hidden }: KbqOverflowItem) => hidden;
}

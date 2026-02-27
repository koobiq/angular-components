import { ChangeDetectionStrategy, Component, computed, DebugElement, Provider, signal, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqOverflowItemsModule } from './module';
import { KbqOverflowItem, KbqOverflowItemsResult } from './overflow-items';

const createComponent = <T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({
        imports: [component],
        providers
    });
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

const getOverflowItemDebugElements = (debugElement: DebugElement): DebugElement[] => {
    return debugElement.queryAll(By.directive(KbqOverflowItem));
};

const getOverflowHiddenItems = (debugElement: DebugElement): DebugElement[] => {
    return getOverflowItemDebugElements(debugElement).filter(({ classes }) => classes['kbq-overflow-item-hidden']);
};

const getOverflowVisibleItems = (debugElement: DebugElement): DebugElement[] => {
    return getOverflowItemDebugElements(debugElement).filter(({ classes }) => !classes['kbq-overflow-item-hidden']);
};

const getOverflowItemsResultDebugElement = (debugElement: DebugElement): DebugElement => {
    return debugElement.query(By.directive(KbqOverflowItemsResult));
};

const isOverflowItemsResultVisible = (debugElement: DebugElement): boolean => {
    return !getOverflowItemsResultDebugElement(debugElement).classes['kbq-overflow-item-hidden'];
};

@Component({
    selector: 'overflow-items-test',
    imports: [KbqOverflowItemsModule],
    template: `
        <div
            #kbqOverflowItems="kbqOverflowItems"
            kbqOverflowItems
            [style.width.px]="containerWidth()"
            [style.max-height.px]="containerMaxHeight()"
            [style.padding.px]="containerPadding()"
            [style.justify-content]="justifyContent()"
            [style.box-sizing]="containerBoxSizing()"
            [reverseOverflowOrder]="reverseOverflowOrder()"
            [wrap]="flexWrap()"
        >
            <div kbqOverflowItemsResult [style.width.px]="resultWidth()" [style.flex-shrink]="0">
                and {{ kbqOverflowItems.hiddenItemIDs().size }} more
            </div>
            @for (item of items(); track item.id) {
                <div
                    [kbqOverflowItem]="item.id"
                    [style.width.px]="itemWidth()"
                    [style.flex-shrink]="0"
                    [style.margin-right.px]="itemMarginRight()"
                    [alwaysVisible]="item.alwaysVisible"
                >
                    {{ item.id }}
                </div>
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestOverflowItems {
    readonly reverseOverflowOrder = signal(false);
    readonly items = signal(Array.from({ length: 20 }).map((_, i) => ({ id: `Item${i}`, alwaysVisible: i === 7 })));
    readonly containerBoxSizing = signal<'border-box' | 'content-box'>('border-box');
    readonly containerPadding = signal(0);
    readonly containerWidth = signal(500);
    readonly containerMaxHeight = signal(24);
    readonly itemWidth = signal(50);
    readonly itemMarginRight = signal(0);
    readonly resultWidth = signal(100);
    readonly justifyContent = signal<'start' | 'end'>('start');
    readonly flexWrap = signal<'nowrap' | 'wrap'>('nowrap');
}

@Component({
    selector: 'overflow-items-with-vertical-orientation',
    imports: [KbqOverflowItemsModule],
    template: `
        <div
            #kbqOverflowItems="kbqOverflowItems"
            kbqOverflowItems
            orientation="vertical"
            [style.padding.px]="containerPadding()"
            [style.box-sizing]="containerBoxSizing()"
            [style.height.px]="containerHeight()"
            [style.max-width.px]="containerMaxWidth()"
            [reverseOverflowOrder]="reverseOverflowOrder()"
            [wrap]="flexWrap()"
        >
            @for (item of items(); track item.id) {
                <div
                    [kbqOverflowItem]="item.id"
                    [alwaysVisible]="item.alwaysVisible"
                    [style.height.px]="itemHeight()"
                    [style.width.px]="itemWidth()"
                    [style.flex-shrink]="0"
                    [style.margin-bottom.px]="itemMarginBottom()"
                >
                    {{ item.id }}
                </div>
            }
            <div kbqOverflowItemsResult [style.height.px]="resultHeight()" [style.flex-shrink]="0">
                and {{ kbqOverflowItems.hiddenItemIDs().size }} more
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestOverflowItemsWithVerticalOrientation {
    readonly items = signal(Array.from({ length: 20 }, (_, i) => ({ id: `Item${i}`, alwaysVisible: i === 7 })));
    readonly reverseOverflowOrder = signal(false);
    readonly containerBoxSizing = signal<'border-box' | 'content-box'>('border-box');
    readonly containerPadding = signal(0);
    readonly containerHeight = signal(500);
    readonly containerMaxWidth = signal<number | null>(null);
    readonly itemHeight = signal(50);
    readonly itemWidth = signal<number | null>(null);
    readonly itemMarginBottom = signal(0);
    readonly resultHeight = signal(50);
    readonly flexWrap = signal<'nowrap' | 'wrap'>('nowrap');
}

@Component({
    selector: 'overflow-items-test',
    imports: [KbqOverflowItemsModule],
    template: `
        <div
            #kbqOverflowItemsReverse="kbqOverflowItems"
            kbqOverflowItems
            [reverseOverflowOrder]="reverseOverflowOrder()"
            [style.width.px]="containerWidth()"
        >
            @for (item of items(); track $index) {
                @let isLastHiddenItem = $index === lastHiddenItemIndex();

                <div
                    [kbqOverflowItem]="item"
                    [style.width.px]="itemWidth()"
                    [style.flex-shrink]="0"
                    [order]="isLastHiddenItem ? this.lastItemOrder() : $index"
                >
                    {{ item }}
                </div>
            }
            <div kbqOverflowItemsResult [style.width.px]="resultWidth()" [style.flex-shrink]="0">
                and {{ kbqOverflowItemsReverse.hiddenItemIDs().size }} more
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestOrderedOverflowItems {
    readonly items = signal(Array.from({ length: 20 }, (_, i) => `Item${i}`));
    readonly containerWidth = signal(500);
    readonly itemWidth = signal(50);
    readonly resultWidth = signal(100);
    readonly reverseOverflowOrder = signal(false);
    readonly lastHiddenItemIndex = signal(5);

    protected readonly lastItemOrder = computed(() => (this.reverseOverflowOrder() ? +Infinity : -Infinity));
}

describe('KbqOverflowItems', () => {
    it('should render all items', () => {
        const { debugElement } = createComponent(TestOverflowItems);

        expect(getOverflowItemDebugElements(debugElement).length).toBe(20);
    });

    it('should hide overflown items', async () => {
        const fixture = createComponent(TestOverflowItems);
        const { debugElement } = fixture;

        await fixture.whenStable();

        expect(getOverflowHiddenItems(debugElement).length).toBe(12);
    });

    it('should hide overflown items with container padding', async () => {
        const fixture = createComponent(TestOverflowItems);
        const { debugElement, componentInstance } = fixture;

        componentInstance.containerPadding.set(25);
        await fixture.whenStable();

        expect(getOverflowHiddenItems(debugElement).length).toBe(13);
    });

    it('should hide overflown items with right margin', async () => {
        const fixture = createComponent(TestOverflowItems);
        const { debugElement, componentInstance } = fixture;

        componentInstance.itemMarginRight.set(10);
        await fixture.whenStable();

        expect(getOverflowHiddenItems(debugElement).length).toBe(14);
    });

    describe('wrap', () => {
        it('should render all items if fit in cross axis', async () => {
            const fixture = createComponent(TestOverflowItems);
            const { debugElement, componentInstance } = fixture;
            const itemHeght =
                parseFloat(getComputedStyle(getOverflowItemDebugElements(debugElement)[0].nativeElement).height) || 0;

            componentInstance.flexWrap.set('wrap');
            componentInstance.containerMaxHeight.set(itemHeght * 2);
            fixture.detectChanges();
            await fixture.whenStable();

            expect(getOverflowHiddenItems(debugElement).length).toBe(0);
        });

        it('should hide items if not fit in cross axis', async () => {
            const fixture = createComponent(TestOverflowItems);
            const { debugElement, componentInstance } = fixture;
            const itemMainAxisSize = componentInstance.itemWidth();
            const itemCrossAxisSize =
                parseFloat(getComputedStyle(getOverflowItemDebugElements(debugElement)[0].nativeElement).height) || 0;

            componentInstance.flexWrap.set('wrap');
            componentInstance.containerMaxHeight.set(itemCrossAxisSize * 2);
            componentInstance.itemMarginRight.set(10);
            fixture.detectChanges();
            await fixture.whenStable();

            expect(getOverflowHiddenItems(debugElement).length).toBeTruthy();

            const hiddenItemsCount =
                Math.ceil(componentInstance.resultWidth() / itemMainAxisSize) +
                Math.ceil((componentInstance.items().length * componentInstance.itemMarginRight()) / itemMainAxisSize);

            expect(getOverflowHiddenItems(debugElement).length).toBe(hiddenItemsCount);
        });
    });

    it('should hide overflown items (vertical orientation)', async () => {
        const fixture = createComponent(TestOverflowItemsWithVerticalOrientation);
        const { debugElement } = fixture;

        await fixture.whenStable();

        expect(getOverflowHiddenItems(debugElement).length).toBe(11);
    });

    it('should hide overflown items with container padding (vertical orientation)', async () => {
        const fixture = createComponent(TestOverflowItemsWithVerticalOrientation);
        const { debugElement, componentInstance } = fixture;

        componentInstance.containerPadding.set(25);
        await fixture.whenStable();

        expect(getOverflowHiddenItems(debugElement).length).toBe(12);
    });

    it('should hide overflown items with bottom margin (vertical orientation)', async () => {
        const fixture = createComponent(TestOverflowItemsWithVerticalOrientation);
        const { debugElement, componentInstance } = fixture;

        componentInstance.itemMarginBottom.set(10);
        await fixture.whenStable();

        expect(getOverflowHiddenItems(debugElement).length).toBe(13);
    });

    describe('wrap (vertical orientation)', () => {
        it('should render all items if fit in cross axis', async () => {
            const fixture = createComponent(TestOverflowItemsWithVerticalOrientation);
            const { debugElement, componentInstance } = fixture;

            componentInstance.containerMaxWidth.set(100);
            componentInstance.flexWrap.set('wrap');
            componentInstance.itemWidth.set(componentInstance.containerMaxWidth()! / 2);
            fixture.detectChanges();
            await fixture.whenStable();

            expect(getOverflowHiddenItems(debugElement).length).toBe(0);
        });

        it('should hide items if not fit in cross axis', async () => {
            const fixture = createComponent(TestOverflowItemsWithVerticalOrientation);
            const { debugElement, componentInstance } = fixture;
            const itemMainAxisSize = componentInstance.itemHeight();

            // for te
            componentInstance.containerMaxWidth.set(122);
            componentInstance.flexWrap.set('wrap');
            fixture.detectChanges();
            componentInstance.itemWidth.set(50);
            componentInstance.itemMarginBottom.set(10);
            fixture.detectChanges();
            await fixture.whenStable();

            expect(getOverflowHiddenItems(debugElement).length).toBeTruthy();

            const resultClientWidth = (getOverflowItemsResultDebugElement(debugElement).nativeElement as HTMLDivElement)
                .clientWidth;

            // for testing purposes, itemWidth + resultClientWidth set as containerMaxWidth
            expect(resultClientWidth + componentInstance.itemWidth()!).toBe(componentInstance.containerMaxWidth()!);

            const hiddenItemsCount =
                Math.ceil(componentInstance.resultHeight() / itemMainAxisSize) +
                Math.ceil((componentInstance.items().length * componentInstance.itemMarginBottom()) / itemMainAxisSize);

            expect(getOverflowHiddenItems(debugElement).length).toBe(hiddenItemsCount);
        });
    });

    it('should hide overflown items with justify-content end', async () => {
        const fixture = createComponent(TestOverflowItems);
        const { debugElement, componentInstance } = fixture;

        componentInstance.justifyContent.set('end');
        await fixture.whenStable();

        expect(getOverflowHiddenItems(debugElement).length).toBe(12);
    });

    it('should recalculate hidden items on container width change', async () => {
        const fixture = createComponent(TestOverflowItems);
        const { debugElement, componentInstance } = fixture;

        componentInstance.containerWidth.set(600);
        await fixture.whenStable();

        expect(getOverflowHiddenItems(debugElement).length).toBe(10);
    });

    it('should recalculate hidden items on container width change (vertical orientation)', async () => {
        const fixture = createComponent(TestOverflowItemsWithVerticalOrientation);
        const { debugElement, componentInstance } = fixture;

        componentInstance.containerHeight.set(600);
        await fixture.whenStable();

        expect(getOverflowHiddenItems(debugElement).length).toBe(9);
    });

    it('should recalculate hidden items on container width change with justify-content end', async () => {
        const fixture = createComponent(TestOverflowItems);
        const { debugElement, componentInstance } = fixture;

        componentInstance.justifyContent.set('end');
        componentInstance.containerWidth.set(600);
        await fixture.whenStable();

        expect(getOverflowHiddenItems(debugElement).length).toBe(10);
    });

    it('should recalculate hidden items on `reverseOverflowOrder` attribute change', async () => {
        const fixture = createComponent(TestOverflowItems);
        const { debugElement, componentInstance } = fixture;

        componentInstance.reverseOverflowOrder.set(true);
        await fixture.whenStable();

        expect(getOverflowVisibleItems(debugElement).at(-1)!.nativeElement.textContent.trim()).toBe('Item19');
    });

    it('should recalculate hidden items on `reverseOverflowOrder` attribute change (vertical orientation)', async () => {
        const fixture = createComponent(TestOverflowItems);
        const { debugElement, componentInstance } = fixture;

        componentInstance.reverseOverflowOrder.set(true);
        await fixture.whenStable();

        expect(getOverflowVisibleItems(debugElement).at(-1)!.nativeElement.textContent.trim()).toBe('Item19');
    });

    it('should recalculate hidden items on `reverseOverflowOrder` attribute change with justify-content end', async () => {
        const fixture = createComponent(TestOverflowItems);
        const { debugElement, componentInstance } = fixture;

        componentInstance.justifyContent.set('end');
        componentInstance.reverseOverflowOrder.set(true);
        await fixture.whenStable();

        expect(getOverflowVisibleItems(debugElement).at(-1)!.nativeElement.textContent.trim()).toBe('Item19');
    });

    it('should render result', () => {
        const { debugElement } = createComponent(TestOverflowItems);

        expect(getOverflowItemsResultDebugElement(debugElement).nativeElement).toBeInstanceOf(HTMLDivElement);
    });

    it('should display result', async () => {
        const fixture = createComponent(TestOverflowItems);
        const { debugElement } = fixture;

        await fixture.whenStable();

        expect(isOverflowItemsResultVisible(debugElement)).toBeTrue();
    });

    it('should display result (vertical orientation)', async () => {
        const fixture = createComponent(TestOverflowItemsWithVerticalOrientation);
        const { debugElement } = fixture;

        await fixture.whenStable();

        expect(isOverflowItemsResultVisible(debugElement)).toBeTrue();
    });

    it('should hide result', async () => {
        const fixture = createComponent(TestOverflowItems);
        const { debugElement, componentInstance } = fixture;

        componentInstance.containerWidth.set(1000);
        await fixture.whenStable();

        expect(isOverflowItemsResultVisible(debugElement)).toBeFalse();
    });

    it('should hide result with justify-content end', async () => {
        const fixture = createComponent(TestOverflowItems);
        const { debugElement, componentInstance } = fixture;

        componentInstance.justifyContent.set('end');
        componentInstance.containerWidth.set(1000);
        await fixture.whenStable();

        expect(isOverflowItemsResultVisible(debugElement)).toBeFalse();
    });

    it('should display result score', async () => {
        const fixture = createComponent(TestOverflowItems);
        const { debugElement } = fixture;

        await fixture.whenStable();

        expect(getOverflowItemsResultDebugElement(debugElement).nativeElement.textContent.trim()).toBe('and 12 more');
    });

    it('should display result score with justify-content end', async () => {
        const fixture = createComponent(TestOverflowItems);
        const { debugElement, componentInstance } = fixture;

        componentInstance.justifyContent.set('end');
        await fixture.whenStable();

        expect(getOverflowItemsResultDebugElement(debugElement).nativeElement.textContent.trim()).toBe('and 12 more');
    });

    it('should hide items by order', async () => {
        const fixture = createComponent(TestOrderedOverflowItems);
        const { debugElement, componentInstance } = fixture;

        componentInstance.containerWidth.set(200);
        await fixture.whenStable();

        const visibleItems = getOverflowVisibleItems(debugElement);

        expect(visibleItems.length).toEqual(2);
        expect(visibleItems[1].nativeElement.textContent.trim()).toEqual('Item5');
    });

    it('should hide items by order when reverseOverflowOrder is enabled', async () => {
        const fixture = createComponent(TestOrderedOverflowItems);
        const { debugElement, componentInstance } = fixture;

        componentInstance.containerWidth.set(200);
        componentInstance.reverseOverflowOrder.set(true);
        await fixture.whenStable();

        const visibleItems = getOverflowVisibleItems(debugElement);

        expect(visibleItems.length).toEqual(2);
        expect(visibleItems[0].nativeElement.textContent.trim()).toEqual('Item5');
    });

    it('should hide last ordered item when no space is available', async () => {
        const fixture = createComponent(TestOrderedOverflowItems);
        const { debugElement, componentInstance } = fixture;

        componentInstance.containerWidth.set(componentInstance.itemWidth() - 1);
        await fixture.whenStable();

        const visibleItems = getOverflowVisibleItems(debugElement);

        expect(visibleItems.length).toEqual(0);
    });

    it('should prevent hiding item with alwaysVisible attribute', async () => {
        const fixture = createComponent(TestOverflowItems);
        const { debugElement, componentInstance } = fixture;

        componentInstance.containerWidth.set(250);
        await fixture.whenStable();

        const visibleItems = getOverflowVisibleItems(debugElement);

        expect(visibleItems.length).toEqual(3);
        expect(visibleItems[2].nativeElement.textContent.trim()).toEqual('Item7');
    });

    it('should prevent hiding item with alwaysVisible attribute (vertical orientation)', async () => {
        const fixture = createComponent(TestOverflowItemsWithVerticalOrientation);
        const { debugElement, componentInstance } = fixture;

        componentInstance.containerHeight.set(200);
        await fixture.whenStable();

        const visibleItems = getOverflowVisibleItems(debugElement);

        expect(visibleItems.length).toEqual(3);
        expect(visibleItems[2].nativeElement.textContent.trim()).toEqual('Item7');
    });

    it('should prevent hiding item with alwaysVisible when no space is available', async () => {
        const fixture = createComponent(TestOverflowItems);
        const { debugElement, componentInstance } = fixture;

        componentInstance.containerWidth.set(componentInstance.itemWidth() - 1);
        await fixture.whenStable();

        const visibleItems = getOverflowVisibleItems(debugElement);

        expect(visibleItems.length).toEqual(1);
        expect(visibleItems[0].nativeElement.textContent.trim()).toEqual('Item7');
    });

    it('should prevent hiding item with alwaysVisible attribute when reverseOverflowOrder is enabled', async () => {
        const fixture = createComponent(TestOverflowItems);
        const { debugElement, componentInstance } = fixture;

        componentInstance.containerWidth.set(200);
        componentInstance.reverseOverflowOrder.set(true);
        await fixture.whenStable();
        const visibleItems = getOverflowVisibleItems(debugElement);

        expect(visibleItems.length).toEqual(2);
        expect(visibleItems[0].nativeElement.textContent.trim()).toEqual('Item7');
    });
});

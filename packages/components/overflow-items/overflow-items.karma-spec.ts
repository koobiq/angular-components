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
    standalone: true,
    imports: [KbqOverflowItemsModule],
    selector: 'overflow-items-test',
    template: `
        <div
            #kbqOverflowItems="kbqOverflowItems"
            kbqOverflowItems
            [style.width.px]="containerWidth()"
            [reverseOverflowOrder]="reverseOverflowOrder()"
            [style.justify-content]="justifyContent()"
        >
            <div kbqOverflowItemsResult [style.width.px]="resultWidth()" [style.flex-shrink]="0">
                and {{ kbqOverflowItems.hiddenItemIDs().size }} more
            </div>
            @for (item of items(); track item.id) {
                <div
                    [kbqOverflowItem]="item.id"
                    [style.width.px]="itemWidth()"
                    [style.flex-shrink]="0"
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

    readonly containerWidth = signal(500);
    readonly itemWidth = signal(50);
    readonly resultWidth = signal(100);
    readonly justifyContent = signal<'start' | 'end'>('start');
}

@Component({
    standalone: true,
    imports: [KbqOverflowItemsModule],
    selector: 'overflow-items-with-vertical-orientation',
    template: `
        <div
            #kbqOverflowItems="kbqOverflowItems"
            kbqOverflowItems
            orientation="vertical"
            [style.height.px]="containerHeight()"
            [reverseOverflowOrder]="reverseOverflowOrder()"
        >
            @for (item of items(); track item.id) {
                <kbq-badge
                    [kbqOverflowItem]="item.id"
                    [alwaysVisible]="item.alwaysVisible"
                    [style.height.px]="itemHeight()"
                    [style.flex-shrink]="0"
                >
                    {{ item.id }}
                </kbq-badge>
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

    readonly containerHeight = signal(500);
    readonly itemHeight = signal(50);
    readonly resultHeight = signal(50);
}

@Component({
    standalone: true,
    imports: [KbqOverflowItemsModule],
    selector: 'overflow-items-test',
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

describe(KbqOverflowItemsModule.name, () => {
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

    it('should hide overflown items when vertical orientation', async () => {
        const fixture = createComponent(TestOverflowItemsWithVerticalOrientation);
        const { debugElement } = fixture;

        await fixture.whenStable();

        expect(getOverflowHiddenItems(debugElement).length).toBe(11);
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

    it('should recalculate hidden items on container width change when vertical orientation', async () => {
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

    it('should recalculate hidden items on `reverseOverflowOrder` attribute change when vertical orientation', async () => {
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

    it('should display result when vertical orientation', async () => {
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

    it('should prevent hiding item with alwaysVisible attribute when vertical orientation', async () => {
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

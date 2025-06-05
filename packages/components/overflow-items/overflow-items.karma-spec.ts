import { ChangeDetectionStrategy, Component, DebugElement, Provider, signal, Type } from '@angular/core';
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
            [style.max-width.px]="containerMaxWidth()"
            [reverseOverflowOrder]="reverseOverflowOrder()"
            kbqOverflowItems
        >
            <div [style.width.px]="resultWidth()" [style.flex-shrink]="0" kbqOverflowItemsResult>
                and {{ kbqOverflowItems.hiddenItemIDs().size }} more
            </div>
            @for (item of items; track item) {
                <div [kbqOverflowItem]="item" [style.min-width.px]="itemWidth()">{{ item }}</div>
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverflowItemsTest {
    readonly reverseOverflowOrder = signal(false);
    readonly items = Array.from({ length: 20 }).map((_, i) => `Item${i}`);

    readonly containerMaxWidth = signal(500);
    readonly itemWidth = signal(50);
    readonly resultWidth = signal(100);
}

@Component({
    standalone: true,
    imports: [KbqOverflowItemsModule],
    selector: 'overflow-items-test',
    template: `
        <div
            #kbqOverflowItemsReverse="kbqOverflowItems"
            [style.max-width.px]="containerMaxWidth()"
            reverseOverflowOrder
            kbqOverflowItems
        >
            <div [style.min-width.px]="itemWidth()" [order]="items.length + 1" kbqOverflowItem="lastOrderItem">
                lastOrderItem
            </div>
            <div [style.width.px]="resultWidth()" [style.flex-shrink]="0" kbqOverflowItemsResult>
                and {{ kbqOverflowItemsReverse.hiddenItemIDs().size }} more
            </div>
            @for (item of items; track item) {
                <div [kbqOverflowItem]="item" [style.min-width.px]="itemWidth()">{{ item }}</div>
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverflowItemsWithOrderedItem {
    readonly items = Array.from({ length: 20 }).map((_, i) => `Item${i}`);

    readonly containerMaxWidth = signal(500);
    readonly itemWidth = signal(50);
    readonly resultWidth = signal(100);
}

@Component({
    standalone: true,
    imports: [KbqOverflowItemsModule],
    selector: 'overflow-items-test',
    template: `
        <div #kbqOverflowItemsReverse="kbqOverflowItems" [style.max-width.px]="containerMaxWidth()" kbqOverflowItems>
            @for (item of items; track item) {
                <div [kbqOverflowItem]="item" [style.min-width.px]="itemWidth()">{{ item }}</div>
            }
            <div [style.min-width.px]="itemWidth()" kbqOverflowItem="alwaysVisibleItem" alwaysVisible>
                alwaysVisibleItem
            </div>
            <div [style.width.px]="resultWidth()" [style.flex-shrink]="0" kbqOverflowItemsResult>
                and {{ kbqOverflowItemsReverse.hiddenItemIDs().size }} more
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverflowItemsWithDisabledHideItem {
    readonly items = Array.from({ length: 20 }).map((_, i) => `Item${i}`);

    readonly containerMaxWidth = signal(500);
    readonly itemWidth = signal(50);
    readonly resultWidth = signal(100);
}

describe(KbqOverflowItemsModule.name, () => {
    it('should render all items', () => {
        const { debugElement } = createComponent(OverflowItemsTest);

        expect(getOverflowItemDebugElements(debugElement).length).toBe(20);
    });

    it('should hide overflown items', async () => {
        const fixture = createComponent(OverflowItemsTest);
        const { debugElement } = fixture;

        await fixture.whenStable();
        expect(getOverflowHiddenItems(debugElement).length).toBe(12);
    });

    it('should recalculate hidden items on container width change', async () => {
        const fixture = createComponent(OverflowItemsTest);
        const { debugElement, componentInstance } = fixture;

        componentInstance.containerMaxWidth.set(600);

        await fixture.whenStable();
        expect(getOverflowHiddenItems(debugElement).length).toBe(10);
    });

    it('should recalculate hidden items on `reverseOverflowOrder` attribute change', async () => {
        const fixture = createComponent(OverflowItemsTest);
        const { debugElement, componentInstance } = fixture;

        componentInstance.reverseOverflowOrder.set(true);

        await fixture.whenStable();
        expect(getOverflowVisibleItems(debugElement).at(-1)!.nativeElement.textContent.trim()).toBe('Item19');
    });

    it('should render result', () => {
        const { debugElement } = createComponent(OverflowItemsTest);

        expect(getOverflowItemsResultDebugElement(debugElement).nativeElement).toBeInstanceOf(HTMLDivElement);
    });

    it('should display result', async () => {
        const fixture = createComponent(OverflowItemsTest);
        const { debugElement } = fixture;

        await fixture.whenStable();
        expect(isOverflowItemsResultVisible(debugElement)).toBeTrue();
    });

    it('should hide result', async () => {
        const fixture = createComponent(OverflowItemsTest);
        const { debugElement, componentInstance } = fixture;

        componentInstance.containerMaxWidth.set(1500);
        await fixture.whenStable();
        expect(isOverflowItemsResultVisible(debugElement)).toBeFalse();
    });

    it('should display result score', async () => {
        const fixture = createComponent(OverflowItemsTest);
        const { debugElement } = fixture;

        await fixture.whenStable();
        expect(getOverflowItemsResultDebugElement(debugElement).nativeElement.textContent.trim()).toBe('and 12 more');
    });

    it('should prioritize other overflow items before hiding the ordered item', async () => {
        const fixture = createComponent(OverflowItemsWithOrderedItem);
        const { debugElement, componentInstance } = fixture;

        componentInstance.containerMaxWidth.set(150);
        await fixture.whenStable();
        const visibleItems = getOverflowVisibleItems(debugElement);

        expect(visibleItems.length).toEqual(1);
        expect(visibleItems[0].nativeElement.textContent.trim()).toEqual('lastOrderItem');
    });

    it('should prevent hiding item with alwaysVisible attribute', async () => {
        const fixture = createComponent(OverflowItemsWithDisabledHideItem);
        const { debugElement, componentInstance } = fixture;

        componentInstance.containerMaxWidth.set(150);
        await fixture.whenStable();
        const visibleItems = getOverflowVisibleItems(debugElement);

        expect(visibleItems.length).toEqual(1);
        expect(visibleItems[0].nativeElement.textContent.trim()).toEqual('alwaysVisibleItem');
    });
});

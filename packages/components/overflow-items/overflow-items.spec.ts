import { ChangeDetectionStrategy, Component, computed, DebugElement, Provider, signal, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqFlexWrap } from '@koobiq/components/core';
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

const getOverflowItemsResultDebugElement = (debugElement: DebugElement): DebugElement => {
    return debugElement.query(By.directive(KbqOverflowItemsResult));
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
    readonly flexWrap = signal<KbqFlexWrap>('nowrap');
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
    readonly flexWrap = signal<KbqFlexWrap>('nowrap');
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

    it('should render result', () => {
        const { debugElement } = createComponent(TestOverflowItems);

        expect(getOverflowItemsResultDebugElement(debugElement).nativeElement).toBeInstanceOf(HTMLDivElement);
    });

    it('should apply alwaysVisible host class to items with the input set', () => {
        const { debugElement } = createComponent(TestOverflowItems);
        const items = getOverflowItemDebugElements(debugElement);

        items.forEach((item, index) => {
            const hasAlwaysVisibleClass = (item.nativeElement as HTMLElement).classList.contains(
                'kbq-overflow-item_always-visible'
            );

            expect(hasAlwaysVisibleClass).toBe(index === 7);
        });
    });
});

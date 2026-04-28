import { ChangeDetectionStrategy, Component, DebugElement, Provider, signal, Type } from '@angular/core';
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

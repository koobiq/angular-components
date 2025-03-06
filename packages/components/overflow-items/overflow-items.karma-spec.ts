import { ChangeDetectionStrategy, Component, computed, DebugElement, Provider, signal, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KbqOverflowItemsModule } from './module';

const createComponent = <T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({
        imports: [component],
        providers
    });
    const fixture = TestBed.createComponent<T>(component);
    fixture.autoDetectChanges();
    return fixture;
};

const getDebugElementNativeElement = ({ nativeElement }: DebugElement): Element => nativeElement;

const getOverflowItemElements = (debugElement: DebugElement): Element[] => {
    return Array.from(getDebugElementNativeElement(debugElement).querySelectorAll('.kbq-overflow-items__item'));
};

const getOverflowItemHiddenElements = (debugElement: DebugElement): Element[] => {
    return getOverflowItemElements(debugElement).filter((element) =>
        element.classList.contains('kbq-overflow-items__item_hidden')
    );
};

const getOverflowItemsResultElement = (debugElement: DebugElement): Element => {
    return getDebugElementNativeElement(debugElement).querySelector('.kbq-overflow-items__result')!;
};

const isOverflowItemsResultVisible = (debugElement: DebugElement): boolean => {
    return !getOverflowItemsResultElement(debugElement).classList.contains('kbq-overflow-items__result_hidden');
};

@Component({
    standalone: true,
    imports: [KbqOverflowItemsModule],
    selector: 'overflow-items-test',
    template: `
        <kbq-overflow-items [style.width.px]="containerWidth()" [reverseOverflowOrder]="reverseOverflowOrder()">
            <ng-template kbqOverflowItemsResult let-hiddenItemIDs>
                <div [style.width.px]="resultWidth()">and {{ hiddenItemIDs.size }} more</div>
            </ng-template>
            @for (item of items(); track item) {
                <div *kbqOverflowItem="item" [style.width.px]="itemWidth()">{{ item }}</div>
            }
        </kbq-overflow-items>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverflowItemsTest {
    readonly reverseOverflowOrder = signal(false);

    readonly containerWidth = signal(500);
    readonly itemWidth = signal(50);
    readonly resultWidth = signal(100);

    readonly items = computed(() => Array.from({ length: 20 }).map((_, i) => `Item${i}`));
}

describe(KbqOverflowItemsModule.name, () => {
    it('should render all items', () => {
        const { debugElement } = createComponent(OverflowItemsTest);
        expect(getOverflowItemElements(debugElement).length).toBe(20);
    });

    it('should hide overflown items', async () => {
        const fixture = createComponent(OverflowItemsTest);
        await fixture.whenStable();
        const { debugElement } = fixture;
        expect(getOverflowItemHiddenElements(debugElement).length).toBe(12);
    });

    it('should render result', () => {
        const { debugElement } = createComponent(OverflowItemsTest);
        expect(getOverflowItemsResultElement(debugElement)).toBeInstanceOf(HTMLElement);
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
        componentInstance.containerWidth.set(1500);
        await fixture.whenStable();
        expect(isOverflowItemsResultVisible(debugElement)).toBeFalse();
    });

    it('should display result score', async () => {
        const fixture = createComponent(OverflowItemsTest);
        const { debugElement } = fixture;
        await fixture.whenStable();
        expect(getOverflowItemsResultElement(debugElement).textContent).toBe('and 12 more');
    });
});

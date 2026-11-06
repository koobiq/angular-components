import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqOverflowItem, KbqOverflowItems, KbqOverflowItemsModule } from '@koobiq/components/overflow-items';
import { EMPTY } from 'rxjs';

// jsdom has no layout: every element reports the width set in its inline style.
const stubLayout = () =>
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
        const width = parseFloat(this.style?.width) || 0;
        const height = parseFloat(this.style?.height) || 0;

        return { x: 0, y: 0, top: 0, left: 0, right: width, bottom: height, width, height } as DOMRect;
    });

@Component({
    selector: 'triage-order-null',
    imports: [KbqOverflowItemsModule],
    template: `
        <div kbqOverflowItems style="width: 100px">
            <div kbqOverflowItem="A" style="width: 40px; flex-shrink: 0">A</div>
            <div kbqOverflowItem="B" style="width: 40px; flex-shrink: 0" [order]="orderB()">B</div>
            <div kbqOverflowItem="C" style="width: 40px; flex-shrink: 0" [order]="-1">C</div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class OrderNull {
    readonly orderB = signal<unknown>(1);
}

const setup = async (orderB: unknown) => {
    vi.useFakeTimers();
    stubLayout();
    TestBed.configureTestingModule({
        imports: [OrderNull],
        providers: [{ provide: SharedResizeObserver, useValue: { observe: () => EMPTY } }]
    });
    const fixture = TestBed.createComponent(OrderNull);

    fixture.componentInstance.orderB.set(orderB);
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(20);
    fixture.detectChanges();

    return {
        directive: fixture.debugElement.query(By.directive(KbqOverflowItems)).injector.get(KbqOverflowItems),
        itemB: fixture.debugElement.queryAll(By.directive(KbqOverflowItem))[1].injector.get(KbqOverflowItem)
    };
};

describe('triage: KbqOverflowItem order bound to a non-number', () => {
    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('control: with B at its own index (1) the order is C(-1), A(0), B(1) and B is hidden first', async () => {
        const { directive } = await setup(1);

        expect([...directive.hiddenItemIDs()]).toEqual(['B']);
    });

    it.each([null, undefined, 'abc'])(
        'DEFECT: [order]="%s" becomes NaN instead of falling back to the index, and C (order -1) is hidden first',
        async (orderB) => {
            const { directive, itemB } = await setup(orderB);

            expect(itemB.order()).toBeNaN();
            expect([...directive.hiddenItemIDs()]).toEqual(['C']);
        }
    );
});

import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqFlexWrap } from '@koobiq/components/core';
import { KbqOverflowItem, KbqOverflowItems, KbqOverflowItemsModule } from '@koobiq/components/overflow-items';
import { EMPTY, Subject } from 'rxjs';
import type { Mock } from 'vitest';

// jsdom has no layout: every element reports the width set in its inline style.
const stubLayout = () =>
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
        const width = parseFloat(this.style?.width) || 0;
        const height = parseFloat(this.style?.height) || 0;

        return { x: 0, y: 0, top: 0, left: 0, right: width, bottom: height, width, height } as DOMRect;
    });

@Component({
    selector: 'triage-stale-inputs',
    imports: [KbqOverflowItemsModule],
    template: `
        <div kbqOverflowItems style="width: 100px" [wrap]="wrap()">
            <div kbqOverflowItem="A" style="width: 40px; flex-shrink: 0">A</div>
            <div kbqOverflowItem="B" style="width: 40px; flex-shrink: 0" [order]="orderB()">B</div>
            <div style="width: 40px; flex-shrink: 0" [kbqOverflowItem]="idC()" [alwaysVisible]="alwaysVisibleC()">
                C
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class StaleInputs {
    readonly wrap = signal<KbqFlexWrap>('nowrap');
    readonly orderB = signal(1);
    readonly idC = signal('C');
    readonly alwaysVisibleC = signal(false);
}

describe('triage: KbqOverflowItems input changes', () => {
    let fixture: ComponentFixture<StaleInputs>;
    let directive: KbqOverflowItems;
    let itemC: KbqOverflowItem;
    let hostResize$: Subject<void>;
    let changesSpy: Mock<(value: ReadonlySet<unknown>) => void>;

    const settle = async () => {
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(20);
        fixture.detectChanges();
    };

    beforeEach(async () => {
        vi.useFakeTimers();
        stubLayout();
        hostResize$ = new Subject<void>();
        TestBed.configureTestingModule({
            imports: [StaleInputs],
            providers: [
                {
                    provide: SharedResizeObserver,
                    useValue: { observe: (target: Element) => (target === document.body ? EMPTY : hostResize$) }
                }
            ]
        });
        fixture = TestBed.createComponent(StaleInputs);
        await settle();
        directive = fixture.debugElement.query(By.directive(KbqOverflowItems)).injector.get(KbqOverflowItems);
        itemC = fixture.debugElement.queryAll(By.directive(KbqOverflowItem))[2].injector.get(KbqOverflowItem);
        changesSpy = vi.fn();
        directive.changes.subscribe(changesSpy);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('starts with 120px of items in 100px, the last one in processing order hidden', () => {
        expect([...directive.hiddenItemIDs()]).toEqual(['C']);
    });

    it('DEFECT: a hidden item made alwaysVisible stays hidden until something else triggers a recalculation', async () => {
        fixture.componentInstance.alwaysVisibleC.set(true);
        await settle();

        expect(itemC.alwaysVisible()).toBe(true);
        expect(itemC.hidden()).toBe(true);
        expect(itemC.element.style.visibility).toBe('hidden');
        expect([...directive.hiddenItemIDs()]).toEqual(['C']);
        expect(changesSpy).not.toHaveBeenCalled();

        // Any recalculation fixes it: the missing piece is the trigger.
        hostResize$.next();
        await settle();

        expect(itemC.hidden()).toBe(false);
        expect([...directive.hiddenItemIDs()]).toEqual(['B']);
    });

    it('DEFECT: renaming a hidden item leaves its old ID in hiddenItemIDs', async () => {
        fixture.componentInstance.idC.set('C2');
        await settle();

        expect(itemC.id()).toBe('C2');
        expect([...directive.hiddenItemIDs()]).toEqual(['C']);
        expect(changesSpy).not.toHaveBeenCalled();
    });

    it('DEFECT: changing order does not recalculate, the previously last item stays the hidden one', async () => {
        // Processing order becomes A, C, B: B should now be hidden instead of C.
        fixture.componentInstance.orderB.set(10);
        await settle();

        expect([...directive.hiddenItemIDs()]).toEqual(['C']);
        expect(changesSpy).not.toHaveBeenCalled();

        hostResize$.next();
        await settle();

        expect([...directive.hiddenItemIDs()]).toEqual(['B']);
    });

    it('DEFECT: switching wrap does not recalculate, the item hidden in nowrap mode stays hidden', async () => {
        fixture.componentInstance.wrap.set('wrap');
        await settle();

        const host = fixture.debugElement.query(By.directive(KbqOverflowItems)).nativeElement as HTMLElement;

        expect(host.style.flexWrap).toBe('wrap');
        expect([...directive.hiddenItemIDs()]).toEqual(['C']);
        expect(changesSpy).not.toHaveBeenCalled();
    });
});

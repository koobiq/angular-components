import { SharedResizeObserver } from '@angular/cdk/observers/private';
import {
    ChangeDetectionStrategy,
    Component,
    DebugElement,
    effect,
    Provider,
    signal,
    Type,
    viewChild
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqFlexWrap, KbqOrientation } from '@koobiq/components/core';
import { EMPTY, Subject } from 'rxjs';
import type { Mock } from 'vitest';
import { KbqOverflowItemsModule } from './module';
import { KbqOverflowItem, KbqOverflowItems, KbqOverflowItemsResult } from './overflow-items';

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
            [orientation]="orientation()"
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
    readonly orientation = signal<KbqOrientation>('horizontal');
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
    selector: 'overflow-items-targets-test',
    imports: [KbqOverflowItemsModule],
    template: `
        <div kbqOverflowItems [additionalResizeObserverTargets]="additionalTarget()">
            <div kbqOverflowItemsResult></div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestOverflowItemsAdditionalTargets {
    readonly additionalTarget = signal<Element>(document.body);
}

@Component({
    selector: 'overflow-items-targets-array-test',
    imports: [KbqOverflowItemsModule],
    template: `
        <div kbqOverflowItems [additionalResizeObserverTargets]="additionalTargets()">
            <div kbqOverflowItemsResult></div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestOverflowItemsAdditionalTargetsArray {
    readonly additionalTargets = signal<Element[]>([document.body]);
}

@Component({
    selector: 'overflow-items-no-result-test',
    imports: [KbqOverflowItemsModule],
    template: `
        <div kbqOverflowItems [style.width.px]="containerWidth()">
            @for (item of items(); track item.id) {
                <div [kbqOverflowItem]="item.id" [style.width.px]="itemWidth" [style.flex-shrink]="0">
                    {{ item.id }}
                </div>
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestOverflowItemsNoResult {
    readonly items = signal(Array.from({ length: 20 }).map((_, i) => ({ id: `Item${i}` })));
    readonly containerWidth = signal(100);
    readonly itemWidth = 50;
}

@Component({
    selector: 'overflow-items-debounce-test',
    imports: [KbqOverflowItemsModule],
    template: `
        <div kbqOverflowItems [debounceTime]="debounceTime()" [style.width.px]="containerWidth()">
            <div kbqOverflowItemsResult [style.width.px]="resultWidth" [style.flex-shrink]="0">and more</div>
            @for (item of items(); track item.id) {
                <div [kbqOverflowItem]="item.id" [style.width.px]="itemWidth" [style.flex-shrink]="0">
                    {{ item.id }}
                </div>
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestOverflowItemsDebounce {
    readonly debounceTime = signal(100);
    readonly items = signal(Array.from({ length: 10 }).map((_, i) => ({ id: `Item${i}` })));
    readonly containerWidth = signal(200);
    readonly itemWidth = 50;
    readonly resultWidth = 50;
}

@Component({
    selector: 'overflow-items-measured-test',
    imports: [KbqOverflowItemsModule],
    template: `
        <div kbqOverflowItems [style.border]="border()" [style.width.px]="layoutWidth()" [style.column-gap.px]="gap()">
            @if (label()) {
                <div class="test-label">label</div>
            }
            @for (item of items; track item) {
                <div
                    [kbqOverflowItem]="item"
                    [style.margin-left.px]="4"
                    [style.display]="item === displayNone() ? 'none' : null"
                >
                    {{ item }}
                </div>
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestOverflowItemsMeasured {
    readonly items = Array.from({ length: 5 }, (_, i) => `Item${i}`);
    readonly border = signal('');
    readonly layoutWidth = signal<number | null>(null);
    readonly gap = signal<number | null>(null);
    readonly label = signal(false);
    readonly displayNone = signal<string | null>(null);
}

@Component({
    selector: 'overflow-items-inputs-test',
    imports: [KbqOverflowItemsModule],
    template: `
        <div kbqOverflowItems [wrap]="wrap()">
            <div kbqOverflowItem="item" [order]="order()" [alwaysVisible]="alwaysVisible()">item</div>
            @if (result()) {
                <div kbqOverflowItemsResult>result</div>
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestOverflowItemsInputs {
    readonly order = signal(1);
    readonly alwaysVisible = signal(false);
    readonly result = signal(false);
    readonly wrap = signal<KbqFlexWrap>('nowrap');
}

const getOverflowItemsDirective = (debugElement: DebugElement): KbqOverflowItems => {
    return debugElement.query(By.directive(KbqOverflowItems)).injector.get(KbqOverflowItems);
};

@Component({
    selector: 'overflow-item-hidden-by-effect',
    imports: [KbqOverflowItemsModule],
    template: `
        <div kbqOverflowItem="item" [alwaysVisible]="alwaysVisible()">item</div>
    `
})
class TestOverflowItemHiddenByEffect {
    readonly item = viewChild.required(KbqOverflowItem);
    readonly alwaysVisible = signal(false);
    readonly wantHidden = signal(false);

    /** How many times the effect below hid the item. */
    runs = 0;

    constructor() {
        effect(() => {
            if (!this.wantHidden()) return;

            this.runs++;
            this.item().hide();
        });
    }
}

describe('KbqOverflowItems', () => {
    afterEach(() => vi.useRealTimers());

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

    describe('additionalResizeObserverTargets', () => {
        it('should observe document.body by default', async () => {
            vi.useFakeTimers();

            const observeSpy = vi.fn().mockReturnValue(EMPTY);

            createComponent(TestOverflowItemsAdditionalTargets, [
                { provide: SharedResizeObserver, useValue: { observe: observeSpy } }
            ]);

            await vi.advanceTimersByTimeAsync(0);

            expect(observeSpy).toHaveBeenCalledWith(document.body);
        });

        it('should observe new target when input changes dynamically', async () => {
            vi.useFakeTimers();

            const targetA = document.createElement('div');
            const targetB = document.createElement('div');
            const observeSpy = vi.fn().mockReturnValue(new Subject().asObservable());

            const fixture = createComponent(TestOverflowItemsAdditionalTargets, [
                { provide: SharedResizeObserver, useValue: { observe: observeSpy } }
            ]);

            fixture.componentInstance.additionalTarget.set(targetA);
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(0);

            expect(observeSpy).toHaveBeenCalledWith(targetA);

            fixture.componentInstance.additionalTarget.set(targetB);
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(0);

            expect(observeSpy).toHaveBeenCalledWith(targetB);
        });

        it('should unsubscribe from old target when input changes dynamically', async () => {
            vi.useFakeTimers();

            const targetA = document.createElement('div');
            const targetB = document.createElement('div');
            const subjectA = new Subject<void>();

            const observeSpy = vi.fn().mockImplementation((el: Element) => {
                if (el === targetA) return subjectA.asObservable();

                return EMPTY;
            });

            const fixture = createComponent(TestOverflowItemsAdditionalTargets, [
                { provide: SharedResizeObserver, useValue: { observe: observeSpy } }
            ]);

            fixture.componentInstance.additionalTarget.set(targetA);
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(0);

            expect(subjectA.observed).toBe(true);

            fixture.componentInstance.additionalTarget.set(targetB);
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(0);

            expect(subjectA.observed).toBe(false);
        });

        it('should observe all targets when input is an array', async () => {
            vi.useFakeTimers();

            const targetA = document.createElement('div');
            const targetB = document.createElement('div');
            const observeSpy = vi.fn().mockReturnValue(EMPTY);

            const fixture = createComponent(TestOverflowItemsAdditionalTargetsArray, [
                { provide: SharedResizeObserver, useValue: { observe: observeSpy } }
            ]);

            fixture.componentInstance.additionalTargets.set([targetA, targetB]);
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(0);

            expect(observeSpy).toHaveBeenCalledWith(targetA);
            expect(observeSpy).toHaveBeenCalledWith(targetB);
        });

        it('should unsubscribe from old targets array when input changes dynamically', async () => {
            vi.useFakeTimers();

            const targetA = document.createElement('div');
            const targetB = document.createElement('div');
            const targetC = document.createElement('div');
            const subjectA = new Subject<void>();
            const subjectB = new Subject<void>();

            const observeSpy = vi.fn().mockImplementation((el: Element) => {
                if (el === targetA) return subjectA.asObservable();
                if (el === targetB) return subjectB.asObservable();

                return EMPTY;
            });

            const fixture = createComponent(TestOverflowItemsAdditionalTargetsArray, [
                { provide: SharedResizeObserver, useValue: { observe: observeSpy } }
            ]);

            fixture.componentInstance.additionalTargets.set([targetA, targetB]);
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(0);

            expect(subjectA.observed).toBe(true);
            expect(subjectB.observed).toBe(true);

            fixture.componentInstance.additionalTargets.set([targetC]);
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(0);

            expect(subjectA.observed).toBe(false);
            expect(subjectB.observed).toBe(false);
        });
    });

    describe('debounceTime', () => {
        let hostResize$: Subject<void>;
        let fixture: ComponentFixture<TestOverflowItemsDebounce>;
        let changesSpy: Mock;

        beforeEach(async () => {
            vi.useFakeTimers();

            hostResize$ = new Subject<void>();
            fixture = createComponent(TestOverflowItemsDebounce, [
                {
                    provide: SharedResizeObserver,
                    useValue: { observe: (target: Element) => (target === document.body ? EMPTY : hostResize$) }
                }
            ]);
            changesSpy = vi.fn();
            getOverflowItemsDirective(fixture.debugElement).changes.subscribe(changesSpy);

            await vi.advanceTimersByTimeAsync(100);
            changesSpy.mockClear();
        });

        it('should recalculate once the bound time has passed since the last resize', async () => {
            hostResize$.next();
            await vi.advanceTimersByTimeAsync(50);
            hostResize$.next();
            await vi.advanceTimersByTimeAsync(99);

            expect(changesSpy).not.toHaveBeenCalled();

            await vi.advanceTimersByTimeAsync(1);

            expect(changesSpy).toHaveBeenCalledTimes(1);
        });

        it('should follow a change of the bound time', async () => {
            fixture.componentInstance.debounceTime.set(300);
            fixture.detectChanges();

            hostResize$.next();
            await vi.advanceTimersByTimeAsync(299);

            expect(changesSpy).not.toHaveBeenCalled();

            await vi.advanceTimersByTimeAsync(1);

            expect(changesSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('without result element', () => {
        it('should recalculate hidden items without kbqOverflowItemsResult and emit hidden IDs', async () => {
            vi.useFakeTimers();

            const hostResize$ = new Subject<void>();
            const bodyResize$ = new Subject<void>();
            const observeSpy = vi.fn().mockImplementation((target: Element) => {
                if (target === document.body) return bodyResize$.asObservable();

                return hostResize$.asObservable();
            });

            const fixture = createComponent(TestOverflowItemsNoResult, [
                { provide: SharedResizeObserver, useValue: { observe: observeSpy } }
            ]);
            const directive = getOverflowItemsDirective(fixture.debugElement);
            const changesSpy = vi.fn();

            directive.changes.subscribe(changesSpy);

            await expect(
                (async () => {
                    hostResize$.next();
                    await vi.advanceTimersByTimeAsync(0);
                })()
            ).resolves.not.toThrow();

            const hiddenIds = directive.hiddenItemIDs();

            expect(hiddenIds.size).toBe(0);
            expect(changesSpy).toHaveBeenCalledWith(hiddenIds);
        });
    });

    describe('measurement', () => {
        const ITEM_WIDTH = 100.5;
        // Five items with a 4px left margin each.
        const ITEMS_SIZE = 5 * (ITEM_WIDTH + 4);
        // 4px laid out at 110% zoom: snapped to 1/64 of a device pixel, while `getComputedStyle` still reports 4px.
        const LAID_OUT_MARGIN = 3.9915;

        const LABEL_WIDTH = 50;

        const rect = (width: number) => ({ width }) as DOMRect;

        const setup = async (
            containerWidth: number,
            {
                devicePixelRatio = 1,
                itemWidth = ITEM_WIDTH,
                configure
            }: {
                devicePixelRatio?: number;
                itemWidth?: number;
                configure?: (host: TestOverflowItemsMeasured) => void;
            } = {}
        ) => {
            vi.useFakeTimers();
            vi.spyOn(window, 'devicePixelRatio', 'get').mockReturnValue(devicePixelRatio);

            const rectSpy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
                this: HTMLElement
            ) {
                if (!this.isConnected || this.style.display === 'none') return rect(0);

                if (this.classList.contains('kbq-overflow-items')) return rect(containerWidth);

                if (this.classList.contains('test-label')) return rect(LABEL_WIDTH);

                return rect(this.classList.contains('kbq-overflow-item') ? itemWidth : 0);
            });

            const fixture = createComponent(TestOverflowItemsMeasured, [
                { provide: SharedResizeObserver, useValue: { observe: () => EMPTY } }
            ]);
            const changesSpy = vi.fn();

            getOverflowItemsDirective(fixture.debugElement).changes.subscribe(changesSpy);
            configure?.(fixture.componentInstance);
            fixture.detectChanges();
            rectSpy.mockClear();
            await vi.advanceTimersByTimeAsync(0);

            const containerMeasurements = (rectSpy.mock.contexts as HTMLElement[]).filter((element) =>
                element.classList.contains('kbq-overflow-items')
            ).length;

            return { changesSpy, containerMeasurements };
        };

        afterEach(() => vi.restoreAllMocks());

        it('should keep every item when the computed margins drift from the layout', async () => {
            const { changesSpy } = await setup(5 * (ITEM_WIDTH + LAID_OUT_MARGIN), { devicePixelRatio: 1.1 });

            expect(changesSpy).toHaveBeenLastCalledWith(new Set());
        });

        it.each([
            { devicePixelRatio: 1.1, overflow: 0.4 },
            { devicePixelRatio: 2, overflow: 0.4 }
        ])(
            'should keep every item when they overflow by $overflow device pixels at devicePixelRatio $devicePixelRatio',
            async ({ devicePixelRatio, overflow }) => {
                const { changesSpy } = await setup(ITEMS_SIZE - overflow / devicePixelRatio, { devicePixelRatio });

                expect(changesSpy).toHaveBeenLastCalledWith(new Set());
            }
        );

        it.each([
            { devicePixelRatio: 1.1, overflow: 0.6 },
            { devicePixelRatio: 2, overflow: 0.5 }
        ])(
            'should hide the last item when the items overflow by $overflow device pixels at devicePixelRatio $devicePixelRatio',
            async ({ devicePixelRatio, overflow }) => {
                const { changesSpy } = await setup(ITEMS_SIZE - overflow / devicePixelRatio, { devicePixelRatio });

                expect(changesSpy).toHaveBeenLastCalledWith(new Set(['Item4']));
            }
        );

        it('should measure at devicePixelRatio 1 when the window reports none', async () => {
            const { changesSpy } = await setup(ITEMS_SIZE - 1, { devicePixelRatio: 0 });

            expect(changesSpy).toHaveBeenLastCalledWith(new Set(['Item4']));
        });

        it('should not count the container borders as free space', async () => {
            const { changesSpy } = await setup(ITEMS_SIZE + 1, {
                configure: (host) => host.border.set('1px solid')
            });

            expect(changesSpy).toHaveBeenLastCalledWith(new Set(['Item4']));
        });

        it('should keep every item of a container scaled down by a transform or CSS zoom', async () => {
            // Rects shrink to 0.8 while the computed margins stay at 4px: every item fits at 0.8 of its layout size.
            const { changesSpy } = await setup(0.8 * ITEMS_SIZE, {
                itemWidth: 0.8 * ITEM_WIDTH,
                configure: (host) => host.layoutWidth.set(ITEMS_SIZE)
            });

            expect(changesSpy).toHaveBeenLastCalledWith(new Set());
        });

        it('should not count an item that is not displayed', async () => {
            const { changesSpy } = await setup(4 * (ITEM_WIDTH + 4), {
                configure: (host) => host.displayNone.set('Item2')
            });

            expect(changesSpy).toHaveBeenLastCalledWith(new Set());
        });

        it('should count the gaps between the children', async () => {
            const { changesSpy } = await setup(ITEMS_SIZE + 4 * 8 - 1, { configure: (host) => host.gap.set(8) });

            expect(changesSpy).toHaveBeenLastCalledWith(new Set(['Item4']));
        });

        it('should count the children of the container that are not items', async () => {
            const { changesSpy } = await setup(ITEMS_SIZE + LABEL_WIDTH - 1, {
                configure: (host) => host.label.set(true)
            });

            expect(changesSpy).toHaveBeenLastCalledWith(new Set(['Item4']));
        });

        it('should hide every item in excess after measuring the container twice', async () => {
            const { changesSpy, containerMeasurements } = await setup(2 * (ITEM_WIDTH + 4));

            expect(changesSpy).toHaveBeenLastCalledWith(new Set(['Item2', 'Item3', 'Item4']));
            expect(containerMeasurements).toBe(2);
        });
    });

    describe('recalculation triggers', () => {
        it.each<[string, (host: TestOverflowItemsInputs) => void]>([
            ['the result appears', (host) => host.result.set(true)],
            ['alwaysVisible changes', (host) => host.alwaysVisible.set(true)],
            ['order changes', (host) => host.order.set(2)],
            ['wrap changes', (host) => host.wrap.set('wrap')]
        ])('should recalculate when %s', async (_change, apply) => {
            vi.useFakeTimers();

            const fixture = createComponent(TestOverflowItemsInputs, [
                { provide: SharedResizeObserver, useValue: { observe: () => EMPTY } }
            ]);
            const spy = vi.spyOn(getOverflowItemsDirective(fixture.debugElement) as any, 'getHiddenItems');

            await vi.advanceTimersByTimeAsync(0);
            spy.mockClear();

            apply(fixture.componentInstance);
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(0);

            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should recalculate when a web font loads', async () => {
            vi.useFakeTimers();

            const fonts = new EventTarget();

            Object.defineProperty(document, 'fonts', { value: fonts, configurable: true });

            try {
                const fixture = createComponent(TestOverflowItemsInputs, [
                    { provide: SharedResizeObserver, useValue: { observe: () => EMPTY } }
                ]);
                const spy = vi.spyOn(getOverflowItemsDirective(fixture.debugElement) as any, 'getHiddenItems');

                await vi.advanceTimersByTimeAsync(0);
                spy.mockClear();

                fonts.dispatchEvent(new Event('loadingdone'));
                await vi.advanceTimersByTimeAsync(0);

                expect(spy).toHaveBeenCalledTimes(1);
            } finally {
                delete (document as { fonts?: unknown }).fonts;
            }
        });
    });

    describe('changes and hiddenItemIDs', () => {
        it('should keep hiddenItemIDs empty before first recalculation and update after resize', async () => {
            vi.useFakeTimers();

            const hostResize$ = new Subject<void>();
            const bodyResize$ = new Subject<void>();
            const observeSpy = vi.fn().mockImplementation((target: Element) => {
                if (target === document.body) return bodyResize$.asObservable();

                return hostResize$.asObservable();
            });

            const fixture = createComponent(TestOverflowItems, [
                { provide: SharedResizeObserver, useValue: { observe: observeSpy } }
            ]);
            const directive = getOverflowItemsDirective(fixture.debugElement);
            const initial = directive.hiddenItemIDs();

            expect(initial.size).toBe(0);

            hostResize$.next();
            await vi.advanceTimersByTimeAsync(0);

            const updated = directive.hiddenItemIDs();

            expect(updated.size).toBe(0);
            expect(updated).not.toBe(initial);
        });
    });

    describe('sortItemsByOrder', () => {
        it('should sort items with explicit duplicate and missing order values', () => {
            const fixture = createComponent(TestOverflowItems);
            const directive = getOverflowItemsDirective(fixture.debugElement);

            const createItem = (id: string, order: number | null) => {
                return {
                    id: () => id,
                    order: () => order
                } as unknown as KbqOverflowItem;
            };

            const items = [
                createItem('A', null),
                createItem('B', 1),
                createItem('C', 1),
                createItem('D', null)
            ];

            const sorted = (directive as any).sortItemsByOrder(items) as KbqOverflowItem[];

            expect(sorted.map((item) => item.id())).toEqual(['A', 'B', 'C', 'D']);
        });

        it('should preserve original order when all items have null order', () => {
            const fixture = createComponent(TestOverflowItems);
            const directive = getOverflowItemsDirective(fixture.debugElement);

            const createItem = (id: string) => ({ id: () => id, order: () => null }) as unknown as KbqOverflowItem;

            const items = [createItem('C'), createItem('A'), createItem('B')];
            const sorted = (directive as any).sortItemsByOrder(items) as KbqOverflowItem[];

            expect(sorted.map((item) => item.id())).toEqual(['C', 'A', 'B']);
        });
    });

    describe('orientation', () => {
        it('should trigger recalculation when orientation input changes', async () => {
            vi.useFakeTimers();

            const hostResize$ = new Subject<void>();
            const observeSpy = vi.fn().mockReturnValue(hostResize$.asObservable());
            const fixture = createComponent(TestOverflowItems, [
                { provide: SharedResizeObserver, useValue: { observe: observeSpy } }
            ]);
            const directive = getOverflowItemsDirective(fixture.debugElement);
            const spy = vi.spyOn(directive as any, 'getHiddenItems');

            await vi.advanceTimersByTimeAsync(0);
            spy.mockClear();

            fixture.componentInstance.orientation.set('vertical');
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(0);

            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    describe('reverseOverflowOrder', () => {
        it('should trigger recalculation when reverseOverflowOrder input changes', async () => {
            vi.useFakeTimers();

            const hostResize$ = new Subject<void>();
            const observeSpy = vi.fn().mockReturnValue(hostResize$.asObservable());
            const fixture = createComponent(TestOverflowItems, [
                { provide: SharedResizeObserver, useValue: { observe: observeSpy } }
            ]);
            const directive = getOverflowItemsDirective(fixture.debugElement);
            const spy = vi.spyOn(directive as any, 'getHiddenItems');

            await vi.advanceTimersByTimeAsync(0);
            spy.mockClear();

            fixture.componentInstance.reverseOverflowOrder.set(true);
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(0);

            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    describe('wrap', () => {
        it('should set flex-wrap style on host element when wrap input changes', async () => {
            vi.useFakeTimers();

            const fixture = createComponent(TestOverflowItems);
            const hostEl = fixture.debugElement.query(By.directive(KbqOverflowItems)).nativeElement as HTMLElement;

            expect(hostEl.style.flexWrap).toBe('nowrap');

            fixture.componentInstance.flexWrap.set('wrap');
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(0);

            expect(hostEl.style.flexWrap).toBe('wrap');
        });
    });

    describe('ElementVisibilityManager', () => {
        it('hide() should set visibility:hidden, position:absolute and aria-hidden', () => {
            const fixture = createComponent(TestOverflowItems);
            const itemEl = fixture.debugElement.query(By.directive(KbqOverflowItem));
            const item = itemEl.injector.get(KbqOverflowItem);

            item.hide();
            fixture.detectChanges();

            expect(item.element.style.visibility).toBe('hidden');
            expect(item.element.style.position).toBe('absolute');
            expect(item.element.getAttribute('aria-hidden')).toBe('true');
        });

        it('show() should remove visibility and position styles and clear aria-hidden', () => {
            const fixture = createComponent(TestOverflowItems);
            const itemEl = fixture.debugElement.query(By.directive(KbqOverflowItem));
            const item = itemEl.injector.get(KbqOverflowItem);

            item.hide();
            fixture.detectChanges();
            item.show();
            fixture.detectChanges();

            expect(item.element.style.visibility).toBe('');
            expect(item.element.style.position).toBe('');
            expect(item.element.getAttribute('aria-hidden')).toBe('false');
        });

        it('KbqOverflowItem.hide() should be a no-op when alwaysVisible=true', () => {
            const fixture = createComponent(TestOverflowItems);
            const items = fixture.debugElement.queryAll(By.directive(KbqOverflowItem));
            // item at index 7 has alwaysVisible=true (see TestOverflowItems)
            const alwaysVisibleItem = items[7].injector.get(KbqOverflowItem);

            expect(alwaysVisibleItem.alwaysVisible()).toBe(true);

            alwaysVisibleItem.hide();
            fixture.detectChanges();

            expect(alwaysVisibleItem.hidden()).toBe(false);
            expect(alwaysVisibleItem.element.style.visibility).toBe('');
        });

        it('KbqOverflowItem.hide() should not make an effect that calls it run again when alwaysVisible changes', async () => {
            const fixture = createComponent(TestOverflowItemHiddenByEffect);

            fixture.componentInstance.wantHidden.set(true);
            await fixture.whenStable();
            fixture.componentInstance.alwaysVisible.set(true);
            await fixture.whenStable();

            expect(fixture.componentInstance.runs).toBe(1);
        });
    });

    describe('hiddenItemIDs', () => {
        it('should reflect the set emitted by changes output', () => {
            const fixture = createComponent(TestOverflowItems);
            const directive = getOverflowItemsDirective(fixture.debugElement);

            const ids = new Set<unknown>(['Item0', 'Item1', 'Item2']);

            directive.changes.emit(ids);

            expect(directive.hiddenItemIDs()).toBe(ids);
        });
    });
});

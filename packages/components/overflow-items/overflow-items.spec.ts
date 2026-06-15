import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { ChangeDetectionStrategy, Component, DebugElement, Provider, signal, Type } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqFlexWrap, KbqOrientation } from '@koobiq/components/core';
import { EMPTY, Subject } from 'rxjs';
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
        <div kbqOverflowItems debounceTime="100" [style.width.px]="containerWidth()">
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
    readonly items = signal(Array.from({ length: 10 }).map((_, i) => ({ id: `Item${i}` })));
    readonly containerWidth = signal(200);
    readonly itemWidth = 50;
    readonly resultWidth = 50;
}

const getOverflowItemsDirective = (debugElement: DebugElement): KbqOverflowItems => {
    return debugElement.query(By.directive(KbqOverflowItems)).injector.get(KbqOverflowItems);
};

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

    describe('additionalResizeObserverTargets', () => {
        it('should observe document.body by default', fakeAsync(() => {
            const observeSpy = jest.fn().mockReturnValue(EMPTY);

            createComponent(TestOverflowItemsAdditionalTargets, [
                { provide: SharedResizeObserver, useValue: { observe: observeSpy } }
            ]);

            tick();

            expect(observeSpy).toHaveBeenCalledWith(document.body);
        }));

        it('should observe new target when input changes dynamically', fakeAsync(() => {
            const targetA = document.createElement('div');
            const targetB = document.createElement('div');
            const observeSpy = jest.fn().mockReturnValue(new Subject().asObservable());

            const fixture = createComponent(TestOverflowItemsAdditionalTargets, [
                { provide: SharedResizeObserver, useValue: { observe: observeSpy } }
            ]);

            fixture.componentInstance.additionalTarget.set(targetA);
            fixture.detectChanges();
            tick();

            expect(observeSpy).toHaveBeenCalledWith(targetA);

            fixture.componentInstance.additionalTarget.set(targetB);
            fixture.detectChanges();
            tick();

            expect(observeSpy).toHaveBeenCalledWith(targetB);
        }));

        it('should unsubscribe from old target when input changes dynamically', fakeAsync(() => {
            const targetA = document.createElement('div');
            const targetB = document.createElement('div');
            const subjectA = new Subject<void>();

            const observeSpy = jest.fn().mockImplementation((el: Element) => {
                if (el === targetA) return subjectA.asObservable();

                return EMPTY;
            });

            const fixture = createComponent(TestOverflowItemsAdditionalTargets, [
                { provide: SharedResizeObserver, useValue: { observe: observeSpy } }
            ]);

            fixture.componentInstance.additionalTarget.set(targetA);
            fixture.detectChanges();
            tick();

            expect(subjectA.observed).toBe(true);

            fixture.componentInstance.additionalTarget.set(targetB);
            fixture.detectChanges();
            tick();

            expect(subjectA.observed).toBe(false);
        }));

        it('should observe all targets when input is an array', fakeAsync(() => {
            const targetA = document.createElement('div');
            const targetB = document.createElement('div');
            const observeSpy = jest.fn().mockReturnValue(EMPTY);

            const fixture = createComponent(TestOverflowItemsAdditionalTargetsArray, [
                { provide: SharedResizeObserver, useValue: { observe: observeSpy } }
            ]);

            fixture.componentInstance.additionalTargets.set([targetA, targetB]);
            fixture.detectChanges();
            tick();

            expect(observeSpy).toHaveBeenCalledWith(targetA);
            expect(observeSpy).toHaveBeenCalledWith(targetB);
        }));

        it('should unsubscribe from old targets array when input changes dynamically', fakeAsync(() => {
            const targetA = document.createElement('div');
            const targetB = document.createElement('div');
            const targetC = document.createElement('div');
            const subjectA = new Subject<void>();
            const subjectB = new Subject<void>();

            const observeSpy = jest.fn().mockImplementation((el: Element) => {
                if (el === targetA) return subjectA.asObservable();
                if (el === targetB) return subjectB.asObservable();

                return EMPTY;
            });

            const fixture = createComponent(TestOverflowItemsAdditionalTargetsArray, [
                { provide: SharedResizeObserver, useValue: { observe: observeSpy } }
            ]);

            fixture.componentInstance.additionalTargets.set([targetA, targetB]);
            fixture.detectChanges();
            tick();

            expect(subjectA.observed).toBe(true);
            expect(subjectB.observed).toBe(true);

            fixture.componentInstance.additionalTargets.set([targetC]);
            fixture.detectChanges();
            tick();

            expect(subjectA.observed).toBe(false);
            expect(subjectB.observed).toBe(false);
        }));
    });

    describe('debounceTime', () => {
        it('should apply debounceTime input and recalculate on resize events', fakeAsync(() => {
            const hostResize$ = new Subject<void>();
            const bodyResize$ = new Subject<void>();
            const observeSpy = jest.fn().mockImplementation((target: Element) => {
                if (target === document.body) return bodyResize$.asObservable();

                return hostResize$.asObservable();
            });

            const fixture = createComponent(TestOverflowItemsDebounce, [
                { provide: SharedResizeObserver, useValue: { observe: observeSpy } }
            ]);
            const directive = getOverflowItemsDirective(fixture.debugElement);
            const hiddenItemsSpy = jest.spyOn(directive as any, 'getHiddenItems');

            tick(100);
            hiddenItemsSpy.mockClear();

            expect(directive.debounceTime()).toBe(100);

            hostResize$.next();

            tick(100);
            expect(hiddenItemsSpy).toHaveBeenCalledTimes(1);
        }));
    });

    describe('without result element', () => {
        it('should recalculate hidden items without kbqOverflowItemsResult and emit hidden IDs', fakeAsync(() => {
            const hostResize$ = new Subject<void>();
            const bodyResize$ = new Subject<void>();
            const observeSpy = jest.fn().mockImplementation((target: Element) => {
                if (target === document.body) return bodyResize$.asObservable();

                return hostResize$.asObservable();
            });

            const fixture = createComponent(TestOverflowItemsNoResult, [
                { provide: SharedResizeObserver, useValue: { observe: observeSpy } }
            ]);
            const directive = getOverflowItemsDirective(fixture.debugElement);
            const changesSpy = jest.fn();

            directive.changes.subscribe(changesSpy);

            expect(() => {
                hostResize$.next();
                tick();
            }).not.toThrow();

            const hiddenIds = directive.hiddenItemIDs();

            expect(hiddenIds.size).toBe(0);
            expect(changesSpy).toHaveBeenCalledWith(hiddenIds);
        }));
    });

    describe('changes and hiddenItemIDs', () => {
        it('should keep hiddenItemIDs empty before first recalculation and update after resize', fakeAsync(() => {
            const hostResize$ = new Subject<void>();
            const bodyResize$ = new Subject<void>();
            const observeSpy = jest.fn().mockImplementation((target: Element) => {
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
            tick();

            const updated = directive.hiddenItemIDs();

            expect(updated.size).toBe(0);
            expect(updated).not.toBe(initial);
        }));
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
        it('should trigger recalculation when orientation input changes', fakeAsync(() => {
            const hostResize$ = new Subject<void>();
            const observeSpy = jest.fn().mockReturnValue(hostResize$.asObservable());
            const fixture = createComponent(TestOverflowItems, [
                { provide: SharedResizeObserver, useValue: { observe: observeSpy } }
            ]);
            const directive = getOverflowItemsDirective(fixture.debugElement);
            const spy = jest.spyOn(directive as any, 'getHiddenItems');

            tick();
            spy.mockClear();

            fixture.componentInstance.orientation.set('vertical');
            fixture.detectChanges();
            tick();

            expect(spy).toHaveBeenCalledTimes(1);
        }));
    });

    describe('reverseOverflowOrder', () => {
        it('should trigger recalculation when reverseOverflowOrder input changes', fakeAsync(() => {
            const hostResize$ = new Subject<void>();
            const observeSpy = jest.fn().mockReturnValue(hostResize$.asObservable());
            const fixture = createComponent(TestOverflowItems, [
                { provide: SharedResizeObserver, useValue: { observe: observeSpy } }
            ]);
            const directive = getOverflowItemsDirective(fixture.debugElement);
            const spy = jest.spyOn(directive as any, 'getHiddenItems');

            tick();
            spy.mockClear();

            fixture.componentInstance.reverseOverflowOrder.set(true);
            fixture.detectChanges();
            tick();

            expect(spy).toHaveBeenCalledTimes(1);
        }));
    });

    describe('wrap', () => {
        it('should set flex-wrap style on host element when wrap input changes', fakeAsync(() => {
            const fixture = createComponent(TestOverflowItems);
            const hostEl = fixture.debugElement.query(By.directive(KbqOverflowItems)).nativeElement as HTMLElement;

            expect(hostEl.style.flexWrap).toBe('nowrap');

            fixture.componentInstance.flexWrap.set('wrap');
            fixture.detectChanges();
            tick();

            expect(hostEl.style.flexWrap).toBe('wrap');
        }));
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

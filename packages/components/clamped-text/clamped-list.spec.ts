import { ENTER, SPACE } from '@angular/cdk/keycodes';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { Component, type DebugElement, signal, type Type } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { bootstrapApplication, By } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import {
    dispatchKeyboardEvent,
    type KbqFlexWrap,
    kbqLocaleIDProvider,
    kbqLocaleServiceProvider,
    type KbqOrientation,
    KbqOverflowFitEngine
} from '@koobiq/components/core';
import { KbqOverflowItem, KbqOverflowItemsResult } from '@koobiq/components/overflow-items';
import { KbqClampedList, KbqClampedListTrigger } from './clamped-list';
import { KBQ_CLAMPED_TEXT_LOCALE_CONFIGURATION, type KbqClampedListMode } from './constants';

const AXE_TIMEOUT = 15000;

/** jsdom has no Web Animations API, so `animate` is supplied for the specs that observe the animation. */
const mockAnimate = () => {
    let resolveFinished!: () => void;
    const finished = new Promise<void>((resolve) => (resolveFinished = resolve));
    const cancel = vi.fn();
    const animate = vi.fn(() => ({ cancel, finished }) as unknown as Animation);

    Object.defineProperty(HTMLElement.prototype, 'animate', { value: animate, configurable: true, writable: true });

    return { animate, cancel, resolveFinished };
};

const mockReducedMotion = () => {
    Object.defineProperty(window, 'matchMedia', {
        value: () => ({ matches: true }),
        configurable: true,
        writable: true
    });
};

const restoreAnimationEnvironment = () => {
    delete (HTMLElement.prototype as { animate?: unknown }).animate;
    delete (window as { matchMedia?: unknown }).matchMedia;
};

/**
 * Drives resize entries through the `ResizeObserver` the CDK observer subscribed with. Set by
 * `installResizeObserverMock` in the suite's `beforeEach`, before any Clamped List constructs its
 * recalculation triggers and subscribes the shared observer.
 */
let emitResize: (target: Element) => void;

const installResizeObserverMock = () => {
    globalThis.ResizeObserver = class {
        constructor(callback: ResizeObserverCallback) {
            emitResize = (target: Element) =>
                callback([{ target } as ResizeObserverEntry], this as unknown as ResizeObserver);
        }

        observe(): void {}

        unobserve(): void {}

        disconnect(): void {}
    } as unknown as typeof ResizeObserver;
};

const originalResizeObserver = globalThis.ResizeObserver;

function getItems(debugElement: DebugElement) {
    return debugElement.queryAll(By.css('.item'));
}

function getTrigger(debugElement: DebugElement) {
    return debugElement.query(By.css('.trigger'));
}

function getHost(debugElement: DebugElement): HTMLElement {
    return debugElement.query(By.directive(KbqClampedList)).nativeElement;
}

@Component({
    imports: [
        KbqClampedListTrigger,
        KbqClampedList
    ],
    template: `
        <div
            #clampedList="kbqClampedList"
            kbqClampedList
            [items]="items()"
            [collapsedVisibleCount]="collapsedVisibleCount()"
            [hiddenThreshold]="hiddenThreshold()"
            [duration]="duration()"
        >
            @for (item of clampedList.visibleItems(); track item) {
                <span class="item">{{ item }}</span>
            }

            @if (clampedList.hasToggle()) {
                <span kbqClampedListTrigger class="trigger">
                    @if (clampedList.isCollapsed()) {
                        open
                    } @else {
                        close
                    }
                </span>
            }
        </div>
    `
})
class TestHostComponent {
    readonly items = signal(Array.from({ length: 17 }, (_, i) => `Item ${i + 1}`));
    readonly collapsedVisibleCount = signal(10);
    readonly hiddenThreshold = signal(6);
    readonly duration = signal(100);
}

@Component({
    imports: [KbqClampedListTrigger, KbqClampedList],
    template: `
        <div #clampedList="kbqClampedList" kbqClampedList [items]="items()">
            @for (item of clampedList.visibleItems(); track item) {
                <span class="item">{{ item }}</span>
            }

            @if (clampedList.hasToggle()) {
                <span class="trigger">
                    {{
                        clampedList.isCollapsed()
                            ? clampedList.showMoreCompactCountText()
                            : clampedList.localeConfiguration().closeText
                    }}
                </span>
            }
        </div>
    `
})
class TestLocalizedHostComponent {
    readonly items = signal(Array.from({ length: 17 }, (_, i) => `Item ${i + 1}`));
}

@Component({
    selector: 'app-root',
    imports: [KbqClampedList, KbqClampedListTrigger, KbqOverflowItem, KbqOverflowItemsResult],
    template: `
        <div
            #list="kbqClampedList"
            kbqClampedList
            [mode]="mode()"
            [orientation]="orientation()"
            [wrap]="wrap()"
            [scrollOnCollapse]="scrollOnCollapse()"
            [items]="items()"
            [collapsedVisibleCount]="10"
            [hiddenThreshold]="6"
        >
            @for (item of list.items(); track item) {
                <span class="item" [kbqOverflowItem]="$index">{{ item }}</span>
            }
            @if (list.hasToggle()) {
                <span class="trigger" kbqClampedListTrigger kbqOverflowItemsResult>toggle</span>
            }
        </div>
    `
})
class TestOverflowHostComponent {
    readonly items = signal(Array.from({ length: 17 }, (_, index) => `Item ${index + 1}`));
    readonly mode = signal<KbqClampedListMode>('overflow');
    readonly orientation = signal<KbqOrientation>('horizontal');
    readonly wrap = signal<KbqFlexWrap>('nowrap');
    readonly scrollOnCollapse = signal(true);
}

@Component({
    imports: [KbqClampedList, KbqClampedListTrigger, KbqOverflowItem, KbqOverflowItemsResult],
    template: `
        <div
            #list="kbqClampedList"
            kbqClampedList
            mode="overflow"
            [items]="items()"
            [collapsedVisibleCount]="10"
            [hiddenThreshold]="6"
        >
            @for (item of list.items(); track item) {
                <span class="item" [kbqOverflowItem]="$index < 16 ? $index : -1">{{ item }}</span>
            }
            @if (list.hasToggle()) {
                <span class="trigger" kbqClampedListTrigger kbqOverflowItemsResult>toggle</span>
            }
        </div>
    `
})
class TestOverflowMissingIndexHostComponent {
    readonly items = signal(Array.from({ length: 17 }, (_, index) => `Item ${index + 1}`));
}

@Component({
    imports: [KbqClampedList, KbqClampedListTrigger, KbqOverflowItem, KbqOverflowItemsResult],
    template: `
        <div
            #list="kbqClampedList"
            kbqClampedList
            mode="overflow"
            [items]="items()"
            [collapsedVisibleCount]="10"
            [hiddenThreshold]="6"
        >
            @for (item of list.items(); track item) {
                <span class="item" [kbqOverflowItem]="$index === 16 ? 0 : $index">{{ item }}</span>
            }
            @if (list.hasToggle()) {
                <span class="trigger" kbqClampedListTrigger kbqOverflowItemsResult>toggle</span>
            }
        </div>
    `
})
class TestOverflowDuplicateIndexHostComponent {
    readonly items = signal(Array.from({ length: 17 }, (_, index) => `Item ${index + 1}`));
}

describe('KbqClampedList', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let debugElement: DebugElement;

    beforeEach(() => {
        // Before any Clamped List constructs its recalculation triggers and subscribes the shared resize observer,
        // so the overflow specs can emit resizes through `emitResize`.
        installResizeObserverMock();
        // jsdom does not implement scrollIntoView; collapsing through the toggle scrolls after the animation.
        vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(() => {});
        TestBed.configureTestingModule({
            imports: [TestHostComponent]
        });

        fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();
        debugElement = fixture.debugElement;
    });

    afterEach(() => {
        globalThis.ResizeObserver = originalResizeObserver;
    });

    it('should render collapsed list by default', () => {
        expect(getItems(debugElement).length).toBe(fixture.componentInstance.collapsedVisibleCount());
    });

    it('should render toggle when exceeded items >= threshold', () => {
        expect(getTrigger(debugElement)).toBeTruthy();
    });

    it('should expand list when trigger clicked', () => {
        getTrigger(debugElement).nativeElement.click();
        fixture.detectChanges();

        expect(getItems(debugElement).length).toBe(fixture.componentInstance.items().length);
    });

    it('should toggle trigger text', () => {
        const trigger = getTrigger(debugElement).nativeElement;

        expect(trigger.textContent.trim()).toBe('open');

        trigger.click();
        fixture.detectChanges();

        expect(trigger.textContent.trim()).toBe('close');
    });

    it('should not render trigger if items do not exceed threshold', () => {
        fixture.componentInstance.items.set(Array.from({ length: 9 }, (_, i) => `Item ${i + 1}`));
        fixture.detectChanges();

        expect(getTrigger(debugElement)).toBeNull();
    });

    it('should show all items when exceeded count is below hiddenThreshold', () => {
        fixture.componentInstance.items.set(Array.from({ length: 12 }, (_, i) => `Item ${i + 1}`));
        fixture.detectChanges();

        expect(getTrigger(debugElement)).toBeNull();
        expect(getItems(debugElement).length).toBe(12);
    });

    it('should collapse back when clicked twice', () => {
        const trigger = getTrigger(debugElement).nativeElement;

        trigger.click();
        fixture.detectChanges();
        expect(getItems(debugElement).length).toBe(fixture.componentInstance.items().length);

        trigger.click();
        fixture.detectChanges();
        expect(getItems(debugElement).length).toBe(fixture.componentInstance.collapsedVisibleCount());
    });

    describe('disclosure semantics', () => {
        it('should carry role and tabindex on the trigger', () => {
            const trigger: HTMLElement = getTrigger(debugElement).nativeElement;

            expect(trigger.getAttribute('role')).toBe('button');
            expect(trigger.getAttribute('tabindex')).toBe('0');
        });

        it('should update aria-expanded on the trigger', () => {
            const trigger: HTMLElement = getTrigger(debugElement).nativeElement;

            expect(trigger.getAttribute('aria-expanded')).toBe('false');

            trigger.click();
            fixture.detectChanges();

            expect(trigger.getAttribute('aria-expanded')).toBe('true');
        });

        it('should point aria-controls at the list', () => {
            const trigger: HTMLElement = getTrigger(debugElement).nativeElement;

            expect(debugElement.nativeElement.querySelector(`#${trigger.getAttribute('aria-controls')}`)).toBe(
                getHost(debugElement)
            );
        });

        it('should keep an id the host already carries', () => {
            const host = getHost(debugElement);

            expect(host.id).toBeTruthy();
        });

        it('should not publish aria-expanded on the role-less host', () => {
            expect(getHost(debugElement).hasAttribute('aria-expanded')).toBe(false);
        });

        it.each<[string, number, string]>([
            ['space', SPACE, ' '],
            ['enter', ENTER, 'Enter']
        ])('should toggle on %s and prevent the default action', (_key, keyCode, key) => {
            const trigger: HTMLElement = getTrigger(debugElement).nativeElement;
            const event = dispatchKeyboardEvent(trigger, 'keydown', keyCode, undefined, key);

            fixture.detectChanges();

            expect(getItems(debugElement).length).toBe(fixture.componentInstance.items().length);
            expect(event.defaultPrevented).toBe(true);
        });

        it(
            'should have no axe violations in both states',
            async () => {
                await expect(fixture.nativeElement).toHaveNoViolations();

                getTrigger(debugElement).nativeElement.click();
                fixture.detectChanges();

                await expect(fixture.nativeElement).toHaveNoViolations();
            },
            AXE_TIMEOUT
        );
    });

    describe('localized labels', () => {
        beforeEach(() => TestBed.resetTestingModule());

        it('should render showMoreCompactCountText for the default locale', () => {
            TestBed.configureTestingModule({ imports: [TestLocalizedHostComponent] });

            const fixture = TestBed.createComponent(TestLocalizedHostComponent);

            fixture.detectChanges();

            const clampedList = fixture.debugElement.query(By.directive(KbqClampedList)).injector.get(KbqClampedList);

            expect(clampedList.showMoreCompactCountText()).toBe('Еще 7');
        });

        it('should render showMoreCountText for the default locale', () => {
            TestBed.configureTestingModule({ imports: [TestLocalizedHostComponent] });

            const fixture = TestBed.createComponent(TestLocalizedHostComponent);

            fixture.detectChanges();

            const clampedList = fixture.debugElement.query(By.directive(KbqClampedList)).injector.get(KbqClampedList);

            expect(clampedList.showMoreCountText()).toBe('Еще 7');
        });

        it('should render showMoreCompactCountText for en-US', () => {
            TestBed.configureTestingModule({
                imports: [TestLocalizedHostComponent],
                providers: [kbqLocaleServiceProvider(), kbqLocaleIDProvider('en-US')]
            });

            const fixture = TestBed.createComponent(TestLocalizedHostComponent);

            fixture.detectChanges();

            const clampedList = fixture.debugElement.query(By.directive(KbqClampedList)).injector.get(KbqClampedList);

            expect(clampedList.showMoreCompactCountText()).toBe('7 more');
        });

        it('should fall back to moreText when showMoreTextCompact is not set', () => {
            TestBed.configureTestingModule({
                imports: [TestLocalizedHostComponent],
                providers: [
                    {
                        provide: KBQ_CLAMPED_TEXT_LOCALE_CONFIGURATION,
                        useValue: {
                            openText: 'Expand',
                            closeText: 'Collapse',
                            showMoreText: 'Show more',
                            moreText: 'more'
                        }
                    }
                ]
            });

            const fixture = TestBed.createComponent(TestLocalizedHostComponent);

            fixture.detectChanges();

            const clampedList = fixture.debugElement.query(By.directive(KbqClampedList)).injector.get(KbqClampedList);

            expect(clampedList.showMoreCompactCountText()).toBe('7 more');
        });
    });

    describe('animation', () => {
        const ITEM_HEIGHT = 10;

        beforeEach(() => {
            vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
                return { height: this.querySelectorAll('.item').length * ITEM_HEIGHT } as DOMRect;
            });
        });

        afterEach(restoreAnimationEnvironment);

        it('should animate block-size of the host between the heights before and after the toggle', async () => {
            const { animate } = mockAnimate();

            getTrigger(debugElement).nativeElement.click();
            await fixture.whenStable();
            expect(animate).toHaveBeenCalledWith(
                {
                    blockSize: ['100px', '170px'],
                    overflow: ['clip', 'clip'],
                    alignContent: ['flex-start', 'flex-start']
                },
                { duration: 100, easing: 'ease-in-out' }
            );
        });

        it('should respect the duration', async () => {
            const { animate } = mockAnimate();

            fixture.componentInstance.duration.set(250);
            fixture.detectChanges();

            getTrigger(debugElement).nativeElement.click();
            await fixture.whenStable();

            expect(animate).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ duration: 250 }));
        });

        it('should not animate when the height does not change', async () => {
            const { animate } = mockAnimate();

            vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ height: 100 } as DOMRect);

            getTrigger(debugElement).nativeElement.click();
            await fixture.whenStable();

            expect(animate).not.toHaveBeenCalled();
        });

        it('should not animate when the user prefers reduced motion', async () => {
            const { animate } = mockAnimate();

            mockReducedMotion();

            getTrigger(debugElement).nativeElement.click();
            await fixture.whenStable();

            expect(animate).not.toHaveBeenCalled();
            expect(getItems(debugElement).length).toBe(fixture.componentInstance.items().length);
        });

        it('should not animate when the items change without a toggle', async () => {
            const { animate } = mockAnimate();

            fixture.componentInstance.items.set(Array.from({ length: 30 }, (_, i) => `Item ${i + 1}`));
            await fixture.whenStable();

            expect(animate).not.toHaveBeenCalled();
        });

        it.each([NaN, -1])('should not animate with the invalid duration %s', async (duration) => {
            const { animate } = mockAnimate();

            fixture.componentInstance.duration.set(duration);
            fixture.detectChanges();

            getTrigger(debugElement).nativeElement.click();
            await fixture.whenStable();

            expect(animate).not.toHaveBeenCalled();
            expect(getItems(debugElement).length).toBe(fixture.componentInstance.items().length);
        });
    });

    describe('Overflow-based Collapse', () => {
        afterEach(() => {
            vi.restoreAllMocks();
            restoreAnimationEnvironment();
        });

        const hideLastItems = (count: number) =>
            vi.spyOn(KbqOverflowFitEngine.prototype, 'hideOverflownItems').mockImplementation((items) => {
                const hidden = items.slice(0, count);

                hidden.forEach((item) => item.hide());

                return items.filter((item) => item.hidden());
            });

        const createOverflowFixture = async <T>(component: Type<T>) => {
            const fixture = TestBed.createComponent(component);

            fixture.detectChanges();
            await fixture.whenStable();

            return fixture;
        };

        /** The triggers debounce with `timer(0)`, a macrotask `whenStable` does not flush. */
        const flushDebounce = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

        it('uses collapsedVisibleCount for the initial overflow visibility map', () => {
            // Spied so the assertion holds no matter whether the measurement has already replaced the
            // Count-based Collapse fallback: seven hidden items give the same map.
            hideLastItems(7);
            const fixture = TestBed.createComponent(TestOverflowHostComponent);

            fixture.detectChanges();
            const list = fixture.debugElement.query(By.directive(KbqClampedList)).injector.get(KbqClampedList);

            expect(list.visibleMap()).toEqual(Array.from({ length: 17 }, (_, index) => index < 10));
            expect(list.visibleItems()).toHaveLength(10);
            expect(fixture.nativeElement.querySelectorAll('.kbq-overflow-item-hidden')).toHaveLength(7);
        });

        it('recalculates overflow visibility from the shared engine in reverse DOM order', async () => {
            const engine = hideLastItems(7);
            const fixture = await createOverflowFixture(TestOverflowHostComponent);
            const list = fixture.debugElement.query(By.directive(KbqClampedList)).injector.get(KbqClampedList);

            expect(engine).toHaveBeenCalledWith(
                expect.arrayContaining([expect.objectContaining({ id: expect.any(Function) })]),
                expect.anything(),
                expect.anything(),
                'nowrap'
            );
            expect(list.exceededItemCount()).toBe(7);
            expect(list.visibleMap().filter(Boolean)).toHaveLength(10);

            const callsBeforeResize = engine.mock.calls.length;

            emitResize(document.body);
            await flushDebounce();
            await fixture.whenStable();
            expect(engine).toHaveBeenCalledTimes(callsBeforeResize + 1);
        });

        it('observes the current result element for auto-width recalculations', async () => {
            hideLastItems(7);
            const observe = vi.spyOn(SharedResizeObserver.prototype, 'observe');
            const fixture = await createOverflowFixture(TestOverflowHostComponent);
            const result = getTrigger(fixture.debugElement).nativeElement;

            expect(observe).toHaveBeenCalledWith(result);
        });

        it('restores every item when the measured hidden set is below the threshold', async () => {
            hideLastItems(5);
            const fixture = await createOverflowFixture(TestOverflowHostComponent);
            const list = fixture.debugElement.query(By.directive(KbqClampedList)).injector.get(KbqClampedList);

            expect(list.exceededItemCount()).toBe(0);
            expect(list.visibleItems()).toHaveLength(17);
            expect(fixture.nativeElement.querySelectorAll('.kbq-overflow-item-hidden')).toHaveLength(0);
        });

        it('measures the container with the host orientation and wrap', async () => {
            const engine = hideLastItems(7);
            const subject = vi.spyOn(KbqOverflowFitEngine.prototype, 'containerSubject');
            const fixture = await createOverflowFixture(TestOverflowHostComponent);

            fixture.componentInstance.orientation.set('vertical');
            fixture.componentInstance.wrap.set('wrap');
            await fixture.whenStable();
            await flushDebounce();
            await fixture.whenStable();

            expect(subject).toHaveBeenLastCalledWith(getHost(fixture.debugElement), 'vertical', 'wrap');
            expect(engine).toHaveBeenLastCalledWith(expect.anything(), expect.anything(), expect.anything(), 'wrap');
        });

        it('restores every item after measuring in expanded state', async () => {
            hideLastItems(7);
            const fixture = await createOverflowFixture(TestOverflowHostComponent);
            const list = fixture.debugElement.query(By.directive(KbqClampedList)).injector.get(KbqClampedList);

            list.isCollapsed.set(false);
            fixture.detectChanges();
            await flushDebounce();
            await fixture.whenStable();

            expect(list.visibleMap()).toEqual(Array.from({ length: 17 }, () => true));
            expect(fixture.nativeElement.querySelectorAll('.kbq-overflow-item-hidden')).toHaveLength(0);
            expect(list.exceededItemCount()).toBe(7);

            expect(fixture.nativeElement.querySelectorAll('.kbq-overflow-item-hidden')).toHaveLength(0);

            // The host owns the `items` input; the directive exposes it read-only.
            fixture.componentInstance.items.set(Array.from({ length: 20 }, (_, index) => `Item ${index + 1}`));
            await fixture.whenStable();
            await flushDebounce();
            await fixture.whenStable();

            expect(fixture.nativeElement.querySelectorAll('.kbq-overflow-item-hidden')).toHaveLength(0);
        });

        it('applies the expanded visibility synchronously with the toggle change', async () => {
            hideLastItems(7);
            const fixture = await createOverflowFixture(TestOverflowHostComponent);

            getTrigger(fixture.debugElement).nativeElement.click();
            fixture.detectChanges();

            // No `whenStable`: the visibility lands in the animation change callback, not in the debounced
            // recalculation the state flip also schedules.
            expect(fixture.nativeElement.querySelectorAll('.kbq-overflow-item-hidden')).toHaveLength(0);
        });

        it('restores the original host styles and count visibility when mode switches back to count', async () => {
            hideLastItems(7);
            const fixture = await createOverflowFixture(TestOverflowHostComponent);
            const host: HTMLElement = getHost(fixture.debugElement);
            const list = fixture.debugElement.query(By.directive(KbqClampedList)).injector.get(KbqClampedList);

            expect(host.style.position).toBe('relative');
            expect(host.style.display).toBe('flex');

            fixture.componentInstance.mode.set('count');
            fixture.detectChanges();
            await flushDebounce();
            await fixture.whenStable();

            expect(host.style.position).toBe('');
            expect(host.style.overflow).toBe('');
            expect(host.style.display).toBe('');
            expect(list.visibleMap()).toEqual([
                ...Array(10).fill(true),
                ...Array(7).fill(false)
            ]);
            expect(list.exceededItemCount()).toBe(7);
            expect(fixture.nativeElement.querySelectorAll('.kbq-overflow-item-hidden')).toHaveLength(7);

            fixture.componentInstance.mode.set('overflow');
            fixture.detectChanges();
            await flushDebounce();
            await fixture.whenStable();

            expect(host.style.position).toBe('relative');
            expect(host.style.display).toBe('flex');
        });

        it('captures consumer host styles afresh for every overflow mode cycle', async () => {
            hideLastItems(7);
            const fixture = await createOverflowFixture(TestOverflowHostComponent);
            const host = getHost(fixture.debugElement);
            const setMode = async (mode: KbqClampedListMode) => {
                fixture.componentInstance.mode.set(mode);
                fixture.detectChanges();
                await flushDebounce();
                await fixture.whenStable();
            };

            await setMode('count');
            host.style.position = 'sticky';
            host.style.display = 'grid';
            host.style.overflow = 'auto';

            await setMode('overflow');
            expect(host.style.position).toBe('relative');
            expect(host.style.display).toBe('flex');
            expect(host.style.overflow).toBe('hidden');

            await setMode('count');
            expect(host.style.position).toBe('sticky');
            expect(host.style.display).toBe('grid');
            expect(host.style.overflow).toBe('auto');
        });

        describe('scrollOnCollapse', () => {
            const ITEM_HEIGHT = 10;

            /** Heights that differ between the collapsed and the expanded list, so the animation actually starts. */
            const mockListHeights = () =>
                vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
                    this: HTMLElement
                ) {
                    const hidden = this.querySelectorAll('.kbq-overflow-item-hidden').length;

                    return { height: (this.querySelectorAll('.item').length - hidden) * ITEM_HEIGHT } as DOMRect;
                });

            it('scrolls the host into view only after the collapse animation finishes', async () => {
                const { resolveFinished } = mockAnimate();

                mockListHeights();
                hideLastItems(7);
                const fixture = await createOverflowFixture(TestOverflowHostComponent);
                const scrollIntoView = vi.spyOn(Element.prototype, 'scrollIntoView');
                const trigger = getTrigger(fixture.debugElement).nativeElement;

                trigger.click();
                await fixture.whenStable();
                trigger.click();
                await fixture.whenStable();

                expect(scrollIntoView).not.toHaveBeenCalled();

                resolveFinished();
                await new Promise((resolve) => setTimeout(resolve));

                expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', inline: 'nearest' });
            });

            it('scrolls without animation when the user prefers reduced motion', async () => {
                mockReducedMotion();
                hideLastItems(7);
                const fixture = await createOverflowFixture(TestOverflowHostComponent);
                const scrollIntoView = vi.spyOn(Element.prototype, 'scrollIntoView');
                const trigger = getTrigger(fixture.debugElement).nativeElement;

                trigger.click();
                await fixture.whenStable();
                trigger.click();
                await fixture.whenStable();

                expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', inline: 'nearest' });
            });

            it('stays put when scrollOnCollapse is disabled', async () => {
                hideLastItems(7);
                const fixture = await createOverflowFixture(TestOverflowHostComponent);

                fixture.componentInstance.scrollOnCollapse.set(false);
                fixture.detectChanges();
                const scrollIntoView = vi.spyOn(Element.prototype, 'scrollIntoView');
                const trigger = getTrigger(fixture.debugElement).nativeElement;

                trigger.click();
                await fixture.whenStable();
                trigger.click();
                await fixture.whenStable();

                expect(scrollIntoView).not.toHaveBeenCalled();
            });
        });

        const expectInvalidFallback = async (component: Type<unknown>) => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const engine = vi.spyOn(KbqOverflowFitEngine.prototype, 'hideOverflownItems');
            const fixture = await createOverflowFixture(component);
            const list = fixture.debugElement.query(By.directive(KbqClampedList)).injector.get(KbqClampedList);

            expect(engine).not.toHaveBeenCalled();
            expect(warn).toHaveBeenCalledTimes(1);
            expect(warn).toHaveBeenCalledWith(expect.stringContaining('Count-based Collapse is used instead'));
            expect(list.visibleMap()).toEqual([
                ...Array(10).fill(true),
                ...Array(7).fill(false)
            ]);
            expect(list.exceededItemCount()).toBe(7);
            expect(list.visibleItems()).toHaveLength(10);
            expect(fixture.nativeElement.querySelectorAll('.kbq-overflow-item-hidden')).toHaveLength(7);

            emitResize(document.body);
            await flushDebounce();
            await fixture.whenStable();

            expect(engine).not.toHaveBeenCalled();
            expect(warn).toHaveBeenCalledTimes(1);
        };

        it('falls back to Count-based Collapse with a single warning when an item index is missing', async () => {
            await expectInvalidFallback(TestOverflowMissingIndexHostComponent);
            expect.hasAssertions();
        });

        it('falls back to Count-based Collapse with a single warning when an item index is duplicated', async () => {
            await expectInvalidFallback(TestOverflowDuplicateIndexHostComponent);
            expect.hasAssertions();
        });

        it('does not warn or measure a Count-based Collapse host without Overflow Items', async () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const engine = vi.spyOn(KbqOverflowFitEngine.prototype, 'hideOverflownItems');

            fixture.detectChanges();
            await fixture.whenStable();

            expect(warn).not.toHaveBeenCalled();
            expect(engine).not.toHaveBeenCalled();
        });

        // Kept last: rendering on the server platform breaks `TestBed.createComponent` for every spec declared
        // after this one in the file (the fixture comes back with a null `debugElement`).
        it('server-renders the initial hidden items without starting resize observers', async () => {
            const observe = vi.fn();
            const html = await renderApplication(
                ({ platformRef }) =>
                    bootstrapApplication(
                        TestOverflowHostComponent,
                        {
                            providers: [{ provide: SharedResizeObserver, useValue: { observe } }]
                        },
                        { platformRef }
                    ),
                { document: '<app-root></app-root>' }
            );

            expect((html.match(/kbq-overflow-item-hidden/g) ?? []).length).toBe(7);
            expect(observe).not.toHaveBeenCalled();
        });
    });
});

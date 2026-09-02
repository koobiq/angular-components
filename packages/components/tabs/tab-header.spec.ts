import { Direction, Directionality } from '@angular/cdk/bidi';
import { PortalModule } from '@angular/cdk/portal';
import { ScrollingModule, ViewportRuler } from '@angular/cdk/scrolling';
import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, flush, tick } from '@angular/core/testing';
import {
    END,
    ENTER,
    HOME,
    LEFT_ARROW,
    RIGHT_ARROW,
    SPACE,
    dispatchFakeEvent,
    dispatchKeyboardEvent
} from '@koobiq/components/core';
import { Subject } from 'rxjs';
import { KbqTabHeader } from './tab-header.component';
import { KbqTabLabelWrapper } from './tab-label-wrapper.directive';

describe('KbqTabHeader', () => {
    let dir: Direction = 'ltr';
    let change: Subject<Direction>;
    let fixture: ComponentFixture<SimpleTabHeaderApp>;
    let appComponent: SimpleTabHeaderApp;

    beforeEach(() => {
        change = new Subject();
        dir = 'ltr';
        TestBed.configureTestingModule({
            imports: [
                PortalModule,
                ScrollingModule,
                KbqTabHeader,
                KbqTabLabelWrapper,
                SimpleTabHeaderApp
            ],
            providers: [
                ViewportRuler,
                {
                    provide: Directionality,
                    useFactory: () => ({
                        value: dir,
                        change: change.asObservable()
                    })
                }
            ]
        }).compileComponents();
    });

    describe('focusing', () => {
        let tabListContainer: HTMLElement;

        beforeEach(() => {
            fixture = TestBed.createComponent(SimpleTabHeaderApp);
            fixture.detectChanges();

            appComponent = fixture.componentInstance;
            tabListContainer = appComponent.tabHeader().tabListContainer.nativeElement;
        });

        it('should initialize to the selected index', () => {
            fixture.detectChanges();
            expect(appComponent.tabHeader().focusIndex).toBe(appComponent.selectedIndex);
        });

        it('should update focusIndex when set', () => {
            appComponent.tabHeader().focusIndex = 2;
            fixture.detectChanges();
            expect(appComponent.tabHeader().focusIndex).toBe(2);
        });

        it('should not set focus to a disabled tab', () => {
            appComponent.tabHeader().focusIndex = 0;
            fixture.detectChanges();
            expect(appComponent.tabHeader().focusIndex).toBe(0);

            appComponent.tabHeader().focusIndex = appComponent.disabledTabIndex;
            fixture.detectChanges();
            expect(appComponent.tabHeader().focusIndex).toBe(0);
        });

        it('should move focus right and skip disabled tabs', () => {
            appComponent.tabHeader().focusIndex = 0;
            fixture.detectChanges();
            expect(appComponent.tabHeader().focusIndex).toBe(0);

            expect(appComponent.disabledTabIndex).toBe(1);
            dispatchKeyboardEvent(tabListContainer, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();
            expect(appComponent.tabHeader().focusIndex).toBe(2);

            dispatchKeyboardEvent(tabListContainer, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();
            expect(appComponent.tabHeader().focusIndex).toBe(3);
        });

        it('should move focus left and skip disabled tabs', () => {
            appComponent.tabHeader().focusIndex = 3;
            fixture.detectChanges();
            expect(appComponent.tabHeader().focusIndex).toBe(3);

            dispatchKeyboardEvent(tabListContainer, 'keydown', LEFT_ARROW);
            fixture.detectChanges();
            expect(appComponent.tabHeader().focusIndex).toBe(2);

            expect(appComponent.disabledTabIndex).toBe(1);
            dispatchKeyboardEvent(tabListContainer, 'keydown', LEFT_ARROW);
            fixture.detectChanges();
            expect(appComponent.tabHeader().focusIndex).toBe(0);
        });

        it('should support key down events to move and select focus', () => {
            appComponent.tabHeader().focusIndex = 0;
            fixture.detectChanges();
            expect(appComponent.tabHeader().focusIndex).toBe(0);

            dispatchKeyboardEvent(tabListContainer, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();
            expect(appComponent.tabHeader().focusIndex).toBe(2);

            expect(appComponent.selectedIndex).toBe(0);
            const enterEvent = dispatchKeyboardEvent(tabListContainer, 'keydown', ENTER);

            fixture.detectChanges();
            expect(appComponent.selectedIndex).toBe(2);
            expect(enterEvent.defaultPrevented).toBe(true);

            dispatchKeyboardEvent(tabListContainer, 'keydown', LEFT_ARROW);
            fixture.detectChanges();
            expect(appComponent.tabHeader().focusIndex).toBe(0);

            expect(appComponent.selectedIndex).toBe(2);
            const spaceEvent = dispatchKeyboardEvent(tabListContainer, 'keydown', SPACE);

            fixture.detectChanges();
            expect(appComponent.selectedIndex).toBe(0);
            expect(spaceEvent.defaultPrevented).toBe(true);
        });

        it('should move focus to the first tab when pressing HOME', () => {
            appComponent.tabHeader().focusIndex = 3;
            fixture.detectChanges();
            expect(appComponent.tabHeader().focusIndex).toBe(3);

            const event = dispatchKeyboardEvent(tabListContainer, 'keydown', HOME);

            fixture.detectChanges();

            expect(appComponent.tabHeader().focusIndex).toBe(0);
            expect(event.defaultPrevented).toBe(true);
        });

        it('should skip disabled items when moving focus using HOME', () => {
            appComponent.tabHeader().focusIndex = 3;
            appComponent.tabs[0].disabled = true;
            fixture.detectChanges();
            expect(appComponent.tabHeader().focusIndex).toBe(3);

            dispatchKeyboardEvent(tabListContainer, 'keydown', HOME);
            fixture.detectChanges();

            // Note that the second tab is disabled by default already.
            expect(appComponent.tabHeader().focusIndex).toBe(2);
        });

        it('should move focus to the last tab when pressing END', () => {
            appComponent.tabHeader().focusIndex = 0;
            fixture.detectChanges();
            expect(appComponent.tabHeader().focusIndex).toBe(0);

            const event = dispatchKeyboardEvent(tabListContainer, 'keydown', END);

            fixture.detectChanges();

            expect(appComponent.tabHeader().focusIndex).toBe(3);
            expect(event.defaultPrevented).toBe(true);
        });

        it('should skip disabled items when moving focus using END', () => {
            appComponent.tabHeader().focusIndex = 0;
            appComponent.tabs[3].disabled = true;
            fixture.detectChanges();
            expect(appComponent.tabHeader().focusIndex).toBe(0);

            dispatchKeyboardEvent(tabListContainer, 'keydown', END);
            fixture.detectChanges();

            expect(appComponent.tabHeader().focusIndex).toBe(2);
        });
    });

    describe('pagination', () => {
        describe('in LTR direction', () => {
            beforeEach(() => {
                dir = 'ltr';
                fixture = TestBed.createComponent(SimpleTabHeaderApp);
                fixture.detectChanges();

                appComponent = fixture.componentInstance;
            });

            it('should not show pagination when tab list fits container', () => {
                const header = appComponent.tabHeader();

                Object.defineProperty(header.tabList.nativeElement, 'scrollWidth', { configurable: true, value: 60 });
                Object.defineProperty(header.elementRef.nativeElement, 'offsetWidth', {
                    configurable: true,
                    value: 130
                });

                header.checkPaginationEnabled();
                fixture.detectChanges();

                expect(header.showPaginationControls).toBe(false);
            });

            it('should show pagination when tab list exceeds container', () => {
                const header = appComponent.tabHeader();

                Object.defineProperty(header.tabList.nativeElement, 'scrollWidth', { configurable: true, value: 240 });
                Object.defineProperty(header.elementRef.nativeElement, 'offsetWidth', {
                    configurable: true,
                    value: 130
                });

                header.checkPaginationEnabled();
                fixture.detectChanges();

                expect(header.showPaginationControls).toBe(true);
            });

            it('should scroll to show the focused tab label', () => {
                appComponent.addTabsForScrolling();
                fixture.detectChanges();
                expect(appComponent.tabHeader().scrollDistance).toBe(0);

                appComponent.tabHeader().focusIndex = appComponent.tabs.length - 1;
                fixture.detectChanges();
                expect(appComponent.tabHeader().scrollDistance).toBe(appComponent.tabHeader().getMaxScrollDistance());

                appComponent.tabHeader().focusIndex = 0;
                fixture.detectChanges();
                expect(appComponent.tabHeader().scrollDistance).toBe(0);
            });

            it('should align scroll header when tabs removed from end of the list', fakeAsync(() => {
                appComponent.addTabsForScrolling();
                fixture.detectChanges();
                expect(appComponent.tabHeader().scrollDistance).toBe(0);

                appComponent.tabHeader().focusIndex = appComponent.tabs.length - 1;
                fixture.detectChanges();
                const previousMaxScrollDistance = appComponent.tabHeader().getMaxScrollDistance();

                expect(appComponent.tabHeader().scrollDistance).toBe(previousMaxScrollDistance);

                appComponent.tabs.pop();
                fixture.detectChanges();
                tick(1000);

                const updatedMaxScrollDistance = appComponent.tabHeader().getMaxScrollDistance();

                expect(appComponent.tabHeader().scrollDistance).toBe(updatedMaxScrollDistance);
                expect(previousMaxScrollDistance > updatedMaxScrollDistance);

                flush();
            }));
        });

        describe('in RTL direction', () => {
            beforeEach(() => {
                dir = 'rtl';
                fixture = TestBed.createComponent(SimpleTabHeaderApp);
                appComponent = fixture.componentInstance;
                appComponent.dir = 'rtl';

                fixture.detectChanges();
            });

            it('should scroll to show the focused tab label', () => {
                appComponent.addTabsForScrolling();
                fixture.detectChanges();
                expect(appComponent.tabHeader().scrollDistance).toBe(0);

                appComponent.tabHeader().focusIndex = appComponent.tabs.length - 1;
                fixture.detectChanges();
                expect(appComponent.tabHeader().scrollDistance).toBe(appComponent.tabHeader().getMaxScrollDistance());

                appComponent.tabHeader().focusIndex = 0;
                fixture.detectChanges();
                expect(appComponent.tabHeader().scrollDistance).toBe(0);
            });
        });

        it('should update arrows when the window is resized', fakeAsync(() => {
            fixture = TestBed.createComponent(SimpleTabHeaderApp);

            const header = fixture.componentInstance.tabHeader();

            const checkPaginationEnabledSpyFn = jest.spyOn(header, 'checkPaginationEnabled');

            dispatchFakeEvent(window, 'resize');
            tick(10);
            fixture.detectChanges();

            expect(checkPaginationEnabledSpyFn).toHaveBeenCalled();
            discardPeriodicTasks();
        }));
    });

    describe('wheel and drag scrolling', () => {
        let header: KbqTabHeader;

        const createPointerEvent = (
            type: string,
            init: MouseEventInit & { pointerId?: number; pointerType?: string; timeStamp?: number } = {}
        ): PointerEvent => {
            const { pointerId = 1, pointerType = 'mouse', timeStamp, ...mouseInit } = init;
            const event = new MouseEvent(type, mouseInit);

            Object.defineProperties(event, {
                pointerId: { value: pointerId },
                pointerType: { value: pointerType },
                ...(timeStamp === undefined ? {} : { timeStamp: { value: timeStamp } })
            });

            return event as PointerEvent;
        };

        const enableOverflow = () => {
            Object.defineProperty(header.tabList.nativeElement, 'scrollWidth', { configurable: true, value: 400 });
            Object.defineProperty(header.tabListContainer.nativeElement, 'offsetWidth', {
                configurable: true,
                value: 100
            });
            Object.defineProperty(header.elementRef.nativeElement, 'offsetWidth', { configurable: true, value: 100 });
            header.updatePagination();
            fixture.detectChanges();
        };

        beforeEach(() => {
            dir = 'ltr';
            fixture = TestBed.createComponent(SimpleTabHeaderApp);
            fixture.detectChanges();

            appComponent = fixture.componentInstance;
            header = appComponent.tabHeader();
            enableOverflow();
        });

        it('should dim the previous/next arrows at each scroll bound without removing them', () => {
            const before = fixture.nativeElement.querySelector('.kbq-tab-header__pagination_before');
            const after = fixture.nativeElement.querySelector('.kbq-tab-header__pagination_after');

            expect(before.classList.contains('kbq-disabled')).toBe(true);
            expect(after.classList.contains('kbq-disabled')).toBe(false);

            header.scrollDistance = header.getMaxScrollDistance();
            fixture.detectChanges();

            expect(before.classList.contains('kbq-disabled')).toBe(false);
            expect(after.classList.contains('kbq-disabled')).toBe(true);
        });

        it('should scroll on touchpad horizontal wheel', () => {
            const event = new WheelEvent('wheel', { deltaX: 40, deltaY: 0 });
            const preventDefault = jest.spyOn(event, 'preventDefault');

            header.tabListContainer.nativeElement.dispatchEvent(event);

            expect(preventDefault).toHaveBeenCalled();
            expect(header.scrollDistance).toBe(40);
        });

        it('should NOT scroll on plain vertical wheel without shift', () => {
            const event = new WheelEvent('wheel', { deltaX: 0, deltaY: 40 });
            const preventDefault = jest.spyOn(event, 'preventDefault');

            header.tabListContainer.nativeElement.dispatchEvent(event);

            expect(preventDefault).not.toHaveBeenCalled();
            expect(header.scrollDistance).toBe(0);
        });

        it('should scroll on shift + mouse wheel', () => {
            const event = new WheelEvent('wheel', { deltaX: 0, deltaY: 40, shiftKey: true });
            const preventDefault = jest.spyOn(event, 'preventDefault');

            header.tabListContainer.nativeElement.dispatchEvent(event);

            expect(preventDefault).toHaveBeenCalled();
            expect(header.scrollDistance).toBe(40);
        });

        it('should not start a drag for small movement, allowing a normal click to select a tab', () => {
            const tabListContainer = header.tabListContainer.nativeElement;

            tabListContainer.dispatchEvent(createPointerEvent('pointerdown', { clientX: 0 }));
            document.dispatchEvent(createPointerEvent('pointermove', { clientX: 2 }));
            document.dispatchEvent(createPointerEvent('pointerup', { clientX: 2 }));

            expect(header.scrollDistance).toBe(0);

            const label = header.items.get(2)!.elementRef.nativeElement;

            label.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            fixture.detectChanges();

            expect(appComponent.selectedIndex).toBe(2);
        });

        it('should scroll while dragging past the threshold, and suppress the resulting click', () => {
            const tabListContainer = header.tabListContainer.nativeElement;

            tabListContainer.dispatchEvent(createPointerEvent('pointerdown', { clientX: 0 }));
            document.dispatchEvent(createPointerEvent('pointermove', { clientX: -20 }));

            expect(header.scrollDistance).toBe(20);

            document.dispatchEvent(createPointerEvent('pointerup', { clientX: -20 }));

            const label = header.items.get(2)!.elementRef.nativeElement;

            label.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            fixture.detectChanges();

            expect(appComponent.selectedIndex).toBe(0);
        });

        it('should not drag for touch pointers, leaving the existing touch/arrow interactions untouched', () => {
            const tabListContainer = header.tabListContainer.nativeElement;

            tabListContainer.dispatchEvent(createPointerEvent('pointerdown', { clientX: 0, pointerType: 'touch' }));
            document.dispatchEvent(createPointerEvent('pointermove', { clientX: -20, pointerType: 'touch' }));

            expect(header.scrollDistance).toBe(0);
        });

        it('should project a coasting target on release based on drag velocity, re-enabling the transition', () => {
            const tabListContainer = header.tabListContainer.nativeElement;

            tabListContainer.dispatchEvent(createPointerEvent('pointerdown', { clientX: 0, timeStamp: 0 }));
            document.dispatchEvent(createPointerEvent('pointermove', { clientX: -10, timeStamp: 0 }));

            expect(header.tabList.nativeElement.classList.contains('kbq-tab-list_no-transition')).toBe(true);

            document.dispatchEvent(createPointerEvent('pointermove', { clientX: -30, timeStamp: 50 }));

            expect(header.scrollDistance).toBe(30);

            document.dispatchEvent(createPointerEvent('pointerup', { clientX: -30, timeStamp: 50 }));

            // velocity over the retained samples = (-30 - 0) / (50 - 0) = -0.6 px/ms
            // target = 30 - (-0.6 * 200) = 150, within [0, 300] so it lands there untouched by clamping
            expect(header.tabList.nativeElement.classList.contains('kbq-tab-list_no-transition')).toBe(false);
            expect(header.scrollDistance).toBe(150);
        });

        it('should clamp the coasting target to the max scroll distance for a strong flick', () => {
            const tabListContainer = header.tabListContainer.nativeElement;

            tabListContainer.dispatchEvent(createPointerEvent('pointerdown', { clientX: 0, timeStamp: 0 }));
            document.dispatchEvent(createPointerEvent('pointermove', { clientX: -50, timeStamp: 0 }));
            document.dispatchEvent(createPointerEvent('pointermove', { clientX: -100, timeStamp: 10 }));
            document.dispatchEvent(createPointerEvent('pointerup', { clientX: -100, timeStamp: 10 }));

            expect(header.scrollDistance).toBe(header.getMaxScrollDistance());
        });
    });

    describe('activeTabOffset', () => {
        let header: KbqTabHeader;

        beforeEach(() => {
            fixture = TestBed.createComponent(SimpleTabHeaderApp);
            fixture.detectChanges();

            appComponent = fixture.componentInstance;
            header = appComponent.tabHeader();
        });

        describe('activeTabOffsetWidth', () => {
            it('subtracts TAB_PADDING * 2 from offsetWidth for text tabs', () => {
                const item = header.items.get(0)!;

                Object.defineProperty(item.elementRef.nativeElement, 'offsetWidth', { configurable: true, value: 120 });

                expect((header as any).activeTabOffsetWidth).toBe(96);
            });

            it('returns raw offsetWidth for icon-only tabs', () => {
                const item = header.items.get(0)!;

                Object.defineProperty(item.elementRef.nativeElement, 'offsetWidth', { configurable: true, value: 36 });
                (item as any).tab = { iconOnlyLabel: true };

                expect((header as any).activeTabOffsetWidth).toBe(36);
            });

            it('returns undefined when no item at selectedIndex', () => {
                appComponent.selectedIndex = 99;
                fixture.detectChanges();

                expect((header as any).activeTabOffsetWidth).toBeUndefined();
            });
        });

        describe('activeTabOffsetLeft', () => {
            it('adds TAB_PADDING to offsetLeft for text tabs', () => {
                appComponent.selectedIndex = 2;
                fixture.detectChanges();

                const item = header.items.get(2)!;

                Object.defineProperty(item.elementRef.nativeElement, 'offsetLeft', { configurable: true, value: 100 });

                expect((header as any).activeTabOffsetLeft).toBe(112);
            });

            it('handles negative offsetLeft for the first tab shifted by negative margin-inline-start', () => {
                const item = header.items.get(0)!;

                Object.defineProperty(item.elementRef.nativeElement, 'offsetLeft', { configurable: true, value: -12 });

                expect((header as any).activeTabOffsetLeft).toBe(0);
            });

            it('treats offsetLeft === 0 as a valid position and still adds TAB_PADDING', () => {
                const item = header.items.get(0)!;

                Object.defineProperty(item.elementRef.nativeElement, 'offsetLeft', { configurable: true, value: 0 });

                expect((header as any).activeTabOffsetLeft).toBe(12);
            });

            it('returns raw offsetLeft for icon-only tabs', () => {
                const item = header.items.get(0)!;

                Object.defineProperty(item.elementRef.nativeElement, 'offsetLeft', { configurable: true, value: -4 });
                (item as any).tab = { iconOnlyLabel: true };

                expect((header as any).activeTabOffsetLeft).toBe(-4);
            });

            it('returns undefined when no item at selectedIndex', () => {
                appComponent.selectedIndex = 99;
                fixture.detectChanges();

                expect((header as any).activeTabOffsetLeft).toBeUndefined();
            });
        });
    });
});

interface ITab {
    label: string;
    disabled?: boolean;
}

@Component({
    imports: [PortalModule, ScrollingModule, KbqTabHeader, KbqTabLabelWrapper],
    template: `
        <div [dir]="dir">
            <kbq-tab-header [selectedIndex]="selectedIndex" (selectFocusedIndex)="selectedIndex = $event">
                @for (tab of tabs; track tab) {
                    <div
                        class="label-content"
                        kbqTabLabelWrapper
                        style="min-width: 30px; width: 30px"
                        [disabled]="!!tab.disabled"
                        (click)="selectedIndex = $index"
                    >
                        {{ tab.label }}
                    </div>
                }
            </kbq-tab-header>
        </div>
    `,
    styles: [
        `
            :host {
                width: 130px;
            }
        `
    ]
})
class SimpleTabHeaderApp {
    selectedIndex: number = 0;
    disabledTabIndex = 1;
    tabs: ITab[] = [
        { label: 'tab one' },
        { label: 'tab one' },
        { label: 'tab one' },
        { label: 'tab one' }
    ];
    dir: Direction = 'ltr';

    readonly tabHeader = viewChild.required(KbqTabHeader);

    constructor() {
        this.tabs[this.disabledTabIndex].disabled = true;
    }

    addTabsForScrolling() {
        this.tabs.push({ label: 'new' }, { label: 'new' }, { label: 'new' }, { label: 'new' });
    }
}

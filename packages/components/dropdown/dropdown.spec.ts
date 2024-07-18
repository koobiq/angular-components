// tslint:disable:no-magic-numbers
// tslint:disable:prefer-array-literal
// tslint:disable:no-empty

import { FocusMonitor } from '@angular/cdk/a11y';
import { Direction, Directionality } from '@angular/cdk/bidi';
import { Overlay, OverlayContainer } from '@angular/cdk/overlay';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    NgZone,
    Output,
    Provider,
    QueryList,
    TemplateRef,
    Type,
    ViewChild,
    ViewChildren
} from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, inject, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DOWN_ARROW, ESCAPE, LEFT_ARROW, RIGHT_ARROW, TAB } from '@koobiq/cdk/keycodes';
import {
    MockNgZone,
    createKeyboardEvent,
    createMouseEvent,
    dispatchEvent,
    dispatchFakeEvent,
    dispatchKeyboardEvent,
    dispatchMouseEvent,
    patchElementFocus
} from '@koobiq/cdk/testing';
import { KbqTitleDirective } from '@koobiq/components/title';
import { KBQ_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER } from '@koobiq/components/tooltip';
import { Subject } from 'rxjs';
import { first } from 'rxjs/operators';
import {
    DropdownPositionX,
    DropdownPositionY,
    KBQ_DROPDOWN_DEFAULT_OPTIONS,
    KBQ_DROPDOWN_SCROLL_STRATEGY,
    KbqDropdown,
    KbqDropdownContent,
    KbqDropdownItem,
    KbqDropdownModule,
    KbqDropdownPanel,
    KbqDropdownTrigger,
    NESTED_PANEL_LEFT_PADDING,
    NESTED_PANEL_TOP_PADDING
} from './index';

const PANEL_SELECTOR = '.kbq-dropdown__panel';
const ITEM_SELECTOR = '[kbq-dropdown-item]';
const ENABLED_ITEM_SELECTOR = '[kbq-dropdown-item]:not(.kbq-disabled)';
const DISABLED_ITEM_SELECTOR = '[kbq-dropdown-item][disabled=true]';

describe('KbqDropdown', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let focusMonitor: FocusMonitor;

    function createComponent<T>(
        component: Type<T>,
        providers: Provider[] = [],
        declarations: any[] = []
    ): ComponentFixture<T> {
        TestBed.configureTestingModule({
            imports: [KbqDropdownModule, NoopAnimationsModule],
            declarations: [component, ...declarations],
            providers
        }).compileComponents();

        inject([OverlayContainer, FocusMonitor], (oc: OverlayContainer, fm: FocusMonitor) => {
            overlayContainer = oc;
            overlayContainerElement = oc.getContainerElement();
            focusMonitor = fm;
        })();

        return TestBed.createComponent<T>(component);
    }

    afterEach(inject([OverlayContainer], (currentOverlayContainer: OverlayContainer) => {
        // Since we're resetting the testing module in some of the tests,
        // we can potentially have multiple overlay containers.
        currentOverlayContainer.ngOnDestroy();
        overlayContainer.ngOnDestroy();
    }));

    it('should open the dropdown as an idempotent operation', () => {
        const fixture = createComponent(SimpleDropdown, [], []);
        fixture.detectChanges();
        expect(overlayContainerElement.textContent).toBe('');
        expect(() => {
            fixture.componentInstance.trigger.open();
            fixture.componentInstance.trigger.open();
            fixture.detectChanges();

            expect(overlayContainerElement.textContent).toContain('Item');
            expect(overlayContainerElement.textContent).toContain('Disabled');
        }).not.toThrowError();
    });

    it('should close the dropdown when a click occurs outside the dropdown', fakeAsync(() => {
        const fixture = createComponent(SimpleDropdown, [], []);
        fixture.detectChanges();
        fixture.componentInstance.trigger.open();

        const backdrop = <HTMLElement>overlayContainerElement.querySelector('.cdk-overlay-backdrop');
        backdrop.click();
        fixture.detectChanges();
        tick(500);

        expect(overlayContainerElement.textContent).toBe('');
    }));

    it('should be able to remove the backdrop', fakeAsync(() => {
        const fixture = createComponent(SimpleDropdown, [], []);
        fixture.detectChanges();

        fixture.componentInstance.dropdown.hasBackdrop = false;
        fixture.componentInstance.trigger.open();
        fixture.detectChanges();
        tick(500);

        expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop')).toBeFalsy();
    }));

    it('should be able to remove the backdrop on repeat openings', fakeAsync(() => {
        const fixture = createComponent(SimpleDropdown, [], []);
        fixture.detectChanges();

        fixture.componentInstance.trigger.open();
        fixture.detectChanges();
        tick(500);

        // Start off with a backdrop.
        expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop')).toBeTruthy();

        fixture.componentInstance.trigger.close();
        fixture.detectChanges();
        tick(500);

        // Change `hasBackdrop` after the first open.
        fixture.componentInstance.dropdown.hasBackdrop = false;
        fixture.detectChanges();

        // Reopen the dropdown.
        fixture.componentInstance.trigger.open();
        fixture.detectChanges();
        tick(500);

        expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop')).toBeFalsy();
    }));

    it('should restore focus to the trigger when the dropdown was opened by keyboard', fakeAsync(() => {
        const fixture = createComponent(SimpleDropdown, [], []);
        fixture.detectChanges();
        const triggerEl = fixture.componentInstance.triggerEl.nativeElement;

        // A click without a mousedown before it is considered a keyboard open.
        triggerEl.click();
        fixture.detectChanges();

        expect(overlayContainerElement.querySelector(PANEL_SELECTOR)).toBeTruthy();

        fixture.componentInstance.trigger.close();
        fixture.detectChanges();
        tick(500);
        fixture.detectChanges();

        expect(document.activeElement).toBe(triggerEl);
    }));

    it('should be able to set a custom class on the backdrop', fakeAsync(() => {
        const fixture = createComponent(SimpleDropdown, [], []);

        fixture.componentInstance.backdropClass = 'custom-backdrop';
        fixture.detectChanges();
        fixture.componentInstance.trigger.open();
        fixture.detectChanges();
        tick(500);

        const backdrop = <HTMLElement>overlayContainerElement.querySelector('.cdk-overlay-backdrop');

        expect(backdrop.classList).toContain('custom-backdrop');
    }));

    it('should restore focus to the root trigger when the dropdown was opened by mouse', fakeAsync(() => {
        const fixture = createComponent(SimpleDropdown, [], []);
        fixture.detectChanges();

        const triggerEl = fixture.componentInstance.triggerEl.nativeElement;
        dispatchFakeEvent(triggerEl, 'mousedown');
        triggerEl.click();
        fixture.detectChanges();

        expect(overlayContainerElement.querySelector(PANEL_SELECTOR)).toBeTruthy();

        fixture.componentInstance.trigger.close();
        fixture.detectChanges();
        tick(500);

        expect(document.activeElement).toBe(triggerEl);
    }));

    it('should restore focus to the root trigger when the dropdown was opened by touch', fakeAsync(() => {
        const fixture = createComponent(SimpleDropdown, [], []);
        fixture.detectChanges();

        const triggerEl = fixture.componentInstance.triggerEl.nativeElement;
        dispatchFakeEvent(triggerEl, 'touchstart');
        triggerEl.click();
        fixture.detectChanges();

        expect(overlayContainerElement.querySelector(PANEL_SELECTOR)).toBeTruthy();

        fixture.componentInstance.trigger.close();
        fixture.detectChanges();
        flush();

        expect(document.activeElement).toBe(triggerEl);
    }));

    it('should scroll the panel to the top on open, when it is scrollable', fakeAsync(() => {
        const fixture = createComponent(SimpleDropdown, [], []);
        fixture.detectChanges();

        // Add 50 items to make the dropdown scrollable
        fixture.componentInstance.extraItems = new Array(50).fill('Hello there');
        fixture.detectChanges();

        const triggerEl = fixture.componentInstance.triggerEl.nativeElement;
        dispatchFakeEvent(triggerEl, 'mousedown');
        triggerEl.click();
        fixture.detectChanges();

        // Flush due to the additional tick that is necessary for the FocusMonitor.
        flush();

        expect(overlayContainerElement.querySelector(PANEL_SELECTOR)!.scrollTop).toBe(0);
    }));

    it('should set the proper focus origin when restoring focus after opening by keyboard', fakeAsync(() => {
        const fixture = createComponent(SimpleDropdown, [], []);
        fixture.detectChanges();
        const triggerEl = fixture.componentInstance.triggerEl.nativeElement;

        patchElementFocus(triggerEl);
        focusMonitor.monitor(triggerEl, false);
        triggerEl.click(); // A click without a mousedown before it is considered a keyboard open.
        fixture.detectChanges();
        fixture.componentInstance.trigger.close();
        fixture.detectChanges();
        tick(500);
        fixture.detectChanges();

        expect(triggerEl.classList).toContain('cdk-program-focused');
        focusMonitor.stopMonitoring(triggerEl);
    }));

    it('should set the proper focus origin when restoring focus after opening by mouse', fakeAsync(() => {
        const fixture = createComponent(SimpleDropdown, [], []);
        fixture.detectChanges();
        const triggerEl = fixture.componentInstance.triggerEl.nativeElement;

        dispatchMouseEvent(triggerEl, 'mousedown');
        triggerEl.click();
        fixture.detectChanges();
        patchElementFocus(triggerEl);
        focusMonitor.monitor(triggerEl, false);
        fixture.componentInstance.trigger.close();
        fixture.detectChanges();
        tick(500);
        fixture.detectChanges();

        expect(triggerEl.classList).toContain('cdk-mouse-focused');
        focusMonitor.stopMonitoring(triggerEl);
    }));

    it('should set proper focus origin when right clicking on trigger, before opening by keyboard', fakeAsync(() => {
        const fixture = createComponent(SimpleDropdown, [], []);
        fixture.detectChanges();
        const triggerEl = fixture.componentInstance.triggerEl.nativeElement;

        patchElementFocus(triggerEl);
        focusMonitor.monitor(triggerEl, false);

        // Trigger a fake right click.
        dispatchEvent(triggerEl, createMouseEvent('mousedown', 50, 100, 2));

        // A click without a left button mousedown before it is considered a keyboard open.
        triggerEl.click();
        fixture.detectChanges();

        fixture.componentInstance.trigger.close();
        fixture.detectChanges();
        tick(500);
        fixture.detectChanges();

        expect(triggerEl.classList).toContain('cdk-program-focused');
        focusMonitor.stopMonitoring(triggerEl);
    }));

    it('should set the proper focus origin when restoring focus after opening by touch', fakeAsync(() => {
        const fixture = createComponent(SimpleDropdown, [], []);
        fixture.detectChanges();
        const triggerEl = fixture.componentInstance.triggerEl.nativeElement;

        dispatchMouseEvent(triggerEl, 'touchstart');
        triggerEl.click();
        fixture.detectChanges();
        patchElementFocus(triggerEl);
        focusMonitor.monitor(triggerEl, false);
        fixture.componentInstance.trigger.close();
        fixture.detectChanges();
        tick(500);
        fixture.detectChanges();
        flush();

        expect(triggerEl.classList).toContain('cdk-touch-focused');
        focusMonitor.stopMonitoring(triggerEl);
    }));

    it('should close the dropdown when pressing ESCAPE', fakeAsync(() => {
        const fixture = createComponent(SimpleDropdown, [], []);
        fixture.detectChanges();
        fixture.componentInstance.trigger.open();

        const panel = overlayContainerElement.querySelector(PANEL_SELECTOR)!;
        const event = createKeyboardEvent('keydown', ESCAPE);

        dispatchEvent(panel, event);
        fixture.detectChanges();
        tick(500);

        expect(overlayContainerElement.textContent).toBe('');
    }));

    it('should open a custom dropdown', () => {
        const fixture = createComponent(CustomDropdown, [], [CustomDropdownPanel]);
        fixture.detectChanges();
        expect(overlayContainerElement.textContent).toBe('');
        expect(() => {
            fixture.componentInstance.trigger.open();
            fixture.componentInstance.trigger.open();

            expect(overlayContainerElement.textContent).toContain('Custom Dropdown header');
            expect(overlayContainerElement.textContent).toContain('Custom Content');
        }).not.toThrowError();
    });

    it('should set the panel direction based on the trigger direction', () => {
        const fixture = createComponent(
            SimpleDropdown,
            [{ provide: Directionality, useFactory: () => ({ value: 'rtl' }) }],
            []
        );

        fixture.detectChanges();
        fixture.componentInstance.trigger.open();
        fixture.detectChanges();

        const boundingBox = overlayContainerElement.querySelector('.cdk-overlay-connected-position-bounding-box')!;
        expect(boundingBox.getAttribute('dir')).toEqual('rtl');
    });

    it('should update the panel direction if the trigger direction changes', () => {
        const dirProvider = { value: 'rtl' };
        const fixture = createComponent(
            SimpleDropdown,
            [{ provide: Directionality, useFactory: () => dirProvider }],
            []
        );

        fixture.detectChanges();
        fixture.componentInstance.trigger.open();
        fixture.detectChanges();

        let boundingBox = overlayContainerElement.querySelector('.cdk-overlay-connected-position-bounding-box')!;
        expect(boundingBox.getAttribute('dir')).toEqual('rtl');

        fixture.componentInstance.trigger.close();
        fixture.detectChanges();

        dirProvider.value = 'ltr';
        fixture.componentInstance.trigger.open();
        (fixture.componentInstance.trigger.dropdown as KbqDropdown).animationDone.pipe(first()).subscribe({
            next: undefined,
            error: undefined,
            complete: () => {
                fixture.detectChanges();

                boundingBox = overlayContainerElement.querySelector('.cdk-overlay-connected-position-bounding-box')!;
                expect(boundingBox.getAttribute('dir')).toEqual('ltr');
            }
        });
    });

    it('should transfer any custom classes from the host to the overlay', () => {
        const fixture = createComponent(SimpleDropdown, [], []);

        fixture.detectChanges();
        fixture.componentInstance.trigger.open();
        fixture.detectChanges();

        const dropdownEl = fixture.debugElement.query(By.css('kbq-dropdown')).nativeElement;
        const panel = overlayContainerElement.querySelector(PANEL_SELECTOR)!;

        expect(dropdownEl.classList).not.toContain('custom-one');
        expect(dropdownEl.classList).not.toContain('custom-two');

        expect(panel.classList).toContain('custom-one');
        expect(panel.classList).toContain('custom-two');
    });

    it('should not throw an error on destroy', () => {
        const fixture = createComponent(SimpleDropdown, [], []);
        expect(fixture.destroy.bind(fixture)).not.toThrow();
    });

    it('should be able to extract the dropdown item text', () => {
        const fixture = createComponent(SimpleDropdown, [], []);
        fixture.detectChanges();
        expect(fixture.componentInstance.items.first.getLabel()).toBe('Item');
    });

    it('should filter out non-text nodes when figuring out the label', () => {
        const fixture = createComponent(SimpleDropdown, [], []);
        fixture.detectChanges();
        expect(fixture.componentInstance.items.last.getLabel()).toBe('Item with an icon');
    });

    it('should set the proper focus origin when opening by mouse', fakeAsync(() => {
        const fixture = createComponent(SimpleDropdown, [], []);
        fixture.detectChanges();
        spyOn(fixture.componentInstance.items.first, 'focus').and.callThrough();

        const triggerEl = fixture.componentInstance.triggerEl.nativeElement;

        dispatchMouseEvent(triggerEl, 'mousedown');
        triggerEl.click();
        fixture.detectChanges();
        tick(500);

        // tslint:disable-next-line:no-unbound-method
        expect(fixture.componentInstance.items.first.focus).toHaveBeenCalledWith('mouse');
    }));

    it('should set the proper focus origin when opening by touch', fakeAsync(() => {
        const fixture = createComponent(SimpleDropdown, [], []);
        fixture.detectChanges();
        spyOn(fixture.componentInstance.items.first, 'focus').and.callThrough();

        const triggerEl = fixture.componentInstance.triggerEl.nativeElement;

        dispatchMouseEvent(triggerEl, 'touchstart');
        triggerEl.click();
        fixture.detectChanges();
        flush();

        // tslint:disable-next-line:no-unbound-method
        expect(fixture.componentInstance.items.first.focus).toHaveBeenCalledWith('touch');
    }));

    it('should close the dropdown when using the CloseScrollStrategy', fakeAsync(() => {
        // tslint:disable-next-line
        const scrolledSubject = new Subject();
        const fixture = createComponent(
            SimpleDropdown,
            [
                { provide: ScrollDispatcher, useFactory: () => ({ scrolled: () => scrolledSubject }) },
                {
                    provide: KBQ_DROPDOWN_SCROLL_STRATEGY,
                    deps: [Overlay],
                    useFactory: (overlay: Overlay) => () => overlay.scrollStrategies.close()
                }
            ],
            []
        );

        fixture.detectChanges();

        const trigger = fixture.componentInstance.trigger;

        trigger.open();
        fixture.detectChanges();

        expect(trigger.opened).toBe(true);

        scrolledSubject.next(null);
        tick(500);

        expect(trigger.opened).toBe(false);
    }));

    it('should switch to keyboard focus when using the keyboard after opening using the mouse', fakeAsync(() => {
        const fixture = createComponent(SimpleDropdown, [], []);

        fixture.detectChanges();
        fixture.componentInstance.triggerEl.nativeElement.click();
        fixture.detectChanges();

        const panel = document.querySelector(PANEL_SELECTOR)! as HTMLElement;
        const items: HTMLElement[] = Array.from(panel.querySelectorAll(`${PANEL_SELECTOR} ${ITEM_SELECTOR}`));

        items.forEach(patchElementFocus);

        tick(500);
        tick();
        fixture.detectChanges();
        expect(items.some((item) => item.classList.contains('cdk-keyboard-focused'))).toBe(false);

        dispatchKeyboardEvent(panel, 'keydown', DOWN_ARROW);
        fixture.detectChanges();

        // Flush due to the additional tick that is necessary for the FocusMonitor.
        flush();

        // We skip to the third item, because the second one is disabled.
        expect(items[2].classList).toContain('cdk-focused');
        expect(items[2].classList).toContain('cdk-keyboard-focused');
    }));

    it('should throw the correct error if the dropdown is not defined after init', () => {
        const fixture = createComponent(SimpleDropdown, [], []);
        fixture.detectChanges();

        fixture.componentInstance.trigger.dropdown = null!;
        fixture.detectChanges();

        expect(() => {
            fixture.componentInstance.trigger.open();
            fixture.detectChanges();
        }).toThrowError(/must pass in an kbq-dropdown instance/);
    });

    it('should be able to swap out a dropdown after the first time it is opened', fakeAsync(() => {
        const fixture = createComponent(DynamicPanelDropdown);
        fixture.detectChanges();
        expect(overlayContainerElement.textContent).toBe('');

        fixture.componentInstance.trigger.open();
        fixture.detectChanges();

        expect(overlayContainerElement.textContent).toContain('One');
        expect(overlayContainerElement.textContent).not.toContain('Two');

        fixture.componentInstance.trigger.close();
        fixture.detectChanges();
        tick(500);
        fixture.detectChanges();

        expect(overlayContainerElement.textContent).toBe('');

        fixture.componentInstance.trigger.dropdown = fixture.componentInstance.second;
        fixture.componentInstance.trigger.open();
        fixture.detectChanges();

        expect(overlayContainerElement.textContent).not.toContain('One');
        expect(overlayContainerElement.textContent).toContain('Two');

        fixture.componentInstance.trigger.close();
        fixture.detectChanges();
        tick(500);
        fixture.detectChanges();

        expect(overlayContainerElement.textContent).toBe('');
    }));

    it('should apply open state changes when parent uses onPush strategy', fakeAsync(() => {
        const fixture = createComponent(OnPushContainer, [], []);
        fixture.detectChanges();

        fixture.componentInstance.trigger.open();
        fixture.detectChanges();
        fixture.componentInstance.itemRef.nativeElement.click();
        fixture.detectChanges();
        tick(500);
        fixture.detectChanges();

        expect(fixture.componentInstance.triggerEl.nativeElement.classList.contains('kbq-pressed')).toBeFalsy();
    }));

    describe('lazy rendering', () => {
        it('should be able to render the dropdown content lazily', fakeAsync(() => {
            const fixture = createComponent(SimpleLazyDropdown);

            fixture.detectChanges();
            fixture.componentInstance.triggerEl.nativeElement.click();
            fixture.detectChanges();
            tick(500);

            const panel = overlayContainerElement.querySelector(PANEL_SELECTOR)!;

            expect(panel).withContext('Expected panel to be defined').toBeTruthy();

            expect(panel.textContent).withContext('Expected panel to have correct content').toContain('Another item');

            expect(fixture.componentInstance.trigger.opened).withContext('Expected dropdown to be open').toBe(true);
        }));

        it('should detach the lazy content when the dropdown is closed', fakeAsync(() => {
            const fixture = createComponent(SimpleLazyDropdown);

            fixture.detectChanges();
            fixture.componentInstance.trigger.open();
            fixture.detectChanges();
            tick(500);

            expect(overlayContainerElement.querySelectorAll('.kbq-dropdown__panel').length).toBeGreaterThan(0);

            fixture.componentInstance.trigger.close();
            fixture.detectChanges();
            tick(500);
            fixture.detectChanges();

            expect(overlayContainerElement.querySelectorAll('.kbq-dropdown__panel').length).toBe(0);
        }));

        it('should wait for the close animation to finish before considering the panel as closed', fakeAsync(() => {
            const fixture = createComponent(SimpleLazyDropdown);
            fixture.detectChanges();
            const trigger = fixture.componentInstance.trigger;

            expect(trigger.opened).withContext('Expected dropdown to start off closed').toBe(false);

            trigger.open();
            fixture.detectChanges();
            tick(500);

            expect(trigger.opened).withContext('Expected dropdown to be open').toBe(true);

            trigger.close();
            fixture.detectChanges();

            expect(trigger.opened)
                .withContext('Expected dropdown to be considered open while the close animation is running')
                .toBe(true);
            tick(500);
            fixture.detectChanges();

            expect(trigger.opened).withContext('Expected dropdown to be closed').toBe(false);
        }));

        it('should focus the first dropdown item when opening a lazy dropdown via keyboard', fakeAsync(() => {
            let zone: MockNgZone;
            const fixture = createComponent(SimpleLazyDropdown, [
                {
                    provide: NgZone,
                    useFactory: () => (zone = new MockNgZone())
                }
            ]);

            fixture.detectChanges();

            // A click without a mousedown before it is considered a keyboard open.
            fixture.componentInstance.triggerEl.nativeElement.click();
            fixture.detectChanges();
            tick(500);
            // tslint:disable-next-line
            zone!.simulateZoneExit();

            // Flush due to the additional tick that is necessary for the FocusMonitor.
            flush();

            const item = document.querySelector(`${PANEL_SELECTOR} ${ITEM_SELECTOR}`)!;

            expect(document.activeElement).withContext('Expected first item to be focused').toBe(item);
        }));

        it('should be able to open the same dropdown with a different context', fakeAsync(() => {
            const fixture = createComponent(LazyDropdownWithContext);

            fixture.detectChanges();
            fixture.componentInstance.triggerOne.open();
            fixture.detectChanges();
            tick(500);

            let item = overlayContainerElement.querySelector(`${PANEL_SELECTOR} ${ITEM_SELECTOR}`)!;

            expect(item.textContent!.trim()).toBe('one');

            fixture.componentInstance.triggerOne.close();
            fixture.detectChanges();
            tick(500);

            fixture.componentInstance.triggerTwo.open();
            fixture.detectChanges();
            tick(500);
            item = overlayContainerElement.querySelector(`${PANEL_SELECTOR} ${ITEM_SELECTOR}`)!;

            expect(item.textContent!.trim()).toBe('two');
        }));
    });

    describe('positions', () => {
        let fixture: ComponentFixture<PositionedDropdown>;
        let trigger: HTMLElement;

        beforeEach(() => {
            fixture = createComponent(PositionedDropdown);
            fixture.detectChanges();

            trigger = fixture.componentInstance.triggerEl.nativeElement;

            // Push trigger to the bottom edge of viewport,so it has space to open "above"
            trigger.style.position = 'fixed';
            trigger.style.top = '600px';

            // Push trigger to the right, so it has space to open "before"
            trigger.style.left = '100px';
        });

        it('should append kbq-dropdown-before if the x position is changed', () => {
            fixture.componentInstance.trigger.open();
            fixture.detectChanges();

            const panel = overlayContainerElement.querySelector(PANEL_SELECTOR) as HTMLElement;

            expect(panel.classList).toContain('kbq-dropdown-before');
            expect(panel.classList).not.toContain('kbq-dropdown-after');

            fixture.componentInstance.xPosition = 'after';
            fixture.detectChanges();

            expect(panel.classList).toContain('kbq-dropdown-after');
            expect(panel.classList).not.toContain('kbq-dropdown-before');
        });

        it('should append kbq-dropdown-above if the y position is changed', () => {
            fixture.componentInstance.trigger.open();
            fixture.detectChanges();

            const panel = overlayContainerElement.querySelector(PANEL_SELECTOR) as HTMLElement;

            expect(panel.classList).toContain('kbq-dropdown-above');
            expect(panel.classList).not.toContain('kbq-dropdown-below');

            fixture.componentInstance.yPosition = 'below';
            fixture.detectChanges();

            expect(panel.classList).toContain('kbq-dropdown-below');
            expect(panel.classList).not.toContain('kbq-dropdown-above');
        });

        it('should default to the "below" and "after" positions', () => {
            overlayContainer.ngOnDestroy();
            fixture.destroy();
            TestBed.resetTestingModule();

            const newFixture = createComponent(SimpleDropdown, [], []);

            newFixture.detectChanges();
            newFixture.componentInstance.trigger.open();
            newFixture.detectChanges();
            const panel = overlayContainerElement.querySelector(PANEL_SELECTOR) as HTMLElement;

            expect(panel.classList).toContain('kbq-dropdown-below');
            expect(panel.classList).toContain('kbq-dropdown-after');
        });
    });

    describe('fallback positions', () => {
        it('should fall back to "before" mode if "after" mode would not fit on screen', () => {
            const fixture = createComponent(SimpleDropdown, [], []);
            fixture.detectChanges();
            const trigger = fixture.componentInstance.triggerEl.nativeElement;

            // Push trigger to the right side of viewport, so it doesn't have space to open
            // in its default "after" position on the right side.
            trigger.style.position = 'fixed';
            trigger.style.right = '0';
            trigger.style.top = '200px';

            fixture.componentInstance.trigger.open();
            fixture.detectChanges();
            const overlayPane = getOverlayPane();
            const triggerRect = trigger.getBoundingClientRect();
            const overlayRect = overlayPane.getBoundingClientRect();

            // In "before" position, the right sides of the overlay and the origin are aligned.
            // To find the overlay left, subtract the dropdown width from the origin's right side.
            const expectedLeft = triggerRect.right - overlayRect.width;
            expect(Math.floor(overlayRect.left))
                .withContext(`Expected dropdown to open in "before" position if "after" position wouldn't fit.`)
                .toBe(Math.floor(expectedLeft));

            // The y-position of the overlay should be unaffected, as it can already fit vertically
            expect(Math.floor(overlayRect.top))
                .withContext(`Expected dropdown top position to be unchanged if it can fit in the viewport.`)
                .toBe(Math.floor(triggerRect.bottom));
        });

        it('should fall back to "above" mode if "below" mode would not fit on screen', () => {
            const fixture = createComponent(SimpleDropdown, [], []);
            fixture.detectChanges();
            const trigger = fixture.componentInstance.triggerEl.nativeElement;

            // Push trigger to the bottom part of viewport, so it doesn't have space to open
            // in its default "below" position below the trigger.
            trigger.style.position = 'fixed';
            trigger.style.bottom = '65px';

            fixture.componentInstance.trigger.open();
            fixture.detectChanges();
            const overlayPane = getOverlayPane();
            const triggerRect = trigger.getBoundingClientRect();
            const overlayRect = overlayPane.getBoundingClientRect();

            expect(Math.floor(overlayRect.bottom))
                .withContext(`Expected dropdown to open in "above" position if "below" position wouldn't fit.`)
                .toBe(Math.floor(triggerRect.top));

            // The x-position of the overlay should be unaffected, as it can already fit horizontally
            expect(Math.floor(overlayRect.left))
                .withContext(`Expected dropdown x position to be unchanged if it can fit in the viewport.`)
                .toBe(Math.floor(triggerRect.left));
        });

        it('should re-position dropdown on both axes if both defaults would not fit', () => {
            const fixture = createComponent(SimpleDropdown, [], []);
            fixture.detectChanges();
            const trigger = fixture.componentInstance.triggerEl.nativeElement;

            // push trigger to the bottom, right part of viewport, so it doesn't have space to open
            // in its default "after below" position.
            trigger.style.position = 'fixed';
            trigger.style.right = '0';
            trigger.style.bottom = '0';

            fixture.componentInstance.trigger.open();
            fixture.detectChanges();
            const overlayPane = getOverlayPane();
            const triggerRect = trigger.getBoundingClientRect();
            const overlayRect = overlayPane.getBoundingClientRect();

            const expectedLeft = triggerRect.right - overlayRect.width;

            expect(Math.floor(overlayRect.left))
                .withContext(`Expected dropdown to open in "before" position if "after" position wouldn't fit.`)
                .toBe(Math.floor(expectedLeft));

            expect(Math.floor(overlayRect.bottom))
                .withContext(`Expected dropdown to open in "above" position if "below" position wouldn't fit.`)
                .toBe(Math.floor(triggerRect.top));
        });

        it('should re-position a dropdown with custom position set', () => {
            const fixture = createComponent(PositionedDropdown);
            fixture.detectChanges();
            const trigger = fixture.componentInstance.triggerEl.nativeElement;

            fixture.componentInstance.trigger.open();
            fixture.detectChanges();
            const overlayPane = getOverlayPane();
            const triggerRect = trigger.getBoundingClientRect();
            const overlayRect = overlayPane.getBoundingClientRect();

            // As designated "before" position won't fit on screen, the dropdown should fall back
            // to "after" mode, where the left sides of the overlay and trigger are aligned.
            expect(Math.floor(overlayRect.left))
                .withContext(`Expected dropdown to open in "after" position if "before" position wouldn't fit.`)
                .toBe(Math.floor(triggerRect.left));

            // As designated "above" position won't fit on screen, the dropdown should fall back
            // to "below" mode, where the top edges of the overlay and trigger are aligned.
            expect(Math.floor(overlayRect.top))
                .withContext(`Expected dropdown to open in "below" position if "above" position wouldn't fit.`)
                .toBe(Math.floor(triggerRect.bottom));
        });

        function getOverlayPane(): HTMLElement {
            return overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
        }
    });

    describe('overlapping trigger', () => {
        /**
         * This test class is used to create components containing a dropdown.
         * It provides helpers to reposition the trigger, open the dropdown,
         * and access the trigger and overlay positions.
         * Additionally it can take any inputs for the dropdown wrapper component.
         *
         * Basic usage:
         * const subject = new OverlapSubject(MyComponent);
         * subject.open();
         */
        class OverlapSubject<T extends TestableDropdown> {
            readonly fixture: ComponentFixture<T>;
            readonly trigger: HTMLElement;

            constructor(ctor: new () => T, inputs: { [key: string]: any } = {}) {
                this.fixture = createComponent(ctor);
                Object.keys(inputs).forEach((key) => ((this.fixture.componentInstance as any)[key] = inputs[key]));
                this.fixture.detectChanges();
                this.trigger = this.fixture.componentInstance.triggerEl.nativeElement;
            }

            open() {
                this.fixture.componentInstance.trigger.open();
                this.fixture.detectChanges();
            }

            get overlayRect() {
                return this.getOverlayPane().getBoundingClientRect();
            }

            get triggerRect() {
                return this.trigger.getBoundingClientRect();
            }

            get dropdownPanel() {
                return overlayContainerElement.querySelector(PANEL_SELECTOR);
            }

            private getOverlayPane() {
                return overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
            }
        }

        let subject: OverlapSubject<OverlapDropdown>;
        describe('explicitly overlapping', () => {
            beforeEach(() => {
                subject = new OverlapSubject(OverlapDropdown, { overlapTriggerY: true });
            });

            it('positions the overlay below the trigger', () => {
                subject.open();

                // Since the dropdown is overlaying the trigger, the overlay top should be the trigger top.
                expect(Math.floor(subject.overlayRect.top))
                    .withContext(`Expected dropdown to open in default "below" position.`)
                    .toBe(Math.floor(subject.triggerRect.top));
            });
        });

        describe('not overlapping', () => {
            beforeEach(() => {
                subject = new OverlapSubject(OverlapDropdown, { overlapTriggerY: false });
            });

            it('positions the overlay below the trigger', () => {
                subject.open();

                // Since the dropdown is below the trigger, the overlay top should be the trigger bottom.
                expect(Math.floor(subject.overlayRect.top))
                    .withContext(`Expected dropdown to open directly below the trigger.`)
                    .toBe(Math.floor(subject.triggerRect.bottom));
            });

            it('supports above position fall back', () => {
                // Push trigger to the bottom part of viewport, so it doesn't have space to open
                // in its default "below" position below the trigger.
                subject.trigger.style.position = 'fixed';
                subject.trigger.style.bottom = '0';
                subject.open();

                // Since the dropdown is above the trigger, the overlay bottom should be the trigger top.
                expect(Math.floor(subject.overlayRect.bottom))
                    .withContext(`Expected dropdown to open in "above" position if "below" position wouldn't fit.`)
                    .toBe(Math.floor(subject.triggerRect.top));
            });

            it('repositions the origin to be below, so the dropdown opens from the trigger', () => {
                subject.open();
                subject.fixture.detectChanges();

                expect(subject.dropdownPanel!.classList).toContain('kbq-dropdown-below');
                expect(subject.dropdownPanel!.classList).not.toContain('kbq-dropdown-above');
            });
        });
    });

    describe('close event', () => {
        let fixture: ComponentFixture<SimpleDropdown>;

        beforeEach(() => {
            fixture = createComponent(SimpleDropdown, [], []);
            fixture.detectChanges();
            fixture.componentInstance.trigger.open();
            fixture.detectChanges();
        });

        it('should emit an event when an enabled dropdown item is clicked', () => {
            const dropdownItem = overlayContainerElement.querySelector(ENABLED_ITEM_SELECTOR) as HTMLElement;

            dropdownItem.click();
            fixture.detectChanges();

            expect(fixture.componentInstance.closeCallback).toHaveBeenCalledWith('click');
            expect(fixture.componentInstance.closeCallback).toHaveBeenCalledTimes(1);
        });

        it('should emit a close event when the backdrop is clicked', () => {
            const backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;

            backdrop.click();
            fixture.detectChanges();

            expect(fixture.componentInstance.closeCallback).toHaveBeenCalledWith(undefined);
            expect(fixture.componentInstance.closeCallback).toHaveBeenCalledTimes(1);
        });

        it('should emit an event when pressing ESCAPE', () => {
            const dropdown = overlayContainerElement.querySelector(PANEL_SELECTOR) as HTMLElement;

            dispatchKeyboardEvent(dropdown, 'keydown', ESCAPE);
            fixture.detectChanges();

            expect(fixture.componentInstance.closeCallback).toHaveBeenCalledWith('keydown');
            expect(fixture.componentInstance.closeCallback).toHaveBeenCalledTimes(1);
        });

        it('should complete the callback when the dropdown is destroyed', () => {
            const emitCallback = jasmine.createSpy('emit callback');
            const completeCallback = jasmine.createSpy('complete callback');

            fixture.componentInstance.dropdown.closed.subscribe(emitCallback, null, completeCallback);
            fixture.destroy();

            expect(emitCallback).toHaveBeenCalled();
            expect(emitCallback).toHaveBeenCalledTimes(1);
            expect(completeCallback).toHaveBeenCalled();
        });

        it('should not emit an event when a disabled dropdown item is clicked', () => {
            const disabledItem = overlayContainerElement.querySelector(DISABLED_ITEM_SELECTOR) as HTMLElement;

            disabledItem.click();
            fixture.detectChanges();

            expect(fixture.componentInstance.closeCallback).toHaveBeenCalledTimes(0);
        });
    });

    describe('nested dropdown', () => {
        let fixture: ComponentFixture<NestedDropdown>;
        let instance: NestedDropdown;
        let overlay: HTMLElement;
        const compileTestComponent = (direction: Direction = 'ltr') => {
            fixture = createComponent(NestedDropdown, [
                {
                    provide: Directionality,
                    useFactory: () => ({ value: direction })
                }
            ]);

            fixture.detectChanges();
            instance = fixture.componentInstance;
            overlay = overlayContainerElement;
        };

        it('should set the `isNested` flags on the triggers', () => {
            compileTestComponent();
            expect(instance.rootTrigger.isNested()).toBe(false);
            expect(instance.levelOneTrigger.isNested()).toBe(true);
            expect(instance.levelTwoTrigger.isNested()).toBe(true);
        });

        it('should set the `parentDropdown` on the nested dropdown instances', () => {
            compileTestComponent();
            instance.rootTriggerEl.nativeElement.click();
            fixture.detectChanges();

            instance.levelOneTrigger.open();
            fixture.detectChanges();

            instance.levelTwoTrigger.open();
            fixture.detectChanges();

            expect(instance.rootDropdown.parent).toBeFalsy();
            expect(instance.levelOneDropdown.parent).toBe(instance.rootDropdown);
            expect(instance.levelTwoDropdown.parent).toBe(instance.levelOneDropdown);
        });

        it('should pass the layout direction the nested dropdowns', () => {
            compileTestComponent('rtl');
            instance.rootTriggerEl.nativeElement.click();
            fixture.detectChanges();

            instance.levelOneTrigger.open();
            fixture.detectChanges();

            instance.levelTwoTrigger.open();
            fixture.detectChanges();

            expect(instance.rootDropdown.direction).toBe('rtl');
            expect(instance.levelOneDropdown.direction).toBe('rtl');
            expect(instance.levelTwoDropdown.direction).toBe('rtl');
        });

        it('should emit an event when the hover state of the dropdown items changes', () => {
            compileTestComponent();
            instance.rootTrigger.open();
            fixture.detectChanges();

            const spy = jasmine.createSpy('hover spy');
            const subscription = instance.rootDropdown.hovered().subscribe(spy);
            const dropdownItems = overlay.querySelectorAll('[kbq-dropdown-item]');

            dispatchMouseEvent(dropdownItems[0], 'mouseenter');
            fixture.detectChanges();

            expect(spy).toHaveBeenCalledTimes(1);

            dispatchMouseEvent(dropdownItems[1], 'mouseenter');
            fixture.detectChanges();

            expect(spy).toHaveBeenCalledTimes(2);

            subscription.unsubscribe();
        });

        it('should toggle a nested dropdown when its trigger is hovered', fakeAsync(() => {
            compileTestComponent();
            instance.rootTriggerEl.nativeElement.click();
            fixture.detectChanges();
            expect(overlay.querySelectorAll(PANEL_SELECTOR).length).withContext('Expected one open dropdown').toBe(1);

            const items = Array.from(overlay.querySelectorAll(`${PANEL_SELECTOR} ${ITEM_SELECTOR}`));
            const levelOneTrigger = overlay.querySelector('#level-one-trigger')!;

            dispatchMouseEvent(levelOneTrigger, 'mouseenter');
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(levelOneTrigger.classList)
                .withContext('Expected the trigger to be highlighted')
                .toContain('kbq-dropdown-item_highlighted');
            expect(overlay.querySelectorAll(PANEL_SELECTOR).length).withContext('Expected two open dropdowns').toBe(2);

            dispatchMouseEvent(items[items.indexOf(levelOneTrigger) + 1], 'mouseenter');
            fixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll(PANEL_SELECTOR).length).withContext('Expected one open dropdown').toBe(1);
            expect(levelOneTrigger.classList)
                .withContext('Expected the trigger to not be highlighted')
                .not.toContain('kbq-dropdown-item-highlighted');
        }));

        it('should close all the open nested dropdowns when the hover state is changed at the root', fakeAsync(() => {
            compileTestComponent();
            instance.rootTriggerEl.nativeElement.click();
            fixture.detectChanges();

            const items = Array.from(overlay.querySelectorAll(`${PANEL_SELECTOR} ${ITEM_SELECTOR}`));
            const levelOneTrigger = overlay.querySelector('#level-one-trigger')!;

            dispatchMouseEvent(levelOneTrigger, 'mouseenter');
            fixture.detectChanges();
            tick();

            const levelTwoTrigger = overlay.querySelector('#level-two-trigger')! as HTMLElement;
            dispatchMouseEvent(levelTwoTrigger, 'mouseenter');
            fixture.detectChanges();
            tick();

            expect(overlay.querySelectorAll(PANEL_SELECTOR).length)
                .withContext('Expected three open dropdowns')
                .toBe(3);

            dispatchMouseEvent(items[items.indexOf(levelOneTrigger) + 1], 'mouseenter');
            fixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll(PANEL_SELECTOR).length).withContext('Expected one open dropdown').toBe(1);
        }));

        it('should close nested dropdown when hovering over disabled sibling item', fakeAsync(() => {
            compileTestComponent();
            instance.rootTriggerEl.nativeElement.click();
            fixture.detectChanges();
            tick(500);

            const items = fixture.debugElement.queryAll(By.directive(KbqDropdownItem));

            dispatchFakeEvent(items[0].nativeElement, 'mouseenter');
            fixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll(PANEL_SELECTOR).length).withContext('Expected two open dropdowns').toBe(2);

            items[1].componentInstance.disabled = true;
            fixture.detectChanges();

            // Invoke the handler directly since the fake events are flaky on disabled elements.
            items[1].componentInstance.handleMouseEnter();
            fixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll(PANEL_SELECTOR).length).withContext('Expected one open dropdown').toBe(1);
        }));

        it('should not open nested dropdown when hovering over disabled trigger', fakeAsync(() => {
            compileTestComponent();
            instance.rootTriggerEl.nativeElement.click();
            fixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll(PANEL_SELECTOR).length).withContext('Expected one open dropdown').toBe(1);

            const item = fixture.debugElement.query(By.directive(KbqDropdownItem));

            item.componentInstance.disabled = true;
            fixture.detectChanges();

            // Invoke the handler directly since the fake events are flaky on disabled elements.
            item.componentInstance.handleMouseEnter();
            fixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll(PANEL_SELECTOR).length)
                .withContext('Expected to remain at one open dropdown')
                .toBe(1);
        }));

        it('should open and close a nested dropdown with arrow keys in ltr', fakeAsync(() => {
            compileTestComponent();
            instance.rootTriggerEl.nativeElement.click();
            fixture.detectChanges();

            expect(overlay.querySelectorAll(PANEL_SELECTOR).length).withContext('Expected one open dropdown').toBe(1);

            const levelOneTrigger = overlay.querySelector('#level-one-trigger')! as HTMLElement;

            dispatchKeyboardEvent(levelOneTrigger, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();

            const panels = overlay.querySelectorAll(PANEL_SELECTOR);

            expect(panels.length).withContext('Expected two open dropdowns').toBe(2);

            dispatchKeyboardEvent(panels[1], 'keydown', LEFT_ARROW);
            fixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll(PANEL_SELECTOR).length).toBe(1);
        }));

        it('should open and close a nested dropdown with the arrow keys in rtl', fakeAsync(() => {
            compileTestComponent('rtl');
            instance.rootTriggerEl.nativeElement.click();
            fixture.detectChanges();
            expect(overlay.querySelectorAll(PANEL_SELECTOR).length).withContext('Expected one open dropdown').toBe(1);

            const levelOneTrigger = overlay.querySelector('#level-one-trigger')! as HTMLElement;

            dispatchKeyboardEvent(levelOneTrigger, 'keydown', LEFT_ARROW);
            fixture.detectChanges();

            const panels = overlay.querySelectorAll(PANEL_SELECTOR);

            expect(panels.length).withContext('Expected two open dropdowns').toBe(2);

            dispatchKeyboardEvent(panels[1], 'keydown', RIGHT_ARROW);
            fixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll(PANEL_SELECTOR).length).toBe(1);
        }));

        it('should not do anything with the arrow keys for a top-level dropdown', () => {
            compileTestComponent();
            instance.rootTriggerEl.nativeElement.click();
            fixture.detectChanges();

            const dropdown = overlay.querySelector(PANEL_SELECTOR)!;

            dispatchKeyboardEvent(dropdown, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();

            expect(overlay.querySelectorAll(PANEL_SELECTOR).length)
                .withContext('Expected one dropdown to remain open')
                .toBe(1);

            dispatchKeyboardEvent(dropdown, 'keydown', LEFT_ARROW);
            fixture.detectChanges();

            expect(overlay.querySelectorAll(PANEL_SELECTOR).length)
                .withContext('Expected one dropdown to remain open')
                .toBe(1);
        });

        it('should close all of the dropdowns when the backdrop is clicked', fakeAsync(() => {
            compileTestComponent();
            instance.rootTriggerEl.nativeElement.click();
            fixture.detectChanges();

            instance.levelOneTrigger.open();
            fixture.detectChanges();

            instance.levelTwoTrigger.open();
            fixture.detectChanges();

            expect(overlay.querySelectorAll(PANEL_SELECTOR).length)
                .withContext('Expected three open dropdowns')
                .toBe(3);

            expect(overlay.querySelectorAll('.cdk-overlay-backdrop').length)
                .withContext('Expected one backdrop element')
                .toBe(1);

            expect(overlay.querySelectorAll(`${PANEL_SELECTOR}, .cdk-overlay-backdrop`)[0].classList)
                .withContext('Expected backdrop to be beneath all of the dropdowns')
                .toContain('cdk-overlay-backdrop');

            (overlay.querySelector('.cdk-overlay-backdrop')! as HTMLElement).click();
            fixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll(PANEL_SELECTOR).length).withContext('Expected no open dropdowns').toBe(0);
        }));

        it('should shift focus between the nested dropdowns', fakeAsync(() => {
            compileTestComponent();
            instance.rootTrigger.open();
            fixture.detectChanges();

            expect(overlay.querySelector(PANEL_SELECTOR)!.contains(document.activeElement))
                .withContext('Expected focus to be inside the root dropdown')
                .toBe(true);

            instance.levelOneTrigger.open();
            fixture.detectChanges();

            expect(overlay.querySelectorAll(PANEL_SELECTOR)[1].contains(document.activeElement))
                .withContext('Expected focus to be inside the first nested dropdown')
                .toBe(true);

            instance.levelTwoTrigger.open();
            fixture.detectChanges();

            expect(overlay.querySelectorAll(PANEL_SELECTOR)[2].contains(document.activeElement))
                .withContext('Expected focus to be inside the second nested dropdown')
                .toBe(true);

            instance.levelTwoTrigger.close();
            fixture.detectChanges();
            flush();

            expect(overlay.querySelectorAll(PANEL_SELECTOR)[1].contains(document.activeElement))
                .withContext('Expected focus to be back inside the first nested dropdown')
                .toBe(true);

            instance.levelOneTrigger.close();
            fixture.detectChanges();
            flush();

            expect(overlay.querySelector(PANEL_SELECTOR)!.contains(document.activeElement))
                .withContext('Expected focus to be back inside the root dropdown')
                .toBe(true);
        }));

        it('should position the nested dropdown to the right edge of the trigger in ltr', () => {
            compileTestComponent();
            instance.rootTriggerEl.nativeElement.style.position = 'fixed';
            instance.rootTriggerEl.nativeElement.style.left = '50px';
            instance.rootTriggerEl.nativeElement.style.top = '50px';
            instance.rootTrigger.open();
            fixture.detectChanges();

            instance.levelOneTrigger.open();
            fixture.detectChanges();

            const triggerRect = overlay.querySelector('#level-one-trigger')!.getBoundingClientRect();
            const panelRect = overlay.querySelectorAll('.cdk-overlay-pane')[1].getBoundingClientRect();

            expect(Math.round(triggerRect.right)).toBe(Math.round(panelRect.left) + NESTED_PANEL_LEFT_PADDING);
            expect(Math.round(triggerRect.top)).toBe(Math.round(panelRect.top) + NESTED_PANEL_TOP_PADDING);
        });

        it('should fall back to aligning to the left edge of the trigger in ltr', () => {
            compileTestComponent();
            instance.rootTriggerEl.nativeElement.style.position = 'fixed';
            instance.rootTriggerEl.nativeElement.style.right = '10px';
            instance.rootTriggerEl.nativeElement.style.top = '50%';
            instance.rootTrigger.open();
            fixture.detectChanges();

            instance.levelOneTrigger.open();
            fixture.detectChanges();

            const triggerRect = overlay.querySelector('#level-one-trigger')!.getBoundingClientRect();
            const panelRect = overlay.querySelectorAll('.cdk-overlay-pane')[1].getBoundingClientRect();

            expect(Math.round(triggerRect.left)).toBe(Math.round(panelRect.right) - NESTED_PANEL_LEFT_PADDING);
            expect(Math.round(triggerRect.top)).toBe(Math.round(panelRect.top) + NESTED_PANEL_TOP_PADDING);
        });

        it('should position the nested dropdown to the left edge of the trigger in rtl', () => {
            compileTestComponent('rtl');
            instance.rootTriggerEl.nativeElement.style.position = 'fixed';
            instance.rootTriggerEl.nativeElement.style.left = '50%';
            instance.rootTriggerEl.nativeElement.style.top = '50%';
            instance.rootTrigger.open();
            fixture.detectChanges();

            instance.levelOneTrigger.open();
            fixture.detectChanges();

            const triggerRect = overlay.querySelector('#level-one-trigger')!.getBoundingClientRect();
            const panelRect = overlay.querySelectorAll('.cdk-overlay-pane')[1].getBoundingClientRect();

            expect(Math.round(triggerRect.left)).toBe(Math.round(panelRect.right) + NESTED_PANEL_LEFT_PADDING);
            expect(Math.round(triggerRect.top)).toBe(Math.round(panelRect.top) + NESTED_PANEL_TOP_PADDING);
        });

        it('should fall back to aligning to the right edge of the trigger in rtl', fakeAsync(() => {
            compileTestComponent('rtl');
            instance.rootTriggerEl.nativeElement.style.position = 'fixed';
            instance.rootTriggerEl.nativeElement.style.left = '10px';
            instance.rootTriggerEl.nativeElement.style.top = '50%';
            instance.rootTrigger.open();
            fixture.detectChanges();
            tick(500);

            instance.levelOneTrigger.open();
            fixture.detectChanges();
            tick(500);

            const triggerRect = overlay.querySelector('#level-one-trigger')!.getBoundingClientRect();
            const panelRect = overlay.querySelectorAll('.cdk-overlay-pane')[1].getBoundingClientRect();

            expect(Math.round(triggerRect.right)).toBe(Math.round(panelRect.left) - NESTED_PANEL_LEFT_PADDING);
            expect(Math.round(triggerRect.top)).toBe(Math.round(panelRect.top) + NESTED_PANEL_TOP_PADDING);
        }));

        it('should close all of the dropdowns when an item is clicked', fakeAsync(() => {
            compileTestComponent();
            instance.rootTriggerEl.nativeElement.click();
            fixture.detectChanges();

            instance.levelOneTrigger.open();
            fixture.detectChanges();

            instance.levelTwoTrigger.open();
            fixture.detectChanges();

            const dropdowns = overlay.querySelectorAll(PANEL_SELECTOR);

            expect(dropdowns.length).withContext('Expected three open dropdowns').toBe(3);

            (dropdowns[2].querySelector('[kbq-dropdown-item]')! as HTMLElement).click();
            fixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll(PANEL_SELECTOR).length).withContext('Expected no open dropdowns').toBe(0);
        }));

        it('should close all of the dropdowns when the user tabs away', fakeAsync(() => {
            compileTestComponent();
            instance.rootTriggerEl.nativeElement.click();
            fixture.detectChanges();

            instance.levelOneTrigger.open();
            fixture.detectChanges();

            instance.levelTwoTrigger.open();
            fixture.detectChanges();

            const dropdowns = overlay.querySelectorAll(PANEL_SELECTOR);

            expect(dropdowns.length).withContext('Expected three open dropdowns').toBe(3);

            dispatchKeyboardEvent(dropdowns[dropdowns.length - 1], 'keydown', TAB);
            fixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll(PANEL_SELECTOR).length).withContext('Expected no open dropdowns').toBe(0);
        }));

        it('should close all of the dropdowns when the root is closed programmatically', fakeAsync(() => {
            compileTestComponent();
            instance.rootTrigger.open();
            fixture.detectChanges();

            instance.levelOneTrigger.open();
            fixture.detectChanges();

            instance.levelTwoTrigger.open();
            fixture.detectChanges();

            const dropdowns = overlay.querySelectorAll(PANEL_SELECTOR);

            expect(dropdowns.length).withContext('Expected three open dropdowns').toBe(3);

            instance.rootTrigger.close();
            fixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll(PANEL_SELECTOR).length).withContext('Expected no open dropdowns').toBe(0);
        }));

        it('should toggle a nested dropdown when its trigger is added after init', fakeAsync(() => {
            compileTestComponent();
            instance.rootTriggerEl.nativeElement.click();
            fixture.detectChanges();
            tick(500);
            expect(overlay.querySelectorAll(PANEL_SELECTOR).length).withContext('Expected one open dropdown').toBe(1);

            instance.showLazy = true;
            fixture.detectChanges();

            const lazyTrigger = overlay.querySelector('#lazy-trigger')!;

            dispatchMouseEvent(lazyTrigger, 'mouseenter');
            fixture.detectChanges();
            tick(500);
            fixture.detectChanges();

            expect(lazyTrigger.classList)
                .withContext('Expected the trigger to be highlighted')
                .toContain('kbq-dropdown-item_highlighted');

            expect(overlay.querySelectorAll(PANEL_SELECTOR).length).withContext('Expected two open dropdowns').toBe(2);
        }));

        it('should prevent the default mousedown action if the dropdown item opens a nested dropdown', () => {
            compileTestComponent();
            instance.rootTrigger.open();
            fixture.detectChanges();

            const event = createMouseEvent('mousedown');

            Object.defineProperty(event, 'buttons', { get: () => 1 });
            event.preventDefault = jasmine.createSpy('preventDefault spy');

            dispatchMouseEvent(overlay.querySelector('[kbq-dropdown-item]')!, 'mousedown', 0, 0, event);
            // tslint:disable-next-line: no-unbound-method
            expect(event.preventDefault).toHaveBeenCalled();
        });

        it('should handle the items being rendered in a repeater', fakeAsync(() => {
            const repeaterFixture = createComponent(NestedDropdownRepeater);
            overlay = overlayContainerElement;

            expect(() => repeaterFixture.detectChanges()).not.toThrow();

            repeaterFixture.componentInstance.rootTriggerEl.nativeElement.click();
            repeaterFixture.detectChanges();
            tick(500);
            expect(overlay.querySelectorAll(PANEL_SELECTOR).length).withContext('Expected one open dropdown').toBe(1);

            dispatchMouseEvent(overlay.querySelector('.level-one-trigger')!, 'mouseenter');
            repeaterFixture.detectChanges();
            tick(500);
            expect(overlay.querySelectorAll(PANEL_SELECTOR).length).withContext('Expected two open dropdowns').toBe(2);
        }));

        it('should be able to trigger the same nested dropdown from different triggers', fakeAsync(() => {
            const repeaterFixture = createComponent(NestedDropdownRepeater);
            overlay = overlayContainerElement;

            repeaterFixture.detectChanges();
            repeaterFixture.componentInstance.rootTriggerEl.nativeElement.click();
            repeaterFixture.detectChanges();
            tick(500);
            expect(overlay.querySelectorAll(PANEL_SELECTOR).length).withContext('Expected one open dropdown').toBe(1);

            const triggers = overlay.querySelectorAll('.level-one-trigger');

            dispatchMouseEvent(triggers[0], 'mouseenter');
            repeaterFixture.detectChanges();
            tick(500);
            expect(overlay.querySelectorAll(PANEL_SELECTOR).length).withContext('Expected two open dropdowns').toBe(2);

            dispatchMouseEvent(triggers[1], 'mouseenter');
            repeaterFixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll(PANEL_SELECTOR).length).withContext('Expected two open dropdowns').toBe(2);
        }));

        it('should close the initial dropdown if the user moves away while animating', fakeAsync(() => {
            const repeaterFixture = createComponent(NestedDropdownRepeater);
            overlay = overlayContainerElement;

            repeaterFixture.detectChanges();
            repeaterFixture.componentInstance.rootTriggerEl.nativeElement.click();
            repeaterFixture.detectChanges();
            tick(500);
            expect(overlay.querySelectorAll(PANEL_SELECTOR).length).withContext('Expected one open dropdown').toBe(1);

            const triggers = overlay.querySelectorAll('.level-one-trigger');

            dispatchMouseEvent(triggers[0], 'mouseenter');
            repeaterFixture.detectChanges();
            tick(100);
            dispatchMouseEvent(triggers[1], 'mouseenter');
            repeaterFixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll(PANEL_SELECTOR).length).withContext('Expected two open dropdowns').toBe(2);
        }));

        it('should be able to open a nested dropdown through an item that is not a direct descendant of the panel', fakeAsync(() => {
            const nestedFixture = createComponent(NestedDropdownDeclaredInsideParentDropdown);

            overlay = overlayContainerElement;

            nestedFixture.detectChanges();
            nestedFixture.componentInstance.rootTriggerEl.nativeElement.click();
            nestedFixture.detectChanges();
            tick(500);
            expect(overlay.querySelectorAll(PANEL_SELECTOR).length).withContext('Expected one open dropdown').toBe(1);

            dispatchMouseEvent(overlay.querySelector('.level-one-trigger')!, 'mouseenter');
            nestedFixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll(PANEL_SELECTOR).length).withContext('Expected two open dropdowns').toBe(2);
        }));

        it('should not close when hovering over a dropdown item inside a nested dropdown panel that is declared inside the root dropdown', fakeAsync(() => {
            const nestedFixture = createComponent(NestedDropdownDeclaredInsideParentDropdown);

            overlay = overlayContainerElement;

            nestedFixture.detectChanges();
            nestedFixture.componentInstance.rootTriggerEl.nativeElement.click();
            nestedFixture.detectChanges();
            tick(500);
            expect(overlay.querySelectorAll(PANEL_SELECTOR).length).withContext('Expected one open dropdown').toBe(1);

            dispatchMouseEvent(overlay.querySelector('.level-one-trigger')!, 'mouseenter');
            nestedFixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll(PANEL_SELECTOR).length).withContext('Expected two open dropdowns').toBe(2);

            dispatchMouseEvent(overlay.querySelector('.level-two-item')!, 'mouseenter');
            nestedFixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll(PANEL_SELECTOR).length)
                .withContext('Expected two open dropdowns to remain')
                .toBe(2);
        }));

        it('should not re-focus a child dropdown trigger when hovering another trigger', fakeAsync(() => {
            compileTestComponent();

            dispatchFakeEvent(instance.rootTriggerEl.nativeElement, 'mousedown');
            instance.rootTriggerEl.nativeElement.click();
            fixture.detectChanges();

            const items = Array.from(overlay.querySelectorAll(`${PANEL_SELECTOR} ${ITEM_SELECTOR}`));
            const levelOneTrigger = overlay.querySelector('#level-one-trigger')!;

            dispatchMouseEvent(levelOneTrigger, 'mouseenter');
            fixture.detectChanges();
            tick();
            expect(overlay.querySelectorAll(PANEL_SELECTOR).length).withContext('Expected two open dropdowns').toBe(2);

            dispatchMouseEvent(items[items.indexOf(levelOneTrigger) + 1], 'mouseenter');
            fixture.detectChanges();
            tick(500);

            expect(document.activeElement)
                .withContext('Expected focus not to be returned to the initial trigger.')
                .not.toBe(levelOneTrigger);
        }));
    });

    describe('with KbqTitle directive', () => {
        let fixture: ComponentFixture<DropdownWithTooltip>;

        beforeEach(() => {
            fixture = createComponent(
                DropdownWithTooltip,
                [KBQ_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER],
                [KbqTitleDirective]
            );
            fixture.detectChanges();
            fixture.componentInstance.trigger.open();
            fixture.detectChanges();
        });

        it('should display tooltip if text is overflown', fakeAsync(() => {
            const dropdownItems: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('[kbq-title]');

            dispatchMouseEvent(dropdownItems[0], 'mouseenter');
            fixture.detectChanges();
            flush();

            const tooltipInstance = overlayContainerElement.querySelector('.kbq-tooltip');

            expect(tooltipInstance).not.toBeNull();
        }));

        it('should NOT display tooltip if text is NOT overflown', fakeAsync(() => {
            const dropdownItems: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('[kbq-title]');

            dispatchMouseEvent(dropdownItems[1], 'mouseenter');
            fixture.detectChanges();
            flush();

            const tooltipInstance = overlayContainerElement.querySelector('.kbq-tooltip');

            expect(tooltipInstance).toBeNull();
        }));

        it('should display tooltip if text is complex and overflown', fakeAsync(() => {
            const dropdownItems: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('[kbq-title]');

            dispatchMouseEvent(dropdownItems[2], 'mouseenter');
            fixture.detectChanges();
            flush();

            const tooltipInstance = overlayContainerElement.querySelector('.kbq-tooltip');

            expect(tooltipInstance).not.toBeNull();
        }));

        it('should NOT display tooltip if text is complex and is NOT overflown', fakeAsync(() => {
            const dropdownItems: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('[kbq-title]');

            dispatchMouseEvent(dropdownItems[3], 'mouseenter');
            fixture.detectChanges();
            flush();

            const tooltipInstance = overlayContainerElement.querySelector('.kbq-tooltip');

            expect(tooltipInstance).toBeNull();
        }));
    });
});

describe('KbqDropdown default overrides', () => {
    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [KbqDropdownModule, NoopAnimationsModule],
            declarations: [SimpleDropdown],
            providers: [
                {
                    provide: KBQ_DROPDOWN_DEFAULT_OPTIONS,
                    useValue: { overlapTriggerY: true, xPosition: 'before', yPosition: 'above' }
                }
            ]
        }).compileComponents();
    }));

    it('should allow for the default dropdown options to be overridden', () => {
        const fixture = TestBed.createComponent(SimpleDropdown);
        fixture.detectChanges();
        const dropdown = fixture.componentInstance.dropdown;

        expect(dropdown.overlapTriggerY).toBe(true);
        expect(dropdown.xPosition).toBe('before');
        expect(dropdown.yPosition).toBe('above');
    });
});

@Component({
    template: `
        <button [kbqDropdownTriggerFor]="dropdown" #triggerEl>Toggle dropdown</button>
        <kbq-dropdown
            #dropdown="kbqDropdown"
            class="custom-one custom-two"
            (closed)="closeCallback($event)"
            [backdropClass]="backdropClass"
            [hasBackdrop]="true"
        >
            <button kbq-dropdown-item>Item</button>
            <button kbq-dropdown-item disabled>Disabled</button>
            <button kbq-dropdown-item>
                <i class="kbq-icon">unicorn</i>
                Item with an icon
            </button>
            <button *ngFor="let item of extraItems" kbq-dropdown-item>{{ item }}</button>
        </kbq-dropdown>
    `
})
class SimpleDropdown {
    @ViewChild(KbqDropdownTrigger, { static: false }) trigger: KbqDropdownTrigger;
    @ViewChild('triggerEl', { static: false }) triggerEl: ElementRef<HTMLElement>;
    @ViewChild(KbqDropdown, { static: false }) dropdown: KbqDropdown;
    @ViewChildren(KbqDropdownItem) items: QueryList<KbqDropdownItem>;
    extraItems: string[] = [];
    closeCallback = jasmine.createSpy('dropdown closed callback', (name: string | undefined) => name);
    backdropClass: string;
}

@Component({
    template: `
        <button [kbqDropdownTriggerFor]="dropdown" #triggerEl>Toggle dropdown</button>
        <kbq-dropdown [xPosition]="xPosition" [yPosition]="yPosition" #dropdown="kbqDropdown">
            <button kbq-dropdown-item>Positioned Content</button>
        </kbq-dropdown>
    `
})
class PositionedDropdown {
    @ViewChild(KbqDropdownTrigger, { static: false }) trigger: KbqDropdownTrigger;
    @ViewChild('triggerEl', { static: false }) triggerEl: ElementRef<HTMLElement>;
    xPosition: DropdownPositionX = 'before';
    yPosition: DropdownPositionY = 'above';
}

// tslint:disable-next-line: naming-convention
interface TestableDropdown {
    trigger: KbqDropdownTrigger;
    triggerEl: ElementRef<HTMLElement>;
}

@Component({
    template: `
        <button [kbqDropdownTriggerFor]="dropdown" #triggerEl>Toggle dropdown</button>
        <kbq-dropdown [overlapTriggerY]="overlapTriggerY" #dropdown="kbqDropdown">
            <button kbq-dropdown-item>Not overlapped Content</button>
        </kbq-dropdown>
    `
})
class OverlapDropdown implements TestableDropdown {
    @Input() overlapTriggerY: boolean;
    @ViewChild(KbqDropdownTrigger, { static: false }) trigger: KbqDropdownTrigger;
    @ViewChild('triggerEl', { static: false }) triggerEl: ElementRef<HTMLElement>;
}

@Component({
    selector: 'custom-dropdown',
    template: `
        <ng-template>
            Custom Dropdown header
            <ng-content></ng-content>
        </ng-template>
    `,
    exportAs: 'appCustomDropdown'
})
class CustomDropdownPanel implements KbqDropdownPanel {
    direction: Direction;
    xPosition: DropdownPositionX = 'after';
    yPosition: DropdownPositionY = 'below';
    overlapTriggerX = true;
    overlapTriggerY = true;
    parent: KbqDropdownPanel;

    @ViewChild(TemplateRef, { static: false }) templateRef: TemplateRef<any>;
    @Output() closed = new EventEmitter<void | 'click' | 'keydown' | 'tab'>();
    backdropClass: string;
    hasBackdrop: boolean;
    lazyContent: KbqDropdownContent;
    focusFirstItem = () => {};
    resetActiveItem = () => {};
    setPositionClasses = () => {};

    addItem(): void {}

    removeItem(): void {}
}

@Component({
    template: `
        <button [kbqDropdownTriggerFor]="dropdown">Toggle dropdown</button>
        <custom-dropdown #dropdown="appCustomDropdown">
            <button kbq-dropdown-item>Custom Content</button>
        </custom-dropdown>
    `
})
class CustomDropdown {
    @ViewChild(KbqDropdownTrigger, { static: false }) trigger: KbqDropdownTrigger;
}

@Component({
    template: `
        <button [kbqDropdownTriggerFor]="root" #rootTrigger="kbqDropdownTrigger" #rootTriggerEl>Toggle dropdown</button>

        <button [kbqDropdownTriggerFor]="levelTwo" #alternateTrigger="kbqDropdownTrigger">
            Toggle alternate dropdown
        </button>

        <kbq-dropdown #root="kbqDropdown" (closed)="rootCloseCallback($event)" [hasBackdrop]="true">
            <button
                kbq-dropdown-item
                id="level-one-trigger"
                [kbqDropdownTriggerFor]="levelOne"
                #levelOneTrigger="kbqDropdownTrigger"
            >
                One
            </button>
            <button kbq-dropdown-item>Two</button>
            <button
                kbq-dropdown-item
                *ngIf="showLazy"
                id="lazy-trigger"
                [kbqDropdownTriggerFor]="lazy"
                #lazyTrigger="kbqDropdownTrigger"
            >
                Three
            </button>
        </kbq-dropdown>

        <kbq-dropdown #levelOne="kbqDropdown" (closed)="levelOneCloseCallback($event)" [hasBackdrop]="true">
            <button kbq-dropdown-item>Four</button>
            <button
                kbq-dropdown-item
                id="level-two-trigger"
                [kbqDropdownTriggerFor]="levelTwo"
                #levelTwoTrigger="kbqDropdownTrigger"
            >
                Five
            </button>
            <button kbq-dropdown-item>Six</button>
        </kbq-dropdown>

        <kbq-dropdown #levelTwo="kbqDropdown" (closed)="levelTwoCloseCallback($event)" [hasBackdrop]="true">
            <button kbq-dropdown-item>Seven</button>
            <button kbq-dropdown-item>Eight</button>
            <button kbq-dropdown-item>Nine</button>
        </kbq-dropdown>

        <kbq-dropdown #lazy="kbqDropdown" [hasBackdrop]="true">
            <button kbq-dropdown-item>Ten</button>
            <button kbq-dropdown-item>Eleven</button>
            <button kbq-dropdown-item>Twelve</button>
        </kbq-dropdown>
    `
})
class NestedDropdown {
    @ViewChild('root', { static: false }) rootDropdown: KbqDropdown;
    @ViewChild('rootTrigger', { static: false }) rootTrigger: KbqDropdownTrigger;
    @ViewChild('rootTriggerEl', { static: false }) rootTriggerEl: ElementRef<HTMLElement>;
    @ViewChild('alternateTrigger', { static: false }) alternateTrigger: KbqDropdownTrigger;
    readonly rootCloseCallback = jasmine.createSpy('root dropdown closed callback');

    @ViewChild('levelOne', { static: false }) levelOneDropdown: KbqDropdown;
    @ViewChild('levelOneTrigger', { static: false }) levelOneTrigger: KbqDropdownTrigger;
    readonly levelOneCloseCallback = jasmine.createSpy('level one dropdown closed callback');

    @ViewChild('levelTwo', { static: false }) levelTwoDropdown: KbqDropdown;
    @ViewChild('levelTwoTrigger', { static: false }) levelTwoTrigger: KbqDropdownTrigger;
    readonly levelTwoCloseCallback = jasmine.createSpy('level one dropdown closed callback');

    @ViewChild('lazy', { static: false }) lazyDropdown: KbqDropdown;
    @ViewChild('lazyTrigger', { static: false }) lazyTrigger: KbqDropdownTrigger;
    showLazy = false;
}

@Component({
    template: `
        <button [kbqDropdownTriggerFor]="root" #rootTriggerEl>Toggle dropdown</button>
        <kbq-dropdown #root="kbqDropdown">
            <button
                kbq-dropdown-item
                class="level-one-trigger"
                *ngFor="let item of items"
                [kbqDropdownTriggerFor]="levelOne"
            >
                {{ item }}
            </button>
        </kbq-dropdown>

        <kbq-dropdown #levelOne="kbqDropdown">
            <button kbq-dropdown-item>Four</button>
            <button kbq-dropdown-item>Five</button>
        </kbq-dropdown>
    `
})
class NestedDropdownRepeater {
    @ViewChild('rootTriggerEl', { static: false }) rootTriggerEl: ElementRef<HTMLElement>;
    // @ViewChild('levelOneTrigger', {static: false}) levelOneTrigger: KbqDropdownTrigger;

    items = ['one', 'two', 'three'];
}

@Component({
    template: `
        <button [kbqDropdownTriggerFor]="root" #rootTriggerEl>Toggle dropdown</button>

        <kbq-dropdown #root="kbqDropdown">
            <button kbq-dropdown-item class="level-one-trigger" [kbqDropdownTriggerFor]="levelOne">One</button>

            <kbq-dropdown #levelOne="kbqDropdown">
                <button kbq-dropdown-item class="level-two-item">Two</button>
            </kbq-dropdown>
        </kbq-dropdown>
    `
})
class NestedDropdownDeclaredInsideParentDropdown {
    @ViewChild('rootTriggerEl', { static: false }) rootTriggerEl: ElementRef;
}

@Component({
    template: `
        <button [kbqDropdownTriggerFor]="dropdown" #triggerEl>Toggle dropdown</button>
        <kbq-dropdown #dropdown="kbqDropdown">
            <ng-template kbqDropdownContent>
                <button kbq-dropdown-item>Item</button>
                <button kbq-dropdown-item>Another item</button>
            </ng-template>
        </kbq-dropdown>
    `
})
class SimpleLazyDropdown {
    @ViewChild(KbqDropdownTrigger, { static: false }) trigger: KbqDropdownTrigger;
    @ViewChild('triggerEl', { static: false }) triggerEl: ElementRef<HTMLElement>;
    @ViewChildren(KbqDropdownItem) items: QueryList<KbqDropdownItem>;
}

@Component({
    template: `
        <button
            [kbqDropdownTriggerFor]="dropdown"
            [kbqDropdownTriggerData]="{ label: 'one' }"
            #triggerOne="kbqDropdownTrigger"
        >
            One
        </button>
        <button
            [kbqDropdownTriggerFor]="dropdown"
            [kbqDropdownTriggerData]="{ label: 'two' }"
            #triggerTwo="kbqDropdownTrigger"
        >
            Two
        </button>
        <kbq-dropdown #dropdown="kbqDropdown">
            <ng-template let-label="label" kbqDropdownContent>
                <button kbq-dropdown-item>{{ label }}</button>
            </ng-template>
        </kbq-dropdown>
    `
})
class LazyDropdownWithContext {
    @ViewChild('triggerOne', { static: false }) triggerOne: KbqDropdownTrigger;
    @ViewChild('triggerTwo', { static: false }) triggerTwo: KbqDropdownTrigger;
}

@Component({
    template: `
        <button [kbqDropdownTriggerFor]="one">Toggle dropdown</button>
        <kbq-dropdown #one="kbqDropdown">
            <button kbq-dropdown-item>One</button>
        </kbq-dropdown>

        <kbq-dropdown #two="kbqDropdown">
            <button kbq-dropdown-item>Two</button>
        </kbq-dropdown>
    `
})
class DynamicPanelDropdown {
    @ViewChild(KbqDropdownTrigger, { static: false }) trigger: KbqDropdownTrigger;
    @ViewChild('one', { static: false }) first: KbqDropdown;
    @ViewChild('two', { static: false }) second: KbqDropdown;
}

@Component({
    template: `
        <button [kbqDropdownTriggerFor]="dropdown" #triggerEl>Toggle dropdown</button>
        <kbq-dropdown #dropdown="kbqDropdown">
            <button #item kbq-dropdown-item>Item</button>
        </kbq-dropdown>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class OnPushContainer {
    @ViewChild(KbqDropdownTrigger, { static: false }) trigger: KbqDropdownTrigger;
    @ViewChild(KbqDropdownItem, { read: ElementRef }) itemRef: ElementRef<HTMLElement>;
    @ViewChild('triggerEl', { static: false }) triggerEl: ElementRef<HTMLElement>;
}

@Component({
    template: `
        <button [kbqDropdownTriggerFor]="dropdown" #triggerEl>Toggle dropdown</button>
        <kbq-dropdown #dropdown="kbqDropdown">
            <button style="max-width: 150px; width: 150px" kbq-dropdown-item kbq-title>
                {{ longValue }}
            </button>
            <button style="max-width: 150px; width: 150px" kbq-dropdown-item kbq-title>
                {{ defaultValue }}
            </button>
            <button style="max-width: 150px; width: 150px" kbq-dropdown-item kbq-title>
                <div #kbqTitleContainer>
                    <div>Complex header</div>
                    <div #kbqTitleText>{{ longValue }}</div>
                </div>
            </button>
            <button style="max-width: 150px; width: 150px" kbq-dropdown-item kbq-title>
                <div #kbqTitleContainer>
                    <div>Complex header</div>
                    <div #kbqTitleText>{{ defaultValue }}</div>
                </div>
            </button>
        </kbq-dropdown>
    `
})
class DropdownWithTooltip implements TestableDropdown {
    @ViewChild(KbqDropdownTrigger, { static: false }) trigger: KbqDropdownTrigger;
    @ViewChild('triggerEl', { static: false }) triggerEl: ElementRef<HTMLElement>;

    defaultValue = 'Just a text';
    longValue = `${this.defaultValue} and a long text and a long text and a long text and a long text and a long text and a long text`;
}

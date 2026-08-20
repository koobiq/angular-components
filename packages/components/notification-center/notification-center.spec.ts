import { CdkTrapFocus } from '@angular/cdk/a11y';
import { ENTER, ESCAPE } from '@angular/cdk/keycodes';
import { OverlayContainer } from '@angular/cdk/overlay';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { Component, DebugElement, ElementRef, Provider, TemplateRef, Type, viewChild } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqMomentDateModule } from '@koobiq/angular-moment-adapter/adapter';
import {
    KBQ_LOCALE_SERVICE,
    KbqFormattersModule,
    KbqLocaleService,
    dispatchFakeEvent,
    dispatchKeyboardEvent,
    enUSLocaleData,
    ruRULocaleData
} from '@koobiq/components/core';
import {
    KbqNotificationCenterModule,
    KbqNotificationCenterService,
    KbqNotificationCenterTrigger,
    KbqNotificationItem,
    KbqNotificationsGroup,
    kbqNotificationCenterLocaleConfigurationProvider
} from '@koobiq/components/notification-center';
import { KbqToastService } from '@koobiq/components/toast';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { axe } from 'jest-axe';

/**
 * Macrotask budget for `flush()` while the panel is opening: the overlay, the focus trap, the
 * toolbar tooltips and the dropdown each queue their own, well past the default of 20.
 */
const maxFlushTurns = 200;

/** Mirrors the panel's own rate-limit window for the scroll-to-bottom check. */
const SCROLLED_TO_BOTTOM_AUDIT_TIME = 100;

describe('KbqNotificationCenter', () => {
    let fixture: ComponentFixture<SimpleNotificationCenter>;
    let componentInstance: SimpleNotificationCenter;
    let debugElement: DebugElement;
    let overlayContainer: OverlayContainer;
    let originalGetComputedStyle: typeof window.getComputedStyle;

    // jsdom's getComputedStyle returns values the scrollbar and overlay position strategy can't parse,
    // so stub it for the whole suite. Keep the stub configurable and restore the original afterwards so
    // the redefine is always permitted and nothing leaks past these tests.
    beforeAll(() => {
        originalGetComputedStyle = window.getComputedStyle;
        Object.defineProperty(global.window, 'getComputedStyle', {
            configurable: true,
            value: () => ({
                getPropertyValue: (_property: string) => ''
            })
        });

        // jsdom does not implement Element.prototype.scrollTo; the container reveal calls it via
        // KbqScrollbarViewport.scrollTo (CdkScrollable). Stub it only when it's missing so a real
        // implementation is never shadowed.
        if (!HTMLElement.prototype.scrollTo) {
            Object.defineProperty(HTMLElement.prototype, 'scrollTo', { configurable: true, value: () => {} });
        }
    });

    afterAll(() => {
        Object.defineProperty(global.window, 'getComputedStyle', {
            configurable: true,
            value: originalGetComputedStyle
        });
    });

    const createComponent = <T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> => {
        TestBed.configureTestingModule({
            imports: [component, NoopAnimationsModule, KbqLuxonDateModule, KbqFormattersModule],
            providers
        });
        const componentFixture = TestBed.createComponent<T>(component);

        componentFixture.autoDetectChanges();

        return componentFixture;
    };

    const setUpDefaultFixture = (providers: Provider[] = []) => {
        fixture = createComponent(SimpleNotificationCenter, providers);
        componentInstance = fixture.componentInstance;
        debugElement = fixture.debugElement;
        overlayContainer = TestBed.inject(OverlayContainer);
    };

    // The service is `providedIn: 'root'` and is no longer re-provided by KbqNotificationCenterModule,
    // so the rendered panel and the test see the very same instance.
    const getService = () => TestBed.inject(KbqNotificationCenterService);

    const createItem = (title: string, date: string = new Date().toISOString()): KbqNotificationItem => ({
        title,
        date
    });

    const openCenter = () => {
        componentInstance.trigger().show();
        fixture.detectChanges();
    };

    const getPanel = () =>
        overlayContainer.getContainerElement().querySelector<HTMLElement>('.kbq-notification-center');

    const queryPanel = <T extends HTMLElement>(selector: string) =>
        overlayContainer.getContainerElement().querySelector<T>(selector);

    const queryAllInPanel = <T extends HTMLElement>(selector: string) =>
        Array.from(overlayContainer.getContainerElement().querySelectorAll<T>(selector));

    // The scroll-to-bottom detection lives on the rendered overlay component, not the trigger.
    const getCenter = () =>
        (
            componentInstance.trigger() as unknown as {
                instance: {
                    scrollContainer: () => {
                        getNativeElement: () => HTMLElement;
                        scrollTo: (options?: ScrollToOptions) => void;
                    };
                };
            }
        ).instance;

    afterEach(() => {
        overlayContainer?.ngOnDestroy();
    });

    describe('trigger', () => {
        beforeEach(() => setUpDefaultFixture());

        it('show() renders the panel', fakeAsync(() => {
            expect(debugElement.query(By.css('.kbq-notification-center'))).toBe(null);

            openCenter();

            expect(debugElement.query(By.css('.kbq-notification-center'))).not.toBe(null);
            expect(debugElement.query(By.css('.kbq-notification-center-header'))).not.toBe(null);
        }));

        it('opens on click, and a repeat click is not a toggle', fakeAsync(() => {
            const triggerElement = debugElement.query(By.css('button')).nativeElement as HTMLElement;

            triggerElement.click();
            fixture.detectChanges();
            flush(maxFlushTurns);

            expect(componentInstance.trigger().isOpen).toBe(true);

            // The same click both closes the panel through the overlay and re-opens it through the
            // trigger, so it stays open. Closing is covered by the "closing actions" cases below.
            triggerElement.click();
            fixture.detectChanges();
            flush(maxFlushTurns);

            expect(componentInstance.trigger().isOpen).toBe(true);
        }));

        it('opens from the keyboard', fakeAsync(() => {
            const triggerElement = debugElement.query(By.css('button')).nativeElement as HTMLElement;

            dispatchKeyboardEvent(triggerElement, 'keydown', ENTER, undefined, 'Enter');
            fixture.detectChanges();
            flush(maxFlushTurns);

            expect(componentInstance.trigger().isOpen).toBe(true);
        }));

        it('does not open while disabled', fakeAsync(() => {
            componentInstance.disabled = true;
            fixture.detectChanges();

            openCenter();
            flush();

            expect(getPanel()).toBeNull();
        }));

        it('emits kbqVisibleChange on open and close', fakeAsync(() => {
            openCenter();
            flush();

            expect(componentInstance.visibleChanges).toEqual([true]);

            componentInstance.trigger().hide();
            fixture.detectChanges();
            flush();

            expect(componentInstance.visibleChanges).toEqual([true, false]);
        }));

        it('reflects the panel state through aria-expanded and aria-controls', fakeAsync(() => {
            const triggerElement = debugElement.query(By.css('button')).nativeElement as HTMLElement;

            expect(triggerElement.getAttribute('aria-expanded')).toBe('false');
            expect(triggerElement.getAttribute('aria-controls')).toBeNull();

            openCenter();
            flush();
            fixture.detectChanges();

            expect(triggerElement.getAttribute('aria-expanded')).toBe('true');
            expect(triggerElement.getAttribute('aria-controls')).toBe(getPanel()!.getAttribute('id'));
        }));

        it('keeps the side placement when popoverMode is explicitly turned off', () => {
            const trigger = componentInstance.trigger();

            trigger.popoverMode = true;

            // Popover mode renders the panel under the trigger.
            expect(trigger.placement).toBe('bottom');

            trigger.popoverMode = false;

            // The setter used to hijack the placement on `false` as well, leaving the panel below the
            // trigger for ever.
            expect(trigger.placement).toBe('right');
        });

        describe('remove all button', () => {
            const getService = () =>
                (componentInstance.trigger() as unknown as { service: KbqNotificationCenterService }).service;

            it('carries a tooltip with the localized "remove all" text', fakeAsync(() => {
                getService().items = [{ title: 'a', date: new Date().toISOString() }];

                componentInstance.trigger().show();
                fixture.detectChanges();

                const button = debugElement.query(By.css('[data-testid="kbq-notification-center-remove-all-button"]'));

                expect(button.injector.get(KbqTooltipTrigger).content).toBe(
                    ruRULocaleData.notificationCenter.removeAll
                );
            }));
        });

        it('propagates popoverHeight to an already open panel, including clearing it', fakeAsync(() => {
            openCenter();
            flush();

            componentInstance.trigger().popoverHeight = '500px';

            expect(getPanel()!.style.getPropertyValue('--kbq-notification-center-popover-height')).toBe('500px');

            componentInstance.trigger().popoverHeight = '';

            expect(getPanel()!.style.getPropertyValue('--kbq-notification-center-popover-height')).toBe('');
        }));
    });

    describe('accessibility', () => {
        beforeEach(() => setUpDefaultFixture());

        it('names the panel with its own title', fakeAsync(() => {
            openCenter();
            flush();

            const panel = getPanel()!;
            const title = queryPanel('.kbq-notification-center-title__text')!;

            expect(panel.getAttribute('role')).toBe('dialog');
            expect(panel.getAttribute('aria-labelledby')).toBe(title.getAttribute('id'));
            expect(title.textContent!.trim().length).toBeGreaterThan(0);
        }));

        it('traps focus inside the panel', fakeAsync(() => {
            openCenter();
            flush();

            const trap = debugElement.query(By.directive(CdkTrapFocus));

            expect(trap).not.toBe(null);
            expect(trap.injector.get(CdkTrapFocus).enabled).toBe(true);
        }));

        it('gives every icon-only button an accessible name', fakeAsync(() => {
            getService().items = [createItem('a')];

            openCenter();
            flush();
            fixture.detectChanges();

            const buttons = queryAllInPanel('button');

            expect(buttons.length).toBeGreaterThan(0);

            buttons.forEach((button) => {
                const name = button.getAttribute('aria-label') || button.textContent!.trim();

                expect(name.length).toBeGreaterThan(0);
            });
        }));

        it('leaves the delete buttons in the tab order', fakeAsync(() => {
            getService().items = [createItem('a')];

            openCenter();
            flush();
            fixture.detectChanges();

            const deleteButtonTestIds = [
                'kbq-notification-center-remove-group-button',
                'kbq-notification-item-remove-button'
            ];

            // The buttons used to be `display: none` until hovered, which took them out of the tab
            // order; they are hidden with `opacity` now precisely so the keyboard can still reach them.
            deleteButtonTestIds.forEach((testId) => {
                const button = queryPanel(`[data-testid="${testId}"]`)!;

                expect(button).not.toBeNull();

                button.focus();

                expect(document.activeElement).toBe(button);
            });
        }));

        it('conveys the unread state with text, not with the indicator dot alone', fakeAsync(() => {
            getService().items = [
                createItem('a', '2025-10-02T12:00:00.000Z'),
                { ...createItem('b', '2025-10-01T12:00:00.000Z'), read: true }
            ];

            openCenter();
            flush();
            fixture.detectChanges();

            const items = queryAllInPanel('kbq-notification-item');

            expect(items[0].textContent).toContain('Не прочитано');
            expect(items[1].textContent).not.toContain('Не прочитано');
        }));

        it('marks an item read after dwelling on it with the keyboard', fakeAsync(() => {
            const service = getService();
            const item = createItem('a');

            service.items = [item];

            openCenter();
            flush();
            fixture.detectChanges();

            const itemElement = queryPanel('kbq-notification-item')!;

            // The dwell used to be tracked for `mouseenter`/`mouseleave` only, so an item could never
            // be read without a pointer.
            dispatchFakeEvent(itemElement, 'focusin', true);
            tick(600);
            dispatchFakeEvent(itemElement, 'focusout', true);

            expect(item.read).toBe(true);
        }));

        it('closes on Escape from an element inside the panel', fakeAsync(() => {
            openCenter();
            flush();

            dispatchKeyboardEvent(queryPanel('button')!, 'keydown', ESCAPE, undefined, 'Escape');
            fixture.detectChanges();
            flush();

            expect(componentInstance.trigger().isOpen).toBe(false);
        }));

        it('returns focus to the trigger when the panel closes', fakeAsync(() => {
            const triggerElement = debugElement.query(By.css('button')).nativeElement as HTMLElement;

            openCenter();
            flush();

            componentInstance.trigger().hide();
            fixture.detectChanges();
            flush();

            expect(document.activeElement).toBe(triggerElement);
        }));

        it('keeps focus inside the panel after every notification is removed', fakeAsync(() => {
            getService().items = [createItem('a')];

            openCenter();
            flush();
            fixture.detectChanges();

            queryPanel('[data-testid="kbq-notification-center-remove-all-button"]')!.click();
            fixture.detectChanges();
            flush();

            expect(getPanel()!.contains(document.activeElement)).toBe(true);
        }));

        it('keeps focus inside the panel after a day group is removed', fakeAsync(() => {
            getService().items = [createItem('a', '2025-10-01T12:00:00.000Z'), createItem('b')];

            openCenter();
            flush();
            fixture.detectChanges();

            queryPanel('[data-testid="kbq-notification-center-remove-group-button"]')!.click();
            fixture.detectChanges();
            flush();

            expect(getPanel()!.contains(document.activeElement)).toBe(true);
        }));

        it('removes a notification from its own delete button', fakeAsync(() => {
            const service = getService();

            service.items = [createItem('a')];

            openCenter();
            flush();
            fixture.detectChanges();

            queryPanel('[data-testid="kbq-notification-item-remove-button"]')!.click();
            fixture.detectChanges();
            flush();

            expect(service.isEmpty).toBe(true);
            expect(getPanel()!.contains(document.activeElement)).toBe(true);
        }));

        it('announces the panel status through a single persistent live region', fakeAsync(() => {
            const service = getService();

            openCenter();
            flush();
            fixture.detectChanges();

            const status = queryPanel('[data-testid="kbq-notification-center-status"]')!;

            expect(status.getAttribute('aria-live')).toBe('polite');
            expect(status.textContent!.trim()).toBe('Нет уведомлений');

            service.setLoadingMore(true);
            fixture.detectChanges();

            expect(status.textContent!.trim()).toBe('Загрузка уведомлений');

            // The region is never re-created, so the announcement is not lost.
            expect(queryPanel('[data-testid="kbq-notification-center-status"]')).toBe(status);
        }));

        it('has no axe violations with notifications', async () => {
            getService().items = [createItem('a'), createItem('b', '2025-10-01T12:00:00.000Z')];

            openCenter();
            await fixture.whenStable();
            fixture.detectChanges();

            expect(await axe(overlayContainer.getContainerElement())).toHaveNoViolations();
        });

        it('has no axe violations in the empty state', async () => {
            openCenter();
            await fixture.whenStable();
            fixture.detectChanges();

            expect(await axe(overlayContainer.getContainerElement())).toHaveNoViolations();
        });

        describe('status icon', () => {
            const getService = () =>
                (componentInstance.trigger() as unknown as { service: KbqNotificationCenterService }).service;

            const push = (overrides: Partial<KbqNotificationItem>) => {
                const item: KbqNotificationItem = { title: 'a', date: new Date().toISOString(), ...overrides };

                jest.spyOn(TestBed.inject(KbqToastService), 'show').mockReturnValue({ id: 1, ref: {} as any });

                getService().push(item);

                componentInstance.trigger().show();
                fixture.detectChanges();
            };

            const itemElement = (): HTMLElement =>
                overlayContainer.getContainerElement().querySelector<HTMLElement>('kbq-notification-item')!;

            // `KbqToastService` no longer writes the `style` and `icon` defaults into the item it is handed,
            // so the row resolves them itself. Without that, an item pushed with neither renders no glyph.
            it('falls back to the contrast glyph for an item pushed without a style or an icon', () => {
                push({});

                expect(itemElement().classList).toContain('kbq-notification-item_contrast');
                expect(itemElement().querySelector('.kbq-notification-item__icon')!.classList).toContain(
                    'kbq-circle-info_16'
                );
            });

            it('renders no glyph for an item pushed with `icon: false`', () => {
                push({ icon: false });

                expect(itemElement().querySelector('.kbq-notification-item__icon-container')).toBeNull();
            });
        });
    });

    describe('unparsable dates', () => {
        beforeEach(() => setUpDefaultFixture());

        const readGroups = (): KbqNotificationsGroup[] => {
            let result: KbqNotificationsGroup[] = [];

            getService()
                .groupedItems.subscribe((groups) => (result = groups))
                .unsubscribe();

            return result;
        };

        it('groups a value the adapter cannot parse instead of throwing', () => {
            getService().items = [createItem('a', '04.07.2026')];

            expect(() => readGroups()).not.toThrow();
            expect(readGroups()).toHaveLength(1);
            expect(readGroups()[0].title).toBe('04.07.2026');
        });

        it('groups outright garbage the same way', () => {
            getService().items = [createItem('a', 'garbage')];

            expect(readGroups()).toHaveLength(1);
        });

        it('keeps grouping the valid notifications next to an invalid one', () => {
            getService().items = [createItem('valid', '2025-10-01T12:00:00.000Z'), createItem('invalid', 'garbage')];

            const groups = readGroups();

            expect(groups).toHaveLength(2);
            // The unparsable one sorts last instead of scrambling the order.
            expect(groups[1].items.map((item) => item.title)).toEqual(['invalid']);
        });

        it('renders the item with an empty time instead of failing change detection', fakeAsync(() => {
            getService().items = [createItem('a', 'garbage')];

            expect(() => {
                openCenter();
                flush();
                fixture.detectChanges();
            }).not.toThrow();

            expect(queryPanel('.kbq-notification-item-time__value')!.textContent!.trim()).toBe('');
        }));
    });

    describe('grouping', () => {
        beforeEach(() => setUpDefaultFixture());

        it('gives every group a stable id derived from its day', () => {
            const service = getService();

            service.items = [createItem('a', '2025-10-01T12:00:00.000Z'), createItem('b', '2025-10-02T12:00:00.000Z')];

            let first: KbqNotificationsGroup[] = [];
            let second: KbqNotificationsGroup[] = [];

            service.groupedItems.subscribe((groups) => (first = groups)).unsubscribe();
            service.groupedItems.subscribe((groups) => (second = groups)).unsubscribe();

            expect(first.map((group) => group.id)).toEqual(second.map((group) => group.id));
            expect(new Set(first.map((group) => group.id)).size).toBe(2);
        });

        it('keeps the rendered items when the list is appended to', fakeAsync(() => {
            const service = getService();

            service.items = [createItem('a', '2025-10-01T12:00:00.000Z')];

            openCenter();
            flush();
            fixture.detectChanges();

            const before = queryPanel('kbq-notification-item');

            service.push(createItem('b', '2025-10-01T13:00:00.000Z'));
            fixture.detectChanges();
            flush();

            // Tracking by identity used to throw every rendered row away on each emission.
            expect(queryAllInPanel('kbq-notification-item')).toContain(before);
        }));
    });

    describe('infinite scroll', () => {
        beforeEach(() => setUpDefaultFixture());

        // Fakes the container geometry. `scrollContainer` is a signal query, so it must be called
        // to reach the native element.
        const setGeometry = (geometry: { scrollHeight: number; clientHeight: number; scrollTop: number }) => {
            const element = getCenter().scrollContainer().getNativeElement();

            Object.defineProperty(element, 'scrollHeight', { configurable: true, value: geometry.scrollHeight });
            Object.defineProperty(element, 'clientHeight', { configurable: true, value: geometry.clientHeight });
            Object.defineProperty(element, 'offsetHeight', { configurable: true, value: geometry.clientHeight });
            Object.defineProperty(element, 'scrollTop', { configurable: true, value: geometry.scrollTop });
        };

        // Sits the list exactly at the bottom (distance 0 <= the default scrolledToBottomOffset of 0).
        const setAtBottomGeometry = () => setGeometry({ scrollHeight: 1000, clientHeight: 500, scrollTop: 500 });

        // Sits the list at the bottom, then fires a real scroll event on the container.
        const scrollToBottom = () => {
            setAtBottomGeometry();

            dispatchFakeEvent(getCenter().scrollContainer().getNativeElement(), 'scroll');
        };

        it('shows the bottom "load more" spinner without replacing the list', fakeAsync(() => {
            const service = getService();

            openCenter();

            service.setLoadingMore(true);
            fixture.detectChanges();

            expect(debugElement.query(By.css('.kbq-notification-center-load-more kbq-progress-spinner'))).not.toBe(
                null
            );
            // the full-screen loader must NOT replace the list
            expect(debugElement.query(By.css('.kbq-loader-overlay'))).toBe(null);
        }));

        it('shows the bottom "load more" error row, separate from the full-screen error', fakeAsync(() => {
            const service = getService();

            openCenter();

            service.setLoadMoreErrorMode(true);
            fixture.detectChanges();

            const errorRow = debugElement.query(By.css('.kbq-notification-center-load-more-error'));

            expect(errorRow).not.toBe(null);
            expect(errorRow.query(By.css('button'))).not.toBe(null);
            // full-screen error state must NOT be shown
            expect(debugElement.query(By.css('.kbq-notification-center-error-container'))).toBe(null);
        }));

        it('never shows the spinner and the error row at the same time', fakeAsync(() => {
            const service = getService();

            openCenter();

            service.setLoadingMore(true);
            service.setLoadMoreErrorMode(true);
            fixture.detectChanges();

            expect(debugElement.query(By.css('.kbq-notification-center-load-more'))).not.toBe(null);
            expect(debugElement.query(By.css('.kbq-notification-center-load-more-error'))).toBe(null);
        }));

        it('re-emits onNextPage and clears the error when the bottom retry button is clicked', fakeAsync(() => {
            const service = getService();
            const emitSpy = jest.spyOn(service.onNextPage, 'next');

            openCenter();

            service.setLoadMoreErrorMode(true);
            fixture.detectChanges();

            debugElement
                .query(By.css('.kbq-notification-center-load-more-error button'))
                .triggerEventHandler('click', {});

            expect(emitSpy).toHaveBeenCalled();
            // retry must reset the error state itself so the spinner and the error row can never coexist
            expect(service.loadMoreErrorMode.value).toBe(false);
        }));

        it('keeps paging when a completed load leaves the list still at the bottom', fakeAsync(() => {
            const service = getService();
            const emitSpy = jest.spyOn(service.onNextPage, 'next');

            openCenter();

            // The just-loaded page was too short to overflow: the list is still at the bottom and
            // no further scroll event will fire — completing the load must re-trigger paging.
            setAtBottomGeometry();

            service.setLoadingMore(true);
            service.setLoadingMore(false);
            tick(SCROLLED_TO_BOTTOM_AUDIT_TIME);
            flush();

            expect(emitSpy).toHaveBeenCalled();
        }));

        it('requests the first page when the initial list does not fill the viewport', fakeAsync(() => {
            const service = getService();
            const emitSpy = jest.spyOn(service.onNextPage, 'next');

            openCenter();

            // Shorter than the viewport, so no scroll event will ever fire: the panel has to measure
            // itself or infinite scroll never starts.
            setGeometry({ scrollHeight: 400, clientHeight: 500, scrollTop: 0 });
            service.setHasMore(true);
            tick(SCROLLED_TO_BOTTOM_AUDIT_TIME);
            flush();

            expect(emitSpy).toHaveBeenCalled();
        }));

        it('does not request a page on its own when there is nothing more to load', fakeAsync(() => {
            const service = getService();
            const emitSpy = jest.spyOn(service.onNextPage, 'next');

            openCenter();

            setGeometry({ scrollHeight: 400, clientHeight: 500, scrollTop: 0 });
            service.setHasMore(false);
            flush();

            expect(emitSpy).not.toHaveBeenCalled();
        }));

        it('keeps the full-screen error path emitting onReload', fakeAsync(() => {
            const service = getService();
            const reloadSpy = jest.spyOn(service.onReload, 'next');

            openCenter();

            service.setErrorMode(true);
            fixture.detectChanges();

            const errorContainer = debugElement.query(By.css('.kbq-notification-center-error-container'));

            expect(errorContainer).not.toBe(null);
            // the bottom load-more rows must NOT render while the full-screen error is shown
            expect(debugElement.query(By.css('.kbq-notification-center-load-more'))).toBe(null);

            errorContainer.query(By.css('button')).triggerEventHandler('click', {});

            expect(reloadSpy).toHaveBeenCalled();
        }));

        it('reports loadingMore / loadMoreErrorMode updates through the changes stream', () => {
            const service = getService();

            let emissions = 0;
            const subscription = service.changes.subscribe(() => emissions++);

            const afterSubscribe = emissions;

            service.setLoadingMore(true);
            expect(emissions).toBe(afterSubscribe + 1);

            const afterLoadingMore = emissions;

            service.setLoadMoreErrorMode(true);
            expect(emissions).toBe(afterLoadingMore + 1);

            subscription.unsubscribe();
        });

        it('emits onNextPage when scrolled to the bottom with more to load', fakeAsync(() => {
            const service = getService();
            const emitSpy = jest.spyOn(service.onNextPage, 'next');

            openCenter();

            scrollToBottom();
            // `flush()` alone will not do: rxjs schedules the audit window with `setInterval`, and
            // Angular deliberately leaves periodic timers out of `flush()`.
            tick(SCROLLED_TO_BOTTOM_AUDIT_TIME);
            flush();

            expect(emitSpy).toHaveBeenCalled();
        }));

        it('does not emit onNextPage when there is nothing more to load', fakeAsync(() => {
            const service = getService();
            const emitSpy = jest.spyOn(service.onNextPage, 'next');

            openCenter();

            service.setHasMore(false);

            scrollToBottom();
            // `flush()` alone will not do: rxjs schedules the audit window with `setInterval`, and
            // Angular deliberately leaves periodic timers out of `flush()`.
            tick(SCROLLED_TO_BOTTOM_AUDIT_TIME);
            flush();

            expect(emitSpy).not.toHaveBeenCalled();
        }));

        it('does not emit onNextPage while a page is already loading', fakeAsync(() => {
            const service = getService();
            const emitSpy = jest.spyOn(service.onNextPage, 'next');

            openCenter();

            service.setLoadingMore(true);

            scrollToBottom();
            // `flush()` alone will not do: rxjs schedules the audit window with `setInterval`, and
            // Angular deliberately leaves periodic timers out of `flush()`.
            tick(SCROLLED_TO_BOTTOM_AUDIT_TIME);
            flush();

            expect(emitSpy).not.toHaveBeenCalled();
        }));

        it('does not emit onNextPage while the load-more error is shown', fakeAsync(() => {
            const service = getService();
            const emitSpy = jest.spyOn(service.onNextPage, 'next');

            openCenter();

            service.setLoadMoreErrorMode(true);

            scrollToBottom();
            // `flush()` alone will not do: rxjs schedules the audit window with `setInterval`, and
            // Angular deliberately leaves periodic timers out of `flush()`.
            tick(SCROLLED_TO_BOTTOM_AUDIT_TIME);
            flush();

            expect(emitSpy).not.toHaveBeenCalled();
        }));

        it('emits onNextPage at the bottom when fractional zoom leaves a sub-pixel gap', fakeAsync(() => {
            const service = getService();
            const emitSpy = jest.spyOn(service.onNextPage, 'next');

            openCenter();

            // At fractional browser zoom `scrollHeight` / `clientHeight` are rounded to integers while
            // `scrollTop` stays fractional, so the true bottom reports a residual distance instead of 0.
            setGeometry({ scrollHeight: 1000, clientHeight: 500, scrollTop: 499.6 });
            dispatchFakeEvent(getCenter().scrollContainer().getNativeElement(), 'scroll');
            tick(SCROLLED_TO_BOTTOM_AUDIT_TIME);
            flush();

            expect(emitSpy).toHaveBeenCalled();
        }));

        it('does not emit onNextPage while the list is still a few pixels from the bottom', fakeAsync(() => {
            const service = getService();
            const emitSpy = jest.spyOn(service.onNextPage, 'next');

            openCenter();

            // The sub-pixel tolerance must not stretch into a visible early trigger.
            setGeometry({ scrollHeight: 1000, clientHeight: 500, scrollTop: 495 });
            dispatchFakeEvent(getCenter().scrollContainer().getNativeElement(), 'scroll');
            tick(SCROLLED_TO_BOTTOM_AUDIT_TIME);
            flush();

            expect(emitSpy).not.toHaveBeenCalled();
        }));

        it('emits onNextPage within scrolledToBottomOffset of the bottom', fakeAsync(() => {
            const service = getService();
            const emitSpy = jest.spyOn(service.onNextPage, 'next');

            componentInstance.scrolledToBottomOffset = 100;
            fixture.detectChanges();
            openCenter();

            // 50px from the actual bottom — within the 100px threshold
            setGeometry({ scrollHeight: 1000, clientHeight: 500, scrollTop: 450 });
            dispatchFakeEvent(getCenter().scrollContainer().getNativeElement(), 'scroll');
            tick(SCROLLED_TO_BOTTOM_AUDIT_TIME);
            flush();

            expect(emitSpy).toHaveBeenCalled();
        }));

        it('does not emit onNextPage when the distance exceeds scrolledToBottomOffset', fakeAsync(() => {
            const service = getService();
            const emitSpy = jest.spyOn(service.onNextPage, 'next');

            componentInstance.scrolledToBottomOffset = 100;
            fixture.detectChanges();
            openCenter();

            // 150px from the actual bottom — outside the 100px threshold
            setGeometry({ scrollHeight: 1000, clientHeight: 500, scrollTop: 350 });
            dispatchFakeEvent(getCenter().scrollContainer().getNativeElement(), 'scroll');
            tick(SCROLLED_TO_BOTTOM_AUDIT_TIME);
            flush();

            expect(emitSpy).not.toHaveBeenCalled();
        }));

        it('scrolls the list to the bottom when the load-more spinner appears', fakeAsync(() => {
            const service = getService();

            openCenter();
            setAtBottomGeometry();

            const scrollSpy = jest.spyOn(getCenter().scrollContainer(), 'scrollTo');

            service.setLoadingMore(true);
            fixture.detectChanges();
            tick(SCROLLED_TO_BOTTOM_AUDIT_TIME);
            flush();

            expect(scrollSpy).toHaveBeenCalledWith({ top: 1000 });
        }));

        it('scrolls the list to the bottom when the load-more error row appears', fakeAsync(() => {
            const service = getService();

            openCenter();
            setAtBottomGeometry();

            const scrollSpy = jest.spyOn(getCenter().scrollContainer(), 'scrollTo');

            service.setLoadMoreErrorMode(true);
            fixture.detectChanges();
            tick(SCROLLED_TO_BOTTOM_AUDIT_TIME);
            flush();

            expect(scrollSpy).toHaveBeenCalledWith({ top: 1000 });
        }));

        it('does not scroll again when the spinner is turned off', fakeAsync(() => {
            const service = getService();

            openCenter();
            setAtBottomGeometry();

            const scrollSpy = jest.spyOn(getCenter().scrollContainer(), 'scrollTo');

            service.setLoadingMore(true);
            fixture.detectChanges();
            tick(SCROLLED_TO_BOTTOM_AUDIT_TIME);
            flush();

            scrollSpy.mockClear();

            // true -> false must NOT scroll
            service.setLoadingMore(false);
            fixture.detectChanges();
            tick(SCROLLED_TO_BOTTOM_AUDIT_TIME);
            flush();

            expect(scrollSpy).not.toHaveBeenCalled();
        }));

        it('does not scroll to the bottom on open when a load-more error is already shown', fakeAsync(() => {
            const service = getService();

            // Error left over from a previous session, before the panel is opened.
            service.setLoadMoreErrorMode(true);

            openCenter();
            setAtBottomGeometry();

            const scrollSpy = jest.spyOn(getCenter().scrollContainer(), 'scrollTo');

            // The replayed BehaviorSubject value must not be treated as a fresh appearance: the panel
            // always opens scrolled to the top.
            flush();

            expect(scrollSpy).not.toHaveBeenCalled();
        }));
    });

    describe('closing actions', () => {
        let outerFixture: ComponentFixture<NotificationCenterWithOuterScrollable>;

        const getOuterScrollable = () =>
            outerFixture.debugElement.query(By.directive(CdkScrollable)).injector.get(CdkScrollable);

        beforeEach(() => {
            outerFixture = createComponent(NotificationCenterWithOuterScrollable);
            overlayContainer = TestBed.inject(OverlayContainer);
        });

        const openOuterCenter = () => {
            outerFixture.componentInstance.trigger().show();
            outerFixture.detectChanges();
        };

        it('stays open while its own list is scrolled', fakeAsync(() => {
            openOuterCenter();
            flush();

            const panel = overlayContainer
                .getContainerElement()
                .querySelector<HTMLElement>('[data-testid="kbq-notification-center-container"]')!;

            dispatchFakeEvent(panel, 'scroll');
            flush();

            expect(outerFixture.componentInstance.trigger().isOpen).toBe(true);
        }));

        it('closes when something outside the panel scrolls', fakeAsync(() => {
            openOuterCenter();
            flush();

            dispatchFakeEvent(outerFixture.componentInstance.outer().nativeElement, 'scroll');
            // ScrollDispatcher rate-limits with setInterval, which flush() leaves alone.
            tick(SCROLLED_TO_BOTTOM_AUDIT_TIME);
            flush();

            expect(outerFixture.componentInstance.trigger().isOpen).toBe(false);
        }));

        it('never writes its own flags onto the shared scrollable', fakeAsync(() => {
            openOuterCenter();
            flush();

            const scrollable = getOuterScrollable() as unknown as Record<string, unknown>;

            dispatchFakeEvent(outerFixture.componentInstance.outer().nativeElement, 'scroll');
            // ScrollDispatcher rate-limits with setInterval, which flush() leaves alone.
            tick(SCROLLED_TO_BOTTOM_AUDIT_TIME);
            flush();

            // The panel used to tag the emitted CdkScrollable so the base trigger would skip the close.
            // The tag was never cleared and disabled close-on-scroll for every other pop-up as well.
            expect(scrollable.kbqPopoverPreventHide).toBeUndefined();
            expect(scrollable.type).toBeUndefined();
        }));

        it('does not throw when a scroll arrives after the panel was destroyed while open', fakeAsync(() => {
            openOuterCenter();
            flush();

            const outerElement = outerFixture.componentInstance.outer().nativeElement;

            outerFixture.destroy();

            expect(() => {
                dispatchFakeEvent(outerElement, 'scroll');
                flush();
            }).not.toThrow();
        }));
    });

    describe('onDelete', () => {
        beforeEach(() => setUpDefaultFixture());

        it('emits an "item" event with the removed item on remove()', () => {
            const service = getService();
            const item = createItem('a');

            service.items = [item];

            const emitSpy = jest.spyOn(service.onDelete, 'next');

            service.remove(item);

            expect(emitSpy).toHaveBeenCalledWith({ type: 'item', items: [item] });
            expect(service.isEmpty).toBe(true);
        });

        it('stays silent when the removed item is not in the list', () => {
            const service = getService();

            service.items = [createItem('a')];

            const emitSpy = jest.spyOn(service.onDelete, 'next');

            // An equal but not identical object used to be filtered out silently while still reporting
            // a deletion the consumer would then replay against its backend.
            service.remove(createItem('a'));

            expect(emitSpy).not.toHaveBeenCalled();
            expect(service.isEmpty).toBe(false);
        });

        it('emits a "group" event with the group items on removeGroup()', () => {
            const service = getService();
            const item = createItem('a');

            service.items = [item];

            const emitSpy = jest.spyOn(service.onDelete, 'next');

            service.removeGroup({ id: 'group', title: 'group', items: [item] });

            expect(emitSpy).toHaveBeenCalledWith({ type: 'group', items: [item] });
            expect(service.isEmpty).toBe(true);
        });

        it('emits an "all" event with a snapshot of all items on removeAll()', () => {
            const service = getService();
            const items = [createItem('a'), createItem('b')];

            service.items = items;

            const emitSpy = jest.spyOn(service.onDelete, 'next');

            service.removeAll();

            expect(emitSpy).toHaveBeenCalledWith({ type: 'all', items });
            expect(service.isEmpty).toBe(true);
        });
    });

    describe('items ingestion', () => {
        beforeEach(() => setUpDefaultFixture());

        it('gives items ingested in the same tick distinct ids', () => {
            const service = getService();

            service.items = [createItem('a'), createItem('b'), createItem('c')];

            const ids = service.items.map((item) => item.id);

            expect(new Set(ids).size).toBe(3);
        });

        it('defaults read to false and keeps an explicit value', () => {
            const service = getService();

            service.items = [createItem('a'), { ...createItem('b'), read: true }];

            expect(service.items.map((item) => item.read)).toEqual([false, true]);
        });

        it('ignores a push of a notification that is already in the list', () => {
            const service = getService();
            const toastService = TestBed.inject(KbqToastService);
            const showSpy = jest.spyOn(toastService, 'show').mockReturnValue({ id: 1, ref: createToastRef() });
            const item = createItem('a');

            service.push(item);
            service.push(item);

            expect(service.items).toHaveLength(1);
            expect(showSpy).toHaveBeenCalledTimes(1);
        });

        it('marks an item read when its toast is read', () => {
            const service = getService();
            const toastService = TestBed.inject(KbqToastService);
            const item = createItem('a');

            service.items = [item];

            const onReadSpy = jest.spyOn(service.onRead, 'next');

            toastService.read.next({ id: item.id });

            expect(item.read).toBe(true);
            // The correctly typed item must be emitted, not the toast payload it was matched by.
            expect(onReadSpy).toHaveBeenCalledWith(item);
        });
    });

    describe('silent mode', () => {
        beforeEach(() => setUpDefaultFixture());

        it('suppresses the toast of a pushed notification', () => {
            const service = getService();
            const toastService = TestBed.inject(KbqToastService);
            const showSpy = jest.spyOn(toastService, 'show').mockReturnValue({ id: 1, ref: createToastRef() });

            service.setSilentMode(true);
            service.push(createItem('a'));

            expect(showSpy).not.toHaveBeenCalled();
            expect(service.items).toHaveLength(1);
        });

        it('is switched from the panel dropdown options', fakeAsync(() => {
            const service = getService();

            openCenter();
            flush();

            queryPanel('[data-testid="kbq-notification-center-silent-mode-toggle"]')!.click();
            fixture.detectChanges();
            flush();

            queryPanel('[data-testid="kbq-notification-center-do-not-disturb-button"]')!.click();
            fixture.detectChanges();
            flush();

            expect(service.silentMode.value).toBe(true);
        }));
    });

    describe('unreadItemsCounter', () => {
        beforeEach(() => setUpDefaultFixture());

        const readCounter = (): string => {
            let value = '';

            getService()
                .unreadItemsCounter.subscribe((counter) => (value = counter))
                .unsubscribe();

            return value;
        };

        const createItems = (count: number) => Array.from({ length: count }, (_, index) => createItem(`item-${index}`));

        it('is empty while nothing is unread', () => {
            getService().items = [{ ...createItem('a'), read: true }];

            expect(readCounter()).toBe('');
        });

        it('counts the unread notifications', () => {
            getService().items = [createItem('a'), createItem('b'), { ...createItem('c'), read: true }];

            expect(readCounter()).toBe('2');
        });

        it('still shows the exact count at the documented boundary', () => {
            getService().items = createItems(99);

            expect(readCounter()).toBe('99');
        });

        it('switches to "99+" only above the boundary', () => {
            getService().items = createItems(100);

            expect(readCounter()).toBe('99+');
        });

        it('is shared between subscribers instead of re-created on every read', () => {
            const service = getService();

            expect(service.unreadItemsCounter).toBe(service.unreadItemsCounter);
        });
    });

    describe('hideToast', () => {
        beforeEach(() => setUpDefaultFixture());

        it('push() stores the returned toast id on the item', () => {
            const service = getService();
            const toastService = TestBed.inject(KbqToastService);

            jest.spyOn(toastService, 'show').mockReturnValue({ id: 42, ref: createToastRef() });

            const item = createItem('a');

            service.push(item);

            expect(item.toastId).toBe(42);
        });

        it('hides the toast by the stored toastId and clears it', () => {
            const service = getService();
            const toastService = TestBed.inject(KbqToastService);
            const hideSpy = jest.spyOn(toastService, 'hide').mockImplementation();

            const item: KbqNotificationItem = { ...createItem('a'), toastId: 42 };

            service.hideToast(item);

            expect(hideSpy).toHaveBeenCalledWith(42);
            expect(item.toastId).toBeUndefined();
        });

        it('does nothing when the item has no toastId', () => {
            const service = getService();
            const toastService = TestBed.inject(KbqToastService);
            const hideSpy = jest.spyOn(toastService, 'hide').mockImplementation();

            service.hideToast(createItem('a'));

            expect(hideSpy).not.toHaveBeenCalled();
        });

        it('remove() hides the toast of the removed item', () => {
            const service = getService();
            const toastService = TestBed.inject(KbqToastService);

            jest.spyOn(toastService, 'show').mockReturnValue({ id: 7, ref: createToastRef() });
            const hideSpy = jest.spyOn(toastService, 'hide').mockImplementation();

            const item = createItem('a');

            service.push(item);
            service.remove(item);

            expect(hideSpy).toHaveBeenCalledWith(7);
        });

        it('removeAll() hides the toasts of all items shown via push()', () => {
            const service = getService();
            const toastService = TestBed.inject(KbqToastService);

            jest.spyOn(toastService, 'show')
                .mockReturnValueOnce({ id: 1, ref: createToastRef() })
                .mockReturnValueOnce({ id: 2, ref: createToastRef() });
            const hideSpy = jest.spyOn(toastService, 'hide').mockImplementation();

            service.push(createItem('a'));
            service.push(createItem('b'));
            service.removeAll();

            expect(hideSpy).toHaveBeenCalledWith(1);
            expect(hideSpy).toHaveBeenCalledWith(2);
        });
    });

    describe('ordering', () => {
        beforeEach(() => setUpDefaultFixture());

        // groupedItems is built from a BehaviorSubject, so it emits synchronously on subscribe.
        const readTitles = (service: KbqNotificationCenterService): string[][] => {
            let titles: string[][] = [];

            service.groupedItems
                .subscribe((groups) => (titles = groups.map((group) => group.items.map((item) => String(item.title)))))
                .unsubscribe();

            return titles;
        };

        it('always orders groups and items from newest to oldest, regardless of input order', () => {
            const service = getService();

            // Two days × two times, provided deliberately scrambled. Midday UTC times keep each
            // pair in the same day-group regardless of the test machine's timezone.
            service.items = [
                createItem('1a', '2025-10-01T12:00:00.000Z'),
                createItem('2b', '2025-10-02T15:00:00.000Z'),
                createItem('1b', '2025-10-01T15:00:00.000Z'),
                createItem('2a', '2025-10-02T12:00:00.000Z')
            ];

            // Newest day first; within each day the newest notification first.
            expect(readTitles(service)).toEqual([
                ['2b', '2a'],
                ['1b', '1a']
            ]);
        });
    });

    describe('onRead', () => {
        beforeEach(() => setUpDefaultFixture());

        // The rendered notification item hosts KbqReadStateDirective, whose (click) handler emits
        // read=true on every click. onRead must still fire only on the unread -> read transition.
        it('emits onRead only once per item across repeated read events', fakeAsync(() => {
            const service = getService();
            const item = createItem('a');

            service.items = [item];

            openCenter();
            flush();
            fixture.detectChanges();

            const itemElement = queryPanel('kbq-notification-item');

            expect(itemElement).not.toBeNull();

            const onReadSpy = jest.spyOn(service.onRead, 'next');

            itemElement!.click();
            itemElement!.click();
            itemElement!.click();

            expect(onReadSpy).toHaveBeenCalledTimes(1);
            expect(onReadSpy).toHaveBeenCalledWith(item);
            expect(item.read).toBe(true);
        }));
    });

    describe('templates', () => {
        let templateFixture: ComponentFixture<NotificationCenterWithTemplates>;

        beforeEach(() => {
            templateFixture = createComponent(NotificationCenterWithTemplates);
            overlayContainer = TestBed.inject(OverlayContainer);
        });

        it('renders the consumer templates with the item as the context', fakeAsync(() => {
            const service = TestBed.inject(KbqNotificationCenterService);
            const host = templateFixture.componentInstance;

            service.items = [
                {
                    date: new Date().toISOString(),
                    title: host.titleTemplate(),
                    caption: host.captionTemplate()
                }
            ];

            host.trigger().show();
            templateFixture.detectChanges();
            flush();
            templateFixture.detectChanges();

            const panel = overlayContainer.getContainerElement();

            // The context exposes the notification, not the item component that renders it.
            expect(panel.querySelector('[data-testid="template-title"]')!.textContent).toContain('templated');
            expect(panel.querySelector('[data-testid="template-caption"]')!.textContent).toContain('templated');
        }));
    });

    describe('configuration override', () => {
        it('renders the strings registered through kbqNotificationCenterLocaleConfigurationProvider', fakeAsync(() => {
            setUpDefaultFixture([
                kbqNotificationCenterLocaleConfigurationProvider({
                    notifications: 'Custom notifications',
                    noNotifications: 'Custom empty'
                })
            ]);

            openCenter();
            flush();
            fixture.detectChanges();

            expect(queryPanel('.kbq-notification-center-title__text')!.textContent).toContain('Custom notifications');
            expect(queryPanel('[data-testid="kbq-notification-center-empty"]')!.textContent).toContain('Custom empty');
        }));

        it('leaves the sections it does not name following the locale', fakeAsync(() => {
            setUpDefaultFixture([kbqNotificationCenterLocaleConfigurationProvider({ notifications: 'Custom' })]);

            openCenter();
            flush();
            fixture.detectChanges();

            expect(queryPanel('[data-testid="kbq-notification-center-empty"]')!.textContent).toContain(
                ruRULocaleData.notificationCenter.noNotifications
            );
        }));
    });

    describe('loading and empty states', () => {
        beforeEach(() => setUpDefaultFixture());

        it('replaces the list with the full-screen loader in loading mode', fakeAsync(() => {
            const service = getService();

            service.items = [createItem('a')];

            openCenter();
            flush();

            service.setLoadingMode(true);
            fixture.detectChanges();

            expect(queryPanel('[data-testid="kbq-notification-center-loader"]')).not.toBeNull();
            expect(queryPanel('kbq-notification-item')).toBeNull();
        }));

        it('hides the remove-all button while the list is empty', fakeAsync(() => {
            const service = getService();

            openCenter();
            flush();

            expect(queryPanel('[data-testid="kbq-notification-center-remove-all-button"]')).toBeNull();

            service.items = [createItem('a')];
            fixture.detectChanges();

            expect(queryPanel('[data-testid="kbq-notification-center-remove-all-button"]')).not.toBeNull();
        }));
    });

    describe('standalone usage', () => {
        it('opens without KbqNotificationCenterModule', fakeAsync(() => {
            const standaloneFixture = createComponent(StandaloneNotificationCenter);

            overlayContainer = TestBed.inject(OverlayContainer);

            expect(() => {
                standaloneFixture.componentInstance.trigger().show();
                standaloneFixture.detectChanges();
                flush();
            }).not.toThrow();

            expect(overlayContainer.getContainerElement().querySelector('.kbq-notification-center')).not.toBeNull();
        }));
    });

    describe('stickToWindow', () => {
        afterEach(() => {
            overlayContainer?.ngOnDestroy();
        });

        // OverlayContainer should be injected after createComponent, otherwise TestBed
        // gets instantiated before configureTestingModule
        const createStickComponent = <T>(component: Type<T>): ComponentFixture<T> => {
            const stickFixture = createComponent(component);

            overlayContainer = TestBed.inject(OverlayContainer);

            return stickFixture;
        };

        const getOverlayPane = (): HTMLElement =>
            overlayContainer.getContainerElement().querySelector('.cdk-overlay-pane') as HTMLElement;

        it('should re-apply stick position on window resize', fakeAsync(() => {
            const stickFixture = createStickComponent(NotificationCenterWithStick);

            stickFixture.componentInstance.trigger().show();
            stickFixture.detectChanges();
            tick();

            const pane = getOverlayPane();

            expect(pane.style.right).toMatch(/^0(px)?$/);
            expect(pane.style.left).toBe('unset');

            // simulate the position strategy wiping the manual stick styles on resize
            pane.style.right = '';
            pane.style.left = '50px';

            dispatchFakeEvent(window, 'resize');
            tick(20);

            expect(pane.style.right).toMatch(/^0(px)?$/);
            expect(pane.style.left).toBe('unset');
        }));

        it('should recalculate stick position against the container on window resize', fakeAsync(() => {
            const stickFixture = createStickComponent(NotificationCenterWithStickContainer);

            stickFixture.componentInstance.trigger().show();
            stickFixture.detectChanges();
            tick();

            const pane = getOverlayPane();
            const panel = overlayContainer.getContainerElement().querySelector('.kbq-notification-center')!;

            jest.spyOn(panel, 'getBoundingClientRect').mockReturnValue({ width: 400, height: 300 } as DOMRect);
            jest.spyOn(
                stickFixture.componentInstance.container().nativeElement,
                'getBoundingClientRect'
            ).mockReturnValue({
                left: 0,
                right: 800,
                top: 0,
                bottom: 500
            } as DOMRect);

            dispatchFakeEvent(window, 'resize');
            tick(20);

            expect(pane.style.left).toBe('400px');
            expect(pane.style.right).toBe('unset');
        }));

        it('should stop re-applying stick position after the panel is closed', fakeAsync(() => {
            const stickFixture = createStickComponent(NotificationCenterWithStick);
            const trigger = stickFixture.componentInstance.trigger();

            trigger.show();
            stickFixture.detectChanges();
            tick();

            const pane = getOverlayPane();

            trigger.hide();
            stickFixture.detectChanges();
            tick();

            pane.style.right = '';
            pane.style.left = '50px';

            dispatchFakeEvent(window, 'resize');
            tick(20);

            expect(pane.style.right).toBe('');
            expect(pane.style.left).toBe('50px');
        }));
    });

    describe('locale', () => {
        let localeFixture: ComponentFixture<SimpleNotificationCenter>;
        let localeService: KbqLocaleService;

        beforeEach(() => {
            localeFixture = createComponent(SimpleNotificationCenter, [
                { provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService }
            ]);

            overlayContainer = TestBed.inject(OverlayContainer);
            // The component resolves the service from the token, so the test must drive that very instance.
            localeService = TestBed.inject(KBQ_LOCALE_SERVICE);
        });

        afterEach(() => {
            overlayContainer?.ngOnDestroy();
        });

        // Rendered by KbqNotificationItemComponent, not by the center itself.
        const getItemRemoveButtonLabel = () =>
            overlayContainer
                .getContainerElement()
                .querySelector('[data-testid="kbq-notification-item-remove-button"]')
                ?.getAttribute('aria-label');

        it('relabels the remove button of already rendered items when the locale changes at runtime', () => {
            const trigger = localeFixture.componentInstance.trigger();
            const service = (trigger as unknown as { service: KbqNotificationCenterService }).service;
            const item: KbqNotificationItem = { title: 'a', date: new Date().toISOString() };

            service.items = [item];

            trigger.show();
            localeFixture.detectChanges();

            expect(getItemRemoveButtonLabel()).toBe(ruRULocaleData.notificationCenter.remove);

            localeService.setLocale('en-US');
            localeFixture.detectChanges();

            // The item is a separate OnPush component reading the center's locale data from its own
            // template: marking the center for check leaves the already rendered item untouched.
            expect(getItemRemoveButtonLabel()).toBe(enUSLocaleData.notificationCenter.remove);
        });
    });
});

describe('KbqNotificationCenter with the Moment adapter', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [KbqMomentDateModule, KbqFormattersModule] });
    });

    it('keeps notifications from different days in different groups', () => {
        const service = TestBed.inject(KbqNotificationCenterService);

        // The group key used to be built from a `'yyyyMMdd'` format string: under Moment `yyyy` is the
        // era year and `dd` the minimal weekday name, so every Saturday of a month keyed identically.
        service.items = [
            { title: 'a', date: '2026-07-04T12:00:00.000Z' },
            { title: 'b', date: '2026-07-11T12:00:00.000Z' }
        ];

        let groups: KbqNotificationsGroup[] = [];

        service.groupedItems.subscribe((value) => (groups = value)).unsubscribe();

        expect(groups).toHaveLength(2);
    });
});

/** Minimal stand-in for the `ComponentRef` half of a toast handle; only its `id` is ever read. */
const createToastRef = () => ({}) as ReturnType<KbqToastService['show']>['ref'];

@Component({
    selector: 'simple-notification-center',
    imports: [KbqNotificationCenterModule],
    template: `
        <button
            kbqNotificationCenterTrigger
            [disabled]="disabled"
            [scrolledToBottomOffset]="scrolledToBottomOffset"
            (kbqVisibleChange)="visibleChanges.push($event)"
        >
            notification-center Trigger
        </button>
    `
})
class SimpleNotificationCenter {
    readonly trigger = viewChild.required(KbqNotificationCenterTrigger);
    readonly visibleChanges: boolean[] = [];

    disabled = false;
    scrolledToBottomOffset = 0;
}

@Component({
    selector: 'standalone-notification-center',
    imports: [KbqNotificationCenterTrigger],
    template: `
        <button kbqNotificationCenterTrigger>notification-center Trigger</button>
    `
})
class StandaloneNotificationCenter {
    readonly trigger = viewChild.required(KbqNotificationCenterTrigger);
}

@Component({
    selector: 'notification-center-with-outer-scrollable',
    imports: [KbqNotificationCenterModule, CdkScrollable],
    template: `
        <div #outer cdkScrollable></div>
        <button kbqNotificationCenterTrigger>notification-center Trigger</button>
    `
})
class NotificationCenterWithOuterScrollable {
    readonly trigger = viewChild.required(KbqNotificationCenterTrigger);
    readonly outer = viewChild.required<ElementRef<HTMLElement>>('outer');
}

@Component({
    selector: 'notification-center-with-templates',
    imports: [KbqNotificationCenterModule],
    template: `
        <ng-template #title let-item>
            <span data-testid="template-title">templated {{ item.title === titleTemplate() ? 'title' : '' }}</span>
        </ng-template>
        <ng-template #caption let-item>
            <span data-testid="template-caption">templated {{ item.date ? 'caption' : '' }}</span>
        </ng-template>

        <button kbqNotificationCenterTrigger>notification-center Trigger</button>
    `
})
class NotificationCenterWithTemplates {
    readonly trigger = viewChild.required(KbqNotificationCenterTrigger);
    readonly titleTemplate = viewChild.required<TemplateRef<unknown>>('title');
    readonly captionTemplate = viewChild.required<TemplateRef<unknown>>('caption');
}

@Component({
    selector: 'notification-center-with-stick',
    imports: [KbqNotificationCenterModule],
    template: `
        <button kbqNotificationCenterTrigger stickToWindow="right">notification-center Trigger</button>
    `
})
class NotificationCenterWithStick {
    readonly trigger = viewChild.required(KbqNotificationCenterTrigger);
}

@Component({
    selector: 'notification-center-with-stick-container',
    imports: [KbqNotificationCenterModule],
    template: `
        <div #containerRef>
            <button kbqNotificationCenterTrigger stickToWindow="right" [container]="containerRef">
                notification-center Trigger
            </button>
        </div>
    `
})
class NotificationCenterWithStickContainer {
    readonly trigger = viewChild.required(KbqNotificationCenterTrigger);
    readonly container = viewChild.required<ElementRef<HTMLElement>>('containerRef');
}

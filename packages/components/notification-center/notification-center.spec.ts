import { CdkTrapFocus, InputModalityDetector } from '@angular/cdk/a11y';
import { ENTER, ESCAPE } from '@angular/cdk/keycodes';
import { OverlayContainer } from '@angular/cdk/overlay';
import { CdkScrollable, ScrollDispatcher } from '@angular/cdk/scrolling';
import { Component, DebugElement, ElementRef, Provider, TemplateRef, Type, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
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
                getPropertyValue: (_property: string) => '',
                textOverflow: ''
            })
        });
    });

    afterAll(() => {
        Object.defineProperty(global.window, 'getComputedStyle', {
            configurable: true,
            value: originalGetComputedStyle
        });
    });

    const createComponent = <T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> => {
        TestBed.configureTestingModule({
            imports: [component, KbqLuxonDateModule, KbqFormattersModule],
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
        vi.useRealTimers();
    });

    describe('trigger', () => {
        beforeEach(() => setUpDefaultFixture());

        it('show() renders the panel', async () => {
            vi.useFakeTimers();

            expect(debugElement.query(By.css('.kbq-notification-center'))).toBe(null);

            openCenter();

            expect(debugElement.query(By.css('.kbq-notification-center'))).not.toBe(null);
            expect(debugElement.query(By.css('.kbq-notification-center-header'))).not.toBe(null);
        });

        it('opens on click, and a repeat click is not a toggle', async () => {
            vi.useFakeTimers();

            const triggerElement = debugElement.query(By.css('button')).nativeElement as HTMLElement;

            triggerElement.click();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(componentInstance.trigger().isOpen).toBe(true);

            // The same click both closes the panel through the overlay and re-opens it through the
            // trigger, so it stays open. Closing is covered by the "closing actions" cases below.
            triggerElement.click();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(componentInstance.trigger().isOpen).toBe(true);
        });

        it('opens from the keyboard', async () => {
            vi.useFakeTimers();

            const triggerElement = debugElement.query(By.css('button')).nativeElement as HTMLElement;

            dispatchKeyboardEvent(triggerElement, 'keydown', ENTER, undefined, 'Enter');
            fixture.detectChanges();
            // The keydown defers the show to a timer, and the show schedules the panel's own.
            await vi.runOnlyPendingTimersAsync();
            await vi.runOnlyPendingTimersAsync();

            expect(componentInstance.trigger().isOpen).toBe(true);
        });

        it('does not open while disabled', async () => {
            vi.useFakeTimers();

            componentInstance.disabled = true;
            fixture.detectChanges();

            openCenter();
            await vi.runOnlyPendingTimersAsync();

            expect(getPanel()).toBeNull();
        });

        it('emits kbqVisibleChange on open and close', async () => {
            vi.useFakeTimers();

            openCenter();
            await vi.runOnlyPendingTimersAsync();

            expect(componentInstance.visibleChanges).toEqual([true]);

            componentInstance.trigger().hide();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(componentInstance.visibleChanges).toEqual([true, false]);
        });

        it('reflects the panel state through aria-expanded and aria-controls', async () => {
            vi.useFakeTimers();

            const triggerElement = debugElement.query(By.css('button')).nativeElement as HTMLElement;

            expect(triggerElement.getAttribute('aria-expanded')).toBe('false');
            expect(triggerElement.getAttribute('aria-controls')).toBeNull();

            openCenter();
            await vi.runOnlyPendingTimersAsync();
            fixture.detectChanges();

            expect(triggerElement.getAttribute('aria-expanded')).toBe('true');
            expect(triggerElement.getAttribute('aria-controls')).toBe(getPanel()!.getAttribute('id'));
        });

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

            it('carries a tooltip with the localized "remove all" text', async () => {
                vi.useFakeTimers();

                getService().items = [{ title: 'a', date: new Date().toISOString() }];

                componentInstance.trigger().show();
                fixture.detectChanges();

                const button = debugElement.query(By.css('[data-testid="kbq-notification-center-remove-all-button"]'));

                expect(button.injector.get(KbqTooltipTrigger).content).toBe(
                    ruRULocaleData.notificationCenter.removeAll
                );
            });
        });

        it('propagates popoverHeight to an already open panel, including clearing it', async () => {
            vi.useFakeTimers();

            openCenter();
            await vi.runOnlyPendingTimersAsync();

            componentInstance.trigger().popoverHeight = '500px';

            expect(getPanel()!.style.getPropertyValue('--kbq-notification-center-popover-height')).toBe('500px');

            componentInstance.trigger().popoverHeight = '';

            expect(getPanel()!.style.getPropertyValue('--kbq-notification-center-popover-height')).toBe('');
        });
    });

    describe('accessibility', () => {
        beforeEach(() => setUpDefaultFixture());

        const silentModeToggle = () => queryPanel('[data-testid="kbq-notification-center-silent-mode-toggle"]')!;

        /**
         * Reports the modality of the event it dispatches. The detector is created lazily, and in a test
         * nothing has injected it before the panel is built — so its document listeners have to exist
         * before the event, or every open looks programmatic.
         */
        const useModality = (event: Event) => {
            TestBed.inject(InputModalityDetector);
            document.dispatchEvent(event);
        };

        // No timers are run: a keyboard-origin focus opens the switcher's own tooltip, whose delay tracker
        // keeps rescheduling, so they never drain. The focus class lands synchronously anyway.
        it('paints a focus ring on the silent-mode toggle when the panel is opened from the keyboard', () => {
            useModality(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
            openCenter();

            expect(silentModeToggle().classList).toContain('cdk-keyboard-focused');
        });

        it('leaves the silent-mode toggle without a focus ring when the panel is opened by mouse', async () => {
            vi.useFakeTimers();

            // Both `buttons` and `detail` are set: CDK calls a mousedown with either at zero the fake one a screen
            // reader emits and attributes it to the keyboard instead.
            useModality(new MouseEvent('mousedown', { bubbles: true, buttons: 1, detail: 1 }));
            openCenter();
            await vi.runOnlyPendingTimersAsync();

            expect(silentModeToggle().classList).not.toContain('cdk-keyboard-focused');
        });

        it('names the panel with its own title', async () => {
            vi.useFakeTimers();

            openCenter();
            await vi.runOnlyPendingTimersAsync();

            const panel = getPanel()!;
            const title = queryPanel('.kbq-notification-center-title__text')!;

            expect(panel.getAttribute('role')).toBe('dialog');
            expect(panel.getAttribute('aria-labelledby')).toBe(title.getAttribute('id'));
            expect(title.textContent!.trim().length).toBeGreaterThan(0);
        });

        it('traps focus inside the panel', async () => {
            vi.useFakeTimers();

            openCenter();
            await vi.runOnlyPendingTimersAsync();

            const trap = debugElement.query(By.directive(CdkTrapFocus));

            expect(trap).not.toBe(null);
            expect(trap.injector.get(CdkTrapFocus).enabled).toBe(true);
        });

        it('gives every icon-only button an accessible name', async () => {
            vi.useFakeTimers();

            getService().items = [createItem('a')];

            openCenter();
            await vi.runOnlyPendingTimersAsync();
            fixture.detectChanges();

            const buttons = queryAllInPanel('button');

            expect(buttons.length).toBeGreaterThan(0);

            buttons.forEach((button) => {
                const name = button.getAttribute('aria-label') || button.textContent!.trim();

                expect(name.length).toBeGreaterThan(0);
            });
        });

        it('renders both delete buttons enabled', async () => {
            vi.useFakeTimers();

            getService().items = [createItem('a')];

            openCenter();
            await vi.runOnlyPendingTimersAsync();
            fixture.detectChanges();

            const deleteButtonTestIds = [
                'kbq-notification-center-remove-group-button',
                'kbq-notification-item-remove-button'
            ];

            // Whether they are in the tab order is a question about the stylesheet, which the unit tests
            // never apply (they load no `styleUrls`) — that is pinned by the
            // Playwright test "the delete buttons are reachable with the keyboard".
            deleteButtonTestIds.forEach((testId) => {
                const button = queryPanel(`[data-testid="${testId}"]`)!;

                expect(button).not.toBeNull();
                expect(button.hasAttribute('disabled')).toBe(false);
            });
        });

        it('conveys the unread state with text, not with the indicator dot alone', async () => {
            vi.useFakeTimers();

            getService().items = [
                createItem('a', '2025-10-02T12:00:00.000Z'),
                { ...createItem('b', '2025-10-01T12:00:00.000Z'), read: true }
            ];

            openCenter();
            await vi.runOnlyPendingTimersAsync();
            fixture.detectChanges();

            const items = queryAllInPanel('kbq-notification-item');

            expect(items[0].textContent).toContain('Не прочитано');
            expect(items[1].textContent).not.toContain('Не прочитано');
        });

        it('marks an item read after dwelling on it with the keyboard', async () => {
            vi.useFakeTimers();

            const service = getService();
            const item = createItem('a');

            service.items = [item];

            openCenter();
            await vi.runOnlyPendingTimersAsync();
            fixture.detectChanges();

            const itemElement = queryPanel('kbq-notification-item')!;

            // The dwell used to be tracked for `mouseenter`/`mouseleave` only, so an item could never
            // be read without a pointer.
            dispatchFakeEvent(itemElement, 'focusin', true);
            await vi.advanceTimersByTimeAsync(600);
            dispatchFakeEvent(itemElement, 'focusout', true);

            expect(item.read).toBe(true);
        });

        it('closes on Escape from an element inside the panel', async () => {
            vi.useFakeTimers();

            openCenter();
            await vi.runOnlyPendingTimersAsync();

            dispatchKeyboardEvent(queryPanel('button')!, 'keydown', ESCAPE, undefined, 'Escape');
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(componentInstance.trigger().isOpen).toBe(false);
        });

        it('returns focus to the trigger when the panel closes', async () => {
            vi.useFakeTimers();

            const triggerElement = debugElement.query(By.css('button')).nativeElement as HTMLElement;

            openCenter();
            await vi.runOnlyPendingTimersAsync();

            componentInstance.trigger().hide();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(document.activeElement).toBe(triggerElement);
        });

        it('keeps focus inside the panel after every notification is removed', async () => {
            vi.useFakeTimers();

            getService().items = [createItem('a')];

            openCenter();
            await vi.runOnlyPendingTimersAsync();
            fixture.detectChanges();

            queryPanel('[data-testid="kbq-notification-center-remove-all-button"]')!.click();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(getPanel()!.contains(document.activeElement)).toBe(true);
        });

        it('keeps focus inside the panel after a day group is removed', async () => {
            vi.useFakeTimers();

            getService().items = [createItem('a', '2025-10-01T12:00:00.000Z'), createItem('b')];

            openCenter();
            await vi.runOnlyPendingTimersAsync();
            fixture.detectChanges();

            queryPanel('[data-testid="kbq-notification-center-remove-group-button"]')!.click();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(getPanel()!.contains(document.activeElement)).toBe(true);
        });

        it('removes a notification from its own delete button', async () => {
            vi.useFakeTimers();

            const service = getService();

            service.items = [createItem('a')];

            openCenter();
            await vi.runOnlyPendingTimersAsync();
            fixture.detectChanges();

            queryPanel('[data-testid="kbq-notification-item-remove-button"]')!.click();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(service.isEmpty).toBe(true);
            expect(getPanel()!.contains(document.activeElement)).toBe(true);
        });

        it('moves focus to a delete button next to the removed one, never to the topmost group', async () => {
            vi.useFakeTimers();

            getService().items = [
                createItem('a', '2025-10-03T12:00:00.000Z'),
                createItem('b', '2025-10-02T12:00:00.000Z'),
                createItem('c', '2025-10-01T12:00:00.000Z')
            ];

            openCenter();
            await vi.runOnlyPendingTimersAsync();
            fixture.detectChanges();

            const itemButtons = queryAllInPanel('[data-testid="kbq-notification-item-remove-button"]');
            const firstGroupButton = queryPanel('[data-testid="kbq-notification-center-remove-group-button"]')!;
            const lastItemButton = itemButtons[itemButtons.length - 1];

            lastItemButton.focus();
            lastItemButton.click();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            // Focus used to go wherever `querySelector` answered first — always the topmost day group's
            // "delete this day" button, a destructive control the user never aimed at and one that sits
            // behind its own sticky header.
            expect(document.activeElement).not.toBe(firstGroupButton);
            expect(document.activeElement).toBe(itemButtons[itemButtons.length - 2]);
        });

        it('announces the panel status through a single persistent live region', async () => {
            vi.useFakeTimers();

            const service = getService();

            openCenter();
            await vi.runOnlyPendingTimersAsync();
            fixture.detectChanges();

            const status = queryPanel('[data-testid="kbq-notification-center-status"]')!;

            expect(status.getAttribute('aria-live')).toBe('polite');
            expect(status.textContent!.trim()).toBe('Нет уведомлений');

            service.setLoadingMore(true);
            fixture.detectChanges();

            expect(status.textContent!.trim()).toBe('Загрузка уведомлений');

            // The region is never re-created, so the announcement is not lost.
            expect(queryPanel('[data-testid="kbq-notification-center-status"]')).toBe(status);
        });

        it('announces loading, not emptiness, while the full-screen loader replaces the list', async () => {
            vi.useFakeTimers();

            const service = getService();

            openCenter();
            await vi.runOnlyPendingTimersAsync();
            fixture.detectChanges();

            const status = queryPanel('[data-testid="kbq-notification-center-status"]')!;

            service.setLoadingMode(true);
            fixture.detectChanges();

            // The list is empty by definition while the first page loads, and the region used to read
            // "no notifications" over the spinning loader.
            expect(queryPanel('[data-testid="kbq-notification-center-loader"]')).not.toBeNull();
            expect(status.textContent!.trim()).toBe(ruRULocaleData.notificationCenter.loadingMore);
        });

        it('announces the bottom row the template actually renders when both flags are set', async () => {
            vi.useFakeTimers();

            const service = getService();

            openCenter();
            await vi.runOnlyPendingTimersAsync();
            fixture.detectChanges();

            const status = queryPanel('[data-testid="kbq-notification-center-status"]')!;

            service.setLoadingMore(true);
            service.setLoadMoreErrorMode(true);
            fixture.detectChanges();

            // The template shows the spinner in this state; the region used to branch on the error
            // first and announce a failure that is nowhere on screen.
            expect(queryPanel('[data-testid="kbq-notification-center-load-more"]')).not.toBeNull();
            expect(status.textContent!.trim()).toBe(ruRULocaleData.notificationCenter.loadingMore);
        });

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

                vi.spyOn(TestBed.inject(KbqToastService), 'show').mockReturnValue({ id: 1, ref: {} as any });

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

        it('renders the item with an empty time instead of failing change detection', async () => {
            vi.useFakeTimers();

            getService().items = [createItem('a', 'garbage')];

            await expect(
                (async () => {
                    openCenter();
                    await vi.runOnlyPendingTimersAsync();
                    fixture.detectChanges();
                })()
            ).resolves.not.toThrow();

            expect(queryPanel('.kbq-notification-item-time__value')!.textContent!.trim()).toBe('');
        });
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

        it('keeps the rendered items when the list is appended to', async () => {
            vi.useFakeTimers();

            const service = getService();

            service.items = [createItem('a', '2025-10-01T12:00:00.000Z')];

            openCenter();
            await vi.runOnlyPendingTimersAsync();
            fixture.detectChanges();

            const before = queryPanel('kbq-notification-item');

            service.push(createItem('b', '2025-10-01T13:00:00.000Z'));
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            // Tracking by identity used to throw every rendered row away on each emission.
            expect(queryAllInPanel('kbq-notification-item')).toContain(before);
        });
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

        it('shows the bottom "load more" spinner without replacing the list', async () => {
            vi.useFakeTimers();

            const service = getService();

            openCenter();

            service.setLoadingMore(true);
            fixture.detectChanges();

            expect(debugElement.query(By.css('.kbq-notification-center-load-more kbq-progress-spinner'))).not.toBe(
                null
            );
            // the full-screen loader must NOT replace the list
            expect(debugElement.query(By.css('.kbq-loader-overlay'))).toBe(null);
        });

        it('shows the bottom "load more" error row, separate from the full-screen error', async () => {
            vi.useFakeTimers();

            const service = getService();

            openCenter();

            service.setLoadMoreErrorMode(true);
            fixture.detectChanges();

            const errorRow = debugElement.query(By.css('.kbq-notification-center-load-more-error'));

            expect(errorRow).not.toBe(null);
            expect(errorRow.query(By.css('button'))).not.toBe(null);
            // full-screen error state must NOT be shown
            expect(debugElement.query(By.css('.kbq-notification-center-error-container'))).toBe(null);
        });

        it('never shows the spinner and the error row at the same time', async () => {
            vi.useFakeTimers();

            const service = getService();

            openCenter();

            service.setLoadingMore(true);
            service.setLoadMoreErrorMode(true);
            fixture.detectChanges();

            expect(debugElement.query(By.css('.kbq-notification-center-load-more'))).not.toBe(null);
            expect(debugElement.query(By.css('.kbq-notification-center-load-more-error'))).toBe(null);
        });

        it('re-emits onNextPage and clears the error when the bottom retry button is clicked', async () => {
            vi.useFakeTimers();

            const service = getService();
            const emitSpy = vi.spyOn(service.onNextPage, 'next');

            openCenter();

            service.setLoadMoreErrorMode(true);
            fixture.detectChanges();

            debugElement
                .query(By.css('.kbq-notification-center-load-more-error button'))
                .triggerEventHandler('click', {});

            expect(emitSpy).toHaveBeenCalled();
            // retry must reset the error state itself so the spinner and the error row can never coexist
            expect(service.loadMoreErrorMode.value).toBe(false);
        });

        it('keeps paging when a completed load leaves the list still at the bottom', async () => {
            vi.useFakeTimers();

            const service = getService();
            const emitSpy = vi.spyOn(service.onNextPage, 'next');

            openCenter();

            // The just-loaded page was too short to overflow: the list is still at the bottom and
            // no further scroll event will fire — completing the load must re-trigger paging.
            setAtBottomGeometry();

            service.setLoadingMore(true);
            service.setLoadingMore(false);
            await vi.advanceTimersByTimeAsync(SCROLLED_TO_BOTTOM_AUDIT_TIME);
            await vi.runOnlyPendingTimersAsync();

            expect(emitSpy).toHaveBeenCalled();
        });

        it('requests the first page when the initial list does not fill the viewport', async () => {
            vi.useFakeTimers();

            const service = getService();
            const emitSpy = vi.spyOn(service.onNextPage, 'next');

            openCenter();

            // Shorter than the viewport, so no scroll event will ever fire: the panel has to measure
            // itself or infinite scroll never starts.
            setGeometry({ scrollHeight: 400, clientHeight: 500, scrollTop: 0 });
            service.setHasMore(true);
            await vi.advanceTimersByTimeAsync(SCROLLED_TO_BOTTOM_AUDIT_TIME);
            await vi.runOnlyPendingTimersAsync();

            expect(emitSpy).toHaveBeenCalled();
        });

        it('does not request a page on its own when there is nothing more to load', async () => {
            vi.useFakeTimers();

            const service = getService();
            const emitSpy = vi.spyOn(service.onNextPage, 'next');

            openCenter();

            setGeometry({ scrollHeight: 400, clientHeight: 500, scrollTop: 0 });
            service.setHasMore(false);
            await vi.advanceTimersByTimeAsync(SCROLLED_TO_BOTTOM_AUDIT_TIME);
            await vi.runOnlyPendingTimersAsync();

            expect(emitSpy).not.toHaveBeenCalled();
        });

        it('keeps the full-screen error path emitting onReload', async () => {
            vi.useFakeTimers();

            const service = getService();
            const reloadSpy = vi.spyOn(service.onReload, 'next');

            openCenter();

            service.setErrorMode(true);
            fixture.detectChanges();

            const errorContainer = debugElement.query(By.css('.kbq-notification-center-error-container'));

            expect(errorContainer).not.toBe(null);
            // the bottom load-more rows must NOT render while the full-screen error is shown
            expect(debugElement.query(By.css('.kbq-notification-center-load-more'))).toBe(null);

            errorContainer.query(By.css('button')).triggerEventHandler('click', {});

            expect(reloadSpy).toHaveBeenCalled();
        });

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

        it('emits onNextPage when scrolled to the bottom with more to load', async () => {
            vi.useFakeTimers();

            const service = getService();
            const emitSpy = vi.spyOn(service.onNextPage, 'next');

            openCenter();

            scrollToBottom();
            await vi.advanceTimersByTimeAsync(SCROLLED_TO_BOTTOM_AUDIT_TIME);
            await vi.runOnlyPendingTimersAsync();

            expect(emitSpy).toHaveBeenCalled();
        });

        it('does not emit onNextPage when there is nothing more to load', async () => {
            vi.useFakeTimers();

            const service = getService();
            const emitSpy = vi.spyOn(service.onNextPage, 'next');

            openCenter();

            service.setHasMore(false);

            scrollToBottom();
            await vi.advanceTimersByTimeAsync(SCROLLED_TO_BOTTOM_AUDIT_TIME);
            await vi.runOnlyPendingTimersAsync();

            expect(emitSpy).not.toHaveBeenCalled();
        });

        it('does not emit onNextPage while a page is already loading', async () => {
            vi.useFakeTimers();

            const service = getService();
            const emitSpy = vi.spyOn(service.onNextPage, 'next');

            openCenter();

            service.setLoadingMore(true);

            scrollToBottom();
            await vi.advanceTimersByTimeAsync(SCROLLED_TO_BOTTOM_AUDIT_TIME);
            await vi.runOnlyPendingTimersAsync();

            expect(emitSpy).not.toHaveBeenCalled();
        });

        it('does not emit onNextPage while the load-more error is shown', async () => {
            vi.useFakeTimers();

            const service = getService();
            const emitSpy = vi.spyOn(service.onNextPage, 'next');

            openCenter();

            service.setLoadMoreErrorMode(true);

            scrollToBottom();
            await vi.advanceTimersByTimeAsync(SCROLLED_TO_BOTTOM_AUDIT_TIME);
            await vi.runOnlyPendingTimersAsync();

            expect(emitSpy).not.toHaveBeenCalled();
        });

        it('emits onNextPage at the bottom when fractional zoom leaves a sub-pixel gap', async () => {
            vi.useFakeTimers();

            const service = getService();
            const emitSpy = vi.spyOn(service.onNextPage, 'next');

            openCenter();

            // At fractional browser zoom `scrollHeight` / `clientHeight` are rounded to integers while
            // `scrollTop` stays fractional, so the true bottom reports a residual distance instead of 0.
            setGeometry({ scrollHeight: 1000, clientHeight: 500, scrollTop: 499.6 });
            dispatchFakeEvent(getCenter().scrollContainer().getNativeElement(), 'scroll');
            await vi.advanceTimersByTimeAsync(SCROLLED_TO_BOTTOM_AUDIT_TIME);
            await vi.runOnlyPendingTimersAsync();

            expect(emitSpy).toHaveBeenCalled();
        });

        it('does not emit onNextPage while the list is still a few pixels from the bottom', async () => {
            vi.useFakeTimers();

            const service = getService();
            const emitSpy = vi.spyOn(service.onNextPage, 'next');

            openCenter();

            // The sub-pixel tolerance must not stretch into a visible early trigger.
            setGeometry({ scrollHeight: 1000, clientHeight: 500, scrollTop: 495 });
            dispatchFakeEvent(getCenter().scrollContainer().getNativeElement(), 'scroll');
            await vi.advanceTimersByTimeAsync(SCROLLED_TO_BOTTOM_AUDIT_TIME);
            await vi.runOnlyPendingTimersAsync();

            expect(emitSpy).not.toHaveBeenCalled();
        });

        it('emits onNextPage within scrolledToBottomOffset of the bottom', async () => {
            vi.useFakeTimers();

            const service = getService();
            const emitSpy = vi.spyOn(service.onNextPage, 'next');

            componentInstance.scrolledToBottomOffset = 100;
            fixture.detectChanges();
            openCenter();

            // 50px from the actual bottom — within the 100px threshold
            setGeometry({ scrollHeight: 1000, clientHeight: 500, scrollTop: 450 });
            dispatchFakeEvent(getCenter().scrollContainer().getNativeElement(), 'scroll');
            await vi.advanceTimersByTimeAsync(SCROLLED_TO_BOTTOM_AUDIT_TIME);
            await vi.runOnlyPendingTimersAsync();

            expect(emitSpy).toHaveBeenCalled();
        });

        it('does not emit onNextPage when the distance exceeds scrolledToBottomOffset', async () => {
            vi.useFakeTimers();

            const service = getService();
            const emitSpy = vi.spyOn(service.onNextPage, 'next');

            componentInstance.scrolledToBottomOffset = 100;
            fixture.detectChanges();
            openCenter();

            // 150px from the actual bottom — outside the 100px threshold
            setGeometry({ scrollHeight: 1000, clientHeight: 500, scrollTop: 350 });
            dispatchFakeEvent(getCenter().scrollContainer().getNativeElement(), 'scroll');
            await vi.advanceTimersByTimeAsync(SCROLLED_TO_BOTTOM_AUDIT_TIME);
            await vi.runOnlyPendingTimersAsync();

            expect(emitSpy).not.toHaveBeenCalled();
        });

        it('scrolls the list to the bottom when the load-more spinner appears', async () => {
            vi.useFakeTimers();

            const service = getService();

            openCenter();
            setAtBottomGeometry();

            const scrollSpy = vi.spyOn(getCenter().scrollContainer(), 'scrollTo');

            service.setLoadingMore(true);
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(SCROLLED_TO_BOTTOM_AUDIT_TIME);
            await vi.runOnlyPendingTimersAsync();

            expect(scrollSpy).toHaveBeenCalledWith({ top: 1000 });
        });

        it('scrolls the list to the bottom when the load-more error row appears', async () => {
            vi.useFakeTimers();

            const service = getService();

            openCenter();
            setAtBottomGeometry();

            const scrollSpy = vi.spyOn(getCenter().scrollContainer(), 'scrollTo');

            service.setLoadMoreErrorMode(true);
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(SCROLLED_TO_BOTTOM_AUDIT_TIME);
            await vi.runOnlyPendingTimersAsync();

            expect(scrollSpy).toHaveBeenCalledWith({ top: 1000 });
        });

        it('does not scroll again when the spinner is turned off', async () => {
            vi.useFakeTimers();

            const service = getService();

            openCenter();
            setAtBottomGeometry();

            const scrollSpy = vi.spyOn(getCenter().scrollContainer(), 'scrollTo');

            service.setLoadingMore(true);
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(SCROLLED_TO_BOTTOM_AUDIT_TIME);
            await vi.runOnlyPendingTimersAsync();

            scrollSpy.mockClear();

            // true -> false must NOT scroll
            service.setLoadingMore(false);
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(SCROLLED_TO_BOTTOM_AUDIT_TIME);
            await vi.runOnlyPendingTimersAsync();

            expect(scrollSpy).not.toHaveBeenCalled();
        });

        it('does not scroll to the bottom on open when a load-more error is already shown', async () => {
            vi.useFakeTimers();

            const service = getService();

            // Error left over from a previous session, before the panel is opened.
            service.setLoadMoreErrorMode(true);

            openCenter();
            setAtBottomGeometry();

            const scrollSpy = vi.spyOn(getCenter().scrollContainer(), 'scrollTo');

            // The replayed BehaviorSubject value must not be treated as a fresh appearance: the panel
            // always opens scrolled to the top.
            await vi.advanceTimersByTimeAsync(SCROLLED_TO_BOTTOM_AUDIT_TIME);
            await vi.runOnlyPendingTimersAsync();

            expect(scrollSpy).not.toHaveBeenCalled();
        });
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

        it('stays open while its own list is scrolled', async () => {
            vi.useFakeTimers();

            openOuterCenter();
            await vi.runOnlyPendingTimersAsync();

            const panel = overlayContainer
                .getContainerElement()
                .querySelector<HTMLElement>('[data-testid="kbq-notification-center-container"]')!;

            dispatchFakeEvent(panel, 'scroll');
            await vi.advanceTimersByTimeAsync(SCROLLED_TO_BOTTOM_AUDIT_TIME);
            await vi.runOnlyPendingTimersAsync();

            expect(outerFixture.componentInstance.trigger().isOpen).toBe(true);
        });

        it('closes when something outside the panel scrolls', async () => {
            vi.useFakeTimers();

            openOuterCenter();
            await vi.runOnlyPendingTimersAsync();

            dispatchFakeEvent(outerFixture.componentInstance.outer().nativeElement, 'scroll');
            await vi.advanceTimersByTimeAsync(SCROLLED_TO_BOTTOM_AUDIT_TIME);
            await vi.runOnlyPendingTimersAsync();

            expect(outerFixture.componentInstance.trigger().isOpen).toBe(false);
        });

        it('never writes its own flags onto the shared scrollable', async () => {
            vi.useFakeTimers();

            openOuterCenter();
            await vi.runOnlyPendingTimersAsync();

            const scrollable = getOuterScrollable() as unknown as Record<string, unknown>;

            dispatchFakeEvent(outerFixture.componentInstance.outer().nativeElement, 'scroll');
            await vi.advanceTimersByTimeAsync(SCROLLED_TO_BOTTOM_AUDIT_TIME);
            await vi.runOnlyPendingTimersAsync();

            // The panel used to tag the emitted CdkScrollable so the base trigger would skip the close.
            // The tag was never cleared and disabled close-on-scroll for every other pop-up as well.
            expect(scrollable.kbqPopoverPreventHide).toBeUndefined();
            expect(scrollable.type).toBeUndefined();
        });

        it('does not throw when a scroll arrives after the panel was destroyed while open', async () => {
            vi.useFakeTimers();

            openOuterCenter();
            await vi.runOnlyPendingTimersAsync();

            const scrollDispatcher = TestBed.inject(ScrollDispatcher);
            // Destroying the fixture also unregisters its own CdkScrollable, so a scroll dispatched on
            // that element would reach nobody. Keeping a subscriber holds the dispatcher's document
            // listener open, and scrolling the document itself really does reach every subscription the
            // destroyed trigger left behind.
            const keepDispatcherArmed = scrollDispatcher.scrolled(0).subscribe();

            outerFixture.destroy();

            await expect(
                (async () => {
                    dispatchFakeEvent(document, 'scroll');
                    await vi.advanceTimersByTimeAsync(SCROLLED_TO_BOTTOM_AUDIT_TIME);
                    await vi.runOnlyPendingTimersAsync();
                })()
            ).resolves.not.toThrow();

            keepDispatcherArmed.unsubscribe();
        });
    });

    describe('onDelete', () => {
        beforeEach(() => setUpDefaultFixture());

        it('emits an "item" event with the removed item on remove()', () => {
            const service = getService();
            const item = createItem('a');

            service.items = [item];

            const emitSpy = vi.spyOn(service.onDelete, 'next');

            service.remove(item);

            expect(emitSpy).toHaveBeenCalledWith({ type: 'item', items: [item] });
            expect(service.isEmpty).toBe(true);
        });

        it('stays silent when the removed item is not in the list', () => {
            const service = getService();

            service.items = [createItem('a')];

            const emitSpy = vi.spyOn(service.onDelete, 'next');

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

            const emitSpy = vi.spyOn(service.onDelete, 'next');

            service.removeGroup({ id: 'group', title: 'group', items: [item] });

            expect(emitSpy).toHaveBeenCalledWith({ type: 'group', items: [item] });
            expect(service.isEmpty).toBe(true);
        });

        it('stays silent when the removed group holds nothing that is in the list', () => {
            const service = getService();

            service.items = [createItem('a')];

            const emitSpy = vi.spyOn(service.onDelete, 'next');

            // A group reference kept from an earlier groupedItems emission, after the list was
            // replaced: nothing is removed locally, so nothing may be replayed against a backend.
            service.removeGroup({ id: 'stale', title: 'stale', items: [createItem('b')] });

            expect(emitSpy).not.toHaveBeenCalled();
            expect(service.items).toHaveLength(1);
        });

        it('reports only the group items that were still in the list', () => {
            const service = getService();
            const present = createItem('a');

            service.items = [present];

            const emitSpy = vi.spyOn(service.onDelete, 'next');

            service.removeGroup({ id: 'group', title: 'group', items: [present, createItem('gone')] });

            expect(emitSpy).toHaveBeenCalledWith({ type: 'group', items: [present] });
        });

        it('emits an "all" event with a snapshot of all items on removeAll()', () => {
            const service = getService();
            const items = [createItem('a'), createItem('b')];

            service.items = items;

            const emitSpy = vi.spyOn(service.onDelete, 'next');

            service.removeAll();

            expect(emitSpy).toHaveBeenCalledWith({ type: 'all', items });
            expect(service.isEmpty).toBe(true);
        });

        it('stays silent when removeAll() runs on an already empty list', () => {
            const service = getService();
            const emitSpy = vi.spyOn(service.onDelete, 'next');

            service.removeAll();

            expect(emitSpy).not.toHaveBeenCalled();
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
            const showSpy = vi.spyOn(toastService, 'show').mockReturnValue({ id: 1, ref: createToastRef() });
            const item = createItem('a');

            service.push(item);
            service.push(item);

            expect(service.items).toHaveLength(1);
            expect(showSpy).toHaveBeenCalledTimes(1);
        });

        it('adds a pushed notification whose id is already taken, under a generated one', () => {
            const service = getService();
            const toastService = TestBed.inject(KbqToastService);
            const showSpy = vi.spyOn(toastService, 'show').mockReturnValue({ id: 1, ref: createToastRef() });
            const date = new Date().toISOString();

            service.items = [{ id: 'n1', title: 'a', date }];

            // A backend repeating an id across pages used to have its notification dropped in silence:
            // no toast, nothing added, and no way for the caller to tell.
            service.push({ id: 'n1', title: 'b', date });

            expect(service.items).toHaveLength(2);
            expect(showSpy).toHaveBeenCalledTimes(1);
            expect(new Set(service.items.map((item) => item.id)).size).toBe(2);
        });

        it('re-keys ids that collide inside one assignment', () => {
            const service = getService();
            const date = new Date().toISOString();

            service.items = [
                { id: 'n1', title: 'a', date },
                { id: 'n1', title: 'b', date }
            ];

            expect(new Set(service.items.map((item) => item.id)).size).toBe(2);
        });

        it('keeps the ids of the notifications it is handed back', () => {
            const service = getService();

            service.items = [createItem('a'), createItem('b')];

            const ids = service.items.map((item) => item.id);

            // Re-assigning the same notifications must not re-key them: the ids are the list's track
            // keys, and re-keying would throw every rendered row away.
            service.items = [...service.items];

            expect(service.items.map((item) => item.id)).toEqual(ids);
        });

        it('marks an item read when its toast is read', () => {
            const service = getService();
            const toastService = TestBed.inject(KbqToastService);
            const item = createItem('a');

            service.items = [item];

            const onReadSpy = vi.spyOn(service.onRead, 'next');

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
            const showSpy = vi.spyOn(toastService, 'show').mockReturnValue({ id: 1, ref: createToastRef() });

            service.setSilentMode(true);
            service.push(createItem('a'));

            expect(showSpy).not.toHaveBeenCalled();
            expect(service.items).toHaveLength(1);
        });

        it('is switched from the panel dropdown options', async () => {
            vi.useFakeTimers();

            const service = getService();

            openCenter();
            await vi.runOnlyPendingTimersAsync();

            queryPanel('[data-testid="kbq-notification-center-silent-mode-toggle"]')!.click();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            queryPanel('[data-testid="kbq-notification-center-do-not-disturb-button"]')!.click();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(service.silentMode.value).toBe(true);
        });
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

            vi.spyOn(toastService, 'show').mockReturnValue({ id: 42, ref: createToastRef() });

            const item = createItem('a');

            service.push(item);

            expect(item.toastId).toBe(42);
        });

        it('hides the toast by the stored toastId and clears it', () => {
            const service = getService();
            const toastService = TestBed.inject(KbqToastService);
            const hideSpy = vi.spyOn(toastService, 'hide').mockImplementation(() => {});

            const item: KbqNotificationItem = { ...createItem('a'), toastId: 42 };

            service.hideToast(item);

            expect(hideSpy).toHaveBeenCalledWith(42);
            expect(item.toastId).toBeUndefined();
        });

        it('does nothing when the item has no toastId', () => {
            const service = getService();
            const toastService = TestBed.inject(KbqToastService);
            const hideSpy = vi.spyOn(toastService, 'hide').mockImplementation(() => {});

            service.hideToast(createItem('a'));

            expect(hideSpy).not.toHaveBeenCalled();
        });

        it('remove() hides the toast of the removed item', () => {
            const service = getService();
            const toastService = TestBed.inject(KbqToastService);

            vi.spyOn(toastService, 'show').mockReturnValue({ id: 7, ref: createToastRef() });
            const hideSpy = vi.spyOn(toastService, 'hide').mockImplementation(() => {});

            const item = createItem('a');

            service.push(item);
            service.remove(item);

            expect(hideSpy).toHaveBeenCalledWith(7);
        });

        it('removeAll() hides the toasts of all items shown via push()', () => {
            const service = getService();
            const toastService = TestBed.inject(KbqToastService);

            vi.spyOn(toastService, 'show')
                .mockReturnValueOnce({ id: 1, ref: createToastRef() })
                .mockReturnValueOnce({ id: 2, ref: createToastRef() });
            const hideSpy = vi.spyOn(toastService, 'hide').mockImplementation(() => {});

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
        it('emits onRead only once per item across repeated read events', async () => {
            vi.useFakeTimers();

            const service = getService();
            const item = createItem('a');

            service.items = [item];

            openCenter();
            await vi.runOnlyPendingTimersAsync();
            fixture.detectChanges();

            const itemElement = queryPanel('kbq-notification-item');

            expect(itemElement).not.toBeNull();

            const onReadSpy = vi.spyOn(service.onRead, 'next');

            itemElement!.click();
            itemElement!.click();
            itemElement!.click();

            expect(onReadSpy).toHaveBeenCalledTimes(1);
            expect(onReadSpy).toHaveBeenCalledWith(item);
            expect(item.read).toBe(true);
        });
    });

    describe('templates', () => {
        let templateFixture: ComponentFixture<NotificationCenterWithTemplates>;

        beforeEach(() => {
            templateFixture = createComponent(NotificationCenterWithTemplates);
            overlayContainer = TestBed.inject(OverlayContainer);
        });

        it('renders the consumer templates with the item as the context', async () => {
            vi.useFakeTimers();

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
            await vi.runOnlyPendingTimersAsync();
            templateFixture.detectChanges();

            const panel = overlayContainer.getContainerElement();

            // The context exposes the notification, not the item component that renders it.
            expect(panel.querySelector('[data-testid="template-title"]')!.textContent).toContain('templated');
            expect(panel.querySelector('[data-testid="template-caption"]')!.textContent).toContain('templated');
        });
    });

    describe('configuration override', () => {
        it('renders the strings registered through kbqNotificationCenterLocaleConfigurationProvider', async () => {
            vi.useFakeTimers();

            setUpDefaultFixture([
                kbqNotificationCenterLocaleConfigurationProvider({
                    notifications: 'Custom notifications',
                    noNotifications: 'Custom empty'
                })
            ]);

            openCenter();
            await vi.runOnlyPendingTimersAsync();
            fixture.detectChanges();

            expect(queryPanel('.kbq-notification-center-title__text')!.textContent).toContain('Custom notifications');
            expect(queryPanel('[data-testid="kbq-notification-center-empty"]')!.textContent).toContain('Custom empty');
        });

        it('leaves the sections it does not name following the locale', async () => {
            vi.useFakeTimers();

            setUpDefaultFixture([kbqNotificationCenterLocaleConfigurationProvider({ notifications: 'Custom' })]);

            openCenter();
            await vi.runOnlyPendingTimersAsync();
            fixture.detectChanges();

            expect(queryPanel('[data-testid="kbq-notification-center-empty"]')!.textContent).toContain(
                ruRULocaleData.notificationCenter.noNotifications
            );
        });
    });

    describe('loading and empty states', () => {
        beforeEach(() => setUpDefaultFixture());

        it('replaces the list with the full-screen loader in loading mode', async () => {
            vi.useFakeTimers();

            const service = getService();

            service.items = [createItem('a')];

            openCenter();
            await vi.runOnlyPendingTimersAsync();

            service.setLoadingMode(true);
            fixture.detectChanges();

            expect(queryPanel('[data-testid="kbq-notification-center-loader"]')).not.toBeNull();
            expect(queryPanel('kbq-notification-item')).toBeNull();
        });

        it('hides the remove-all button while the list is empty', async () => {
            vi.useFakeTimers();

            const service = getService();

            openCenter();
            await vi.runOnlyPendingTimersAsync();

            expect(queryPanel('[data-testid="kbq-notification-center-remove-all-button"]')).toBeNull();

            service.items = [createItem('a')];
            fixture.detectChanges();

            expect(queryPanel('[data-testid="kbq-notification-center-remove-all-button"]')).not.toBeNull();
        });
    });

    describe('standalone usage', () => {
        it('opens without KbqNotificationCenterModule', async () => {
            vi.useFakeTimers();

            const standaloneFixture = createComponent(StandaloneNotificationCenter);

            overlayContainer = TestBed.inject(OverlayContainer);

            await expect(
                (async () => {
                    standaloneFixture.componentInstance.trigger().show();
                    standaloneFixture.detectChanges();
                    await vi.runOnlyPendingTimersAsync();
                })()
            ).resolves.not.toThrow();

            expect(overlayContainer.getContainerElement().querySelector('.kbq-notification-center')).not.toBeNull();
        });
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

        it('should re-apply stick position on window resize', async () => {
            vi.useFakeTimers();

            const stickFixture = createStickComponent(NotificationCenterWithStick);

            stickFixture.componentInstance.trigger().show();
            stickFixture.detectChanges();
            await vi.advanceTimersByTimeAsync(0);

            const pane = getOverlayPane();

            expect(pane.style.right).toMatch(/^0(px)?$/);
            expect(pane.style.left).toBe('unset');

            // simulate the position strategy wiping the manual stick styles on resize
            pane.style.right = '';
            pane.style.left = '50px';

            dispatchFakeEvent(window, 'resize');
            await vi.advanceTimersByTimeAsync(20);

            expect(pane.style.right).toMatch(/^0(px)?$/);
            expect(pane.style.left).toBe('unset');
        });

        it('should re-apply stick position when the panel list is scrolled', async () => {
            vi.useFakeTimers();

            const stickFixture = createStickComponent(NotificationCenterWithStick);

            stickFixture.componentInstance.trigger().show();
            stickFixture.detectChanges();
            await vi.advanceTimersByTimeAsync(0);

            const pane = getOverlayPane();
            const list = overlayContainer
                .getContainerElement()
                .querySelector<HTMLElement>('[data-testid="kbq-notification-center-container"]')!;

            // The list is a registered CdkScrollable, so scrolling it reaches the reposition scroll
            // strategy through the root ScrollDispatcher, which wipes the manual stick styles.
            pane.style.right = '';
            pane.style.left = '50px';

            dispatchFakeEvent(list, 'scroll');
            await vi.advanceTimersByTimeAsync(20);

            expect(pane.style.right).toMatch(/^0(px)?$/);
            expect(pane.style.left).toBe('unset');
        });

        it('should recalculate stick position against the container on window resize', async () => {
            vi.useFakeTimers();

            const stickFixture = createStickComponent(NotificationCenterWithStickContainer);

            stickFixture.componentInstance.trigger().show();
            stickFixture.detectChanges();
            await vi.advanceTimersByTimeAsync(0);

            const pane = getOverlayPane();
            const panel = overlayContainer.getContainerElement().querySelector('.kbq-notification-center')!;

            vi.spyOn(panel, 'getBoundingClientRect').mockReturnValue({ width: 400, height: 300 } as DOMRect);
            vi.spyOn(stickFixture.componentInstance.container().nativeElement, 'getBoundingClientRect').mockReturnValue(
                {
                    left: 0,
                    right: 800,
                    top: 0,
                    bottom: 500
                } as DOMRect
            );

            dispatchFakeEvent(window, 'resize');
            await vi.advanceTimersByTimeAsync(20);

            expect(pane.style.left).toBe('400px');
            expect(pane.style.right).toBe('unset');
        });

        it('should stop re-applying stick position after the panel is closed', async () => {
            vi.useFakeTimers();

            const stickFixture = createStickComponent(NotificationCenterWithStick);
            const trigger = stickFixture.componentInstance.trigger();

            trigger.show();
            stickFixture.detectChanges();
            await vi.advanceTimersByTimeAsync(0);

            const pane = getOverlayPane();

            trigger.hide();
            stickFixture.detectChanges();
            await vi.advanceTimersByTimeAsync(0);

            pane.style.right = '';
            pane.style.left = '50px';

            dispatchFakeEvent(window, 'resize');
            await vi.advanceTimersByTimeAsync(20);

            expect(pane.style.right).toBe('');
            expect(pane.style.left).toBe('50px');
        });
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

        describe('day headings', () => {
            // Every heading is produced by DateFormatter, which re-localizes at runtime.
            const cyrillic = /[а-яё]/i;

            const readTitles = (service: KbqNotificationCenterService): string[] => {
                let titles: string[] = [];

                service.groupedItems.subscribe((groups) => (titles = groups.map((group) => group.title))).unsubscribe();

                return titles;
            };

            it('renders every heading in the active locale, groups built before the change included', () => {
                const service = TestBed.inject(KbqNotificationCenterService);

                service.setSilentMode(true);
                service.items = [createItem('a', '2026-07-04T12:00:00.000Z')];

                const russianTitle = readTitles(service)[0];

                expect(russianTitle).toMatch(cyrillic);

                localeService.setLocale('en-US');

                // The heading used to be cached with the item and invalidated only by a changed raw
                // `date`, so this group stayed Russian while the new day rendered in English — one
                // list, two languages.
                service.push(createItem('b', '2026-07-05T12:00:00.000Z'));

                const titles = readTitles(service);

                expect(titles).toHaveLength(2);
                expect(titles).not.toContain(russianTitle);
                expect(titles.some((title) => cyrillic.test(title))).toBe(false);
            });

            it('re-emits the grouped items when the locale changes', () => {
                const service = TestBed.inject(KbqNotificationCenterService);
                const emissions: string[][] = [];

                service.items = [createItem('a', '2026-07-04T12:00:00.000Z')];

                const subscription = service.groupedItems.subscribe((groups) =>
                    emissions.push(groups.map((group) => group.title))
                );

                localeService.setLocale('en-US');
                subscription.unsubscribe();

                // A rendered panel holds one `| async` subscription: without a re-emission the
                // headings would only catch up on the next change to the list.
                expect(emissions).toHaveLength(2);
                expect(emissions[1]).not.toEqual(emissions[0]);
            });
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

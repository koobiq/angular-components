import { ComponentFixture } from '@angular/core/testing';
import {
    DOWN_ARROW,
    ENTER,
    ESCAPE,
    LEFT_ARROW,
    RIGHT_ARROW,
    ruRULocaleData,
    SLASH,
    SPACE,
    TAB,
    UP_ARROW
} from '@koobiq/components/core';
import { CheckConfig } from '../config';
import { renderScenario } from '../testing';
import { NavbarScenario } from './navbar';

type Fixture = ComponentFixture<NavbarScenario>;

/** The default `kbqEnterDelay` of a tooltip. */
const TOOLTIP_ENTER_DELAY = 400;

const HORIZONTAL_LABELS = ['Koobiq', 'Dashboards', 'Tasks', 'Reports', 'Account'];

const horizontalNavbar = (fixture: Fixture): HTMLElement => fixture.nativeElement.querySelector('kbq-navbar');
const verticalNavbar = (fixture: Fixture): HTMLElement => fixture.nativeElement.querySelector('kbq-vertical-navbar');
const toggle = (fixture: Fixture): HTMLElement => verticalNavbar(fixture).querySelector('[kbq-navbar-toggle]')!;
const item = (navbar: HTMLElement, section: string): HTMLElement =>
    navbar.querySelector(`[data-section="${section}"]`)!;
const outsideButton = (fixture: Fixture): HTMLButtonElement =>
    fixture.nativeElement.querySelector('.check-navbar-outside');

const dropdownPanel = (): HTMLElement | null => document.querySelector('.kbq-dropdown__panel');
const dropdownItems = (): HTMLElement[] =>
    Array.from(document.querySelectorAll('.kbq-dropdown__panel [kbq-dropdown-item]'));
const visibleTooltips = (): HTMLElement[] => Array.from(document.querySelectorAll('.kbq-tooltip.kbq-tooltip_visible'));

/** The title of the focused navbar element, which names it for the user. */
const focusedLabel = (): string | undefined =>
    document.activeElement?.querySelector('kbq-navbar-title')?.textContent?.trim();

const KEYS: Record<number, string> = {
    [TAB]: 'Tab',
    [ENTER]: 'Enter',
    [ESCAPE]: 'Escape',
    [SPACE]: ' ',
    [LEFT_ARROW]: 'ArrowLeft',
    [UP_ARROW]: 'ArrowUp',
    [RIGHT_ARROW]: 'ArrowRight',
    [DOWN_ARROW]: 'ArrowDown',
    [SLASH]: '/'
};

/** Dispatches a `keydown` the way the browser does; the components read the legacy `keyCode`. */
function keydown(target: EventTarget, keyCode: number, init: KeyboardEventInit = {}): KeyboardEvent {
    const event = new KeyboardEvent('keydown', {
        key: KEYS[keyCode],
        keyCode,
        bubbles: true,
        cancelable: true,
        ...init
    });

    // `keyCode` is a legacy member that not every DOM implementation takes from the init dictionary.
    if (event.keyCode !== keyCode) Object.defineProperty(event, 'keyCode', { get: () => keyCode });

    target.dispatchEvent(event);

    return event;
}

/** A Tab that lands on the element: the keydown reaches the page first, then the browser moves the focus. */
function tabInto(element: HTMLElement): void {
    keydown(document.body, TAB);
    element.focus();
}

async function press(
    fixture: Fixture,
    keyCode: number,
    target: Element = document.activeElement!
): Promise<KeyboardEvent> {
    const event = keydown(target, keyCode);

    await fixture.whenStable();

    return event;
}

/** Presses the key until the element has the focus, and fails instead of looping when it never gets there. */
async function pressUntilFocused(fixture: Fixture, keyCode: number, target: HTMLElement): Promise<void> {
    for (let i = 0; i < 10 && document.activeElement !== target; i++) await press(fixture, keyCode);

    expect(document.activeElement).toBe(target);
}

/**
 * A primary-button click, which focuses what it lands on. CDK reads a `mousedown` with `buttons` or `detail` of 0
 * as a screen reader's fake press.
 */
async function clickWithMouse(fixture: Fixture, element: HTMLElement): Promise<void> {
    element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, buttons: 1, detail: 1 }));
    element.focus();
    element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, detail: 1 }));
    element.click();

    await fixture.whenStable();
}

/** Runs the timers the tooltips wait on, then renders: with every timer faked `whenStable()` would never settle. */
async function elapse(fixture: Fixture, ms: number): Promise<void> {
    await vi.advanceTimersByTimeAsync(ms);
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(0);
}

export function defineNavbarSuite(config: CheckConfig): void {
    describe(`navbar (${config.name})`, () => {
        afterEach(() => vi.useRealTimers());

        describe('horizontal navbar', () => {
            it('is a named landmark with one tab stop that hands keyboard focus to its first item', async () => {
                const fixture = await renderScenario(NavbarScenario, config);
                const navbar = horizontalNavbar(fixture);
                const items = Array.from(navbar.querySelectorAll('.kbq-navbar-focusable-item'));

                expect(navbar.getAttribute('role')).toBe('navigation');
                expect(navbar.getAttribute('aria-label')).toBe('Main');
                expect(navbar.getAttribute('tabindex')).toBe('0');
                expect(items.length).toBe(HORIZONTAL_LABELS.length);
                expect(items.every((element) => element.getAttribute('tabindex') === '-1')).toBe(true);

                tabInto(navbar);
                await fixture.whenStable();

                expect(document.activeElement).toBe(navbar.querySelector('[kbq-navbar-brand]'));
                expect(focusedLabel()).toBe('Koobiq');
            });

            it('moves focus across the items with the arrow keys and stops at both ends', async () => {
                const fixture = await renderScenario(NavbarScenario, config);

                tabInto(horizontalNavbar(fixture));
                await fixture.whenStable();

                const visited = [focusedLabel()];

                for (let i = 0; i < HORIZONTAL_LABELS.length; i++) {
                    const event = await press(fixture, RIGHT_ARROW);

                    expect(event.defaultPrevented).toBe(true);
                    visited.push(focusedLabel());
                }

                expect(visited).toEqual([...HORIZONTAL_LABELS, 'Account']);

                for (let i = 0; i < HORIZONTAL_LABELS.length; i++) {
                    await press(fixture, LEFT_ARROW);
                }

                expect(focusedLabel()).toBe('Koobiq');
            });

            it('gives its tab stop up for a Tab out of an item and takes it back afterwards', async () => {
                const fixture = await renderScenario(NavbarScenario, config);
                const navbar = horizontalNavbar(fixture);

                tabInto(navbar);
                await fixture.whenStable();
                await press(fixture, RIGHT_ARROW);
                keydown(document.activeElement!, TAB);

                // Read before anything else runs: the browser moves the focus right after the keydown, and the host
                // has to be out of the tab order by then, or a Shift+Tab would stop on it instead of leaving.
                expect(navbar.getAttribute('tabindex')).toBe('-1');

                await new Promise((resolve) => setTimeout(resolve));
                await fixture.whenStable();

                expect(navbar.getAttribute('tabindex')).toBe('0');
            });

            it('activates an item with Enter, Space and a click', async () => {
                const fixture = await renderScenario(NavbarScenario, config);
                const navbar = horizontalNavbar(fixture);

                expect(item(navbar, 'dashboards').getAttribute('role')).toBe('button');

                tabInto(navbar);
                await fixture.whenStable();
                await press(fixture, RIGHT_ARROW);

                const enter = await press(fixture, ENTER);

                expect(enter.defaultPrevented).toBe(true);
                expect(fixture.componentInstance.activeSection()).toBe('dashboards');
                expect(item(navbar, 'dashboards').classList).toContain('kbq-active');

                await press(fixture, RIGHT_ARROW);
                await press(fixture, SPACE);

                expect(fixture.componentInstance.activeSection()).toBe('tasks');
                expect(item(navbar, 'dashboards').classList).not.toContain('kbq-active');

                await clickWithMouse(fixture, item(navbar, 'reports'));

                expect(fixture.componentInstance.activeSection()).toBe('reports');
                expect(item(navbar, 'reports').classList).toContain('kbq-active');
            });

            it('moves focus with the arrow keys from an item the user clicked', async () => {
                const fixture = await renderScenario(NavbarScenario, config);
                const navbar = horizontalNavbar(fixture);

                await clickWithMouse(fixture, item(navbar, 'tasks'));

                expect(document.activeElement).toBe(item(navbar, 'tasks'));
                expect(item(navbar, 'tasks').classList).toContain('cdk-mouse-focused');

                await press(fixture, RIGHT_ARROW);

                expect(document.activeElement).toBe(item(navbar, 'reports'));
                expect(item(navbar, 'reports').classList).toContain('cdk-keyboard-focused');
            });

            it('lists its items in focusableItems', async () => {
                const fixture = await renderScenario(NavbarScenario, config);
                const { focusableItems } = fixture.componentInstance.navbar();

                expect(focusableItems.map((focusable) => focusable.getLabel())).toEqual(HORIZONTAL_LABELS);
            });
        });

        describe('item dropdown', () => {
            it('opens on click and closes on an outside click without taking the focus back', async () => {
                const fixture = await renderScenario(NavbarScenario, config);
                const trigger = item(horizontalNavbar(fixture), 'account');

                expect(trigger.getAttribute('aria-expanded')).toBe('false');
                expect(dropdownPanel()).toBeNull();

                await clickWithMouse(fixture, trigger);

                expect(dropdownPanel()).not.toBeNull();
                expect(dropdownItems().map((element) => element.textContent?.trim())).toEqual(['Profile', 'Sign out']);
                expect(trigger.getAttribute('aria-expanded')).toBe('true');
                expect(trigger.classList).toContain('kbq-active');
                // Opened by the mouse, the panel takes the focus without highlighting an item.
                expect(document.activeElement).toBe(dropdownPanel());
                expect(fixture.componentInstance.accountMenuEvents).toEqual(['opened']);

                await clickWithMouse(fixture, outsideButton(fixture));

                expect(dropdownPanel()).toBeNull();
                expect(trigger.getAttribute('aria-expanded')).toBe('false');
                expect(trigger.classList).not.toContain('kbq-active');
                expect(document.activeElement).toBe(outsideButton(fixture));
                expect(fixture.componentInstance.accountMenuEvents).toEqual(['opened', 'closed']);
            });

            it('opens with Down Arrow, walks its items and gives the focus back on Escape', async () => {
                const fixture = await renderScenario(NavbarScenario, config);
                const navbar = horizontalNavbar(fixture);
                const trigger = item(navbar, 'account');

                tabInto(navbar);
                await fixture.whenStable();

                await pressUntilFocused(fixture, RIGHT_ARROW, trigger);

                const down = await press(fixture, DOWN_ARROW);
                const [profile, signOut] = dropdownItems();

                expect(down.defaultPrevented).toBe(true);
                expect(dropdownPanel()).not.toBeNull();
                expect(trigger.getAttribute('aria-expanded')).toBe('true');
                expect(document.activeElement).toBe(profile);

                await press(fixture, DOWN_ARROW);

                expect(document.activeElement).toBe(signOut);

                await press(fixture, ESCAPE);

                expect(dropdownPanel()).toBeNull();
                expect(trigger.getAttribute('aria-expanded')).toBe('false');
                expect(document.activeElement).toBe(trigger);
                expect(fixture.componentInstance.accountMenuEvents).toEqual(['opened', 'closed']);
                expect(fixture.componentInstance.accountMenuCloseReasons).toEqual(['keydown']);

                // The roving focus goes on from the trigger.
                await press(fixture, LEFT_ARROW);

                expect(focusedLabel()).toBe('Reports');
            });

            it('opens with Enter and gives the focus back once an item is chosen', async () => {
                const fixture = await renderScenario(NavbarScenario, config);
                const navbar = horizontalNavbar(fixture);
                const trigger = item(navbar, 'account');

                tabInto(navbar);
                await fixture.whenStable();

                await pressUntilFocused(fixture, RIGHT_ARROW, trigger);

                await press(fixture, ENTER);

                expect(dropdownPanel()).not.toBeNull();
                expect(document.activeElement).toBe(dropdownItems()[0]);

                // Enter on a focused button clicks it; jsdom leaves that to the browser.
                dropdownItems()[0].click();
                await fixture.whenStable();

                expect(fixture.componentInstance.accountAction()).toBe('profile');
                expect(dropdownPanel()).toBeNull();
                expect(document.activeElement).toBe(trigger);
                expect(fixture.componentInstance.accountMenuEvents).toEqual(['opened', 'closed']);
            });
        });

        describe('vertical navbar', () => {
            it('starts collapsed, with icon-only items named by their titles', async () => {
                const fixture = await renderScenario(NavbarScenario, config);
                const navbar = verticalNavbar(fixture);

                expect(navbar.getAttribute('role')).toBe('navigation');
                expect(navbar.getAttribute('aria-label')).toBe('Sections');
                expect(navbar.querySelector('.kbq-vertical-navbar__container')?.classList).toContain('kbq-collapsed');

                for (const { id, title } of fixture.componentInstance.sections()) {
                    const element = item(navbar, id);

                    expect(element.classList).toContain('kbq-collapsed');
                    expect(element.classList).toContain('kbq-navbar-item_collapsed');
                    expect(element.getAttribute('aria-label')).toBe(title);
                }

                expect(toggle(fixture).getAttribute('aria-expanded')).toBe('false');
                expect(toggle(fixture).getAttribute('aria-label')).toBe(ruRULocaleData.navbar.toggle.expand);
            });

            it('expands and collapses from its toggle, the keyboard, Ctrl+/ and the bound signal', async () => {
                const fixture = await renderScenario(NavbarScenario, config);
                const navbar = verticalNavbar(fixture);
                const dashboards = item(navbar, 'dashboards');

                const expectExpanded = (expanded: boolean) => {
                    expect(fixture.componentInstance.sidebarExpanded()).toBe(expanded);
                    expect(navbar.querySelector('.kbq-vertical-navbar__container')?.classList).toContain(
                        expanded ? 'kbq-expanded' : 'kbq-collapsed'
                    );
                    expect(dashboards.classList).toContain(expanded ? 'kbq-expanded' : 'kbq-collapsed');
                    expect(dashboards.classList.contains('kbq-navbar-item_collapsed')).toBe(!expanded);
                    expect(dashboards.getAttribute('aria-label')).toBe(expanded ? null : 'Dashboards');
                    expect(toggle(fixture).getAttribute('aria-expanded')).toBe(`${expanded}`);
                    expect(toggle(fixture).getAttribute('aria-label')).toBe(
                        expanded ? ruRULocaleData.navbar.toggle.collapse : ruRULocaleData.navbar.toggle.expand
                    );
                };

                toggle(fixture).click();
                await fixture.whenStable();
                expectExpanded(true);

                await press(fixture, ENTER, toggle(fixture));
                expectExpanded(false);

                await press(fixture, SPACE, toggle(fixture));
                expectExpanded(true);

                keydown(document.body, SLASH, { ctrlKey: true });
                await fixture.whenStable();
                expectExpanded(false);

                fixture.componentInstance.sidebarExpanded.set(true);
                await fixture.whenStable();
                expectExpanded(true);
            });

            it('moves focus with Up and Down Arrow', async () => {
                const fixture = await renderScenario(NavbarScenario, config);
                const navbar = verticalNavbar(fixture);

                fixture.componentInstance.sidebarExpanded.set(true);
                await fixture.whenStable();

                tabInto(navbar);
                await fixture.whenStable();

                expect(document.activeElement).toBe(item(navbar, 'dashboards'));

                const down = await press(fixture, DOWN_ARROW);

                expect(down.defaultPrevented).toBe(true);
                expect(document.activeElement).toBe(item(navbar, 'tasks'));

                await press(fixture, DOWN_ARROW);
                await press(fixture, DOWN_ARROW);

                expect(document.activeElement).toBe(item(navbar, 'reports'));

                await press(fixture, UP_ARROW);

                expect(document.activeElement).toBe(item(navbar, 'tasks'));
            });

            it('moves focus with the arrow keys from an item the user clicked', async () => {
                const fixture = await renderScenario(NavbarScenario, config);
                const navbar = verticalNavbar(fixture);

                await clickWithMouse(fixture, item(navbar, 'dashboards'));

                expect(document.activeElement).toBe(item(navbar, 'dashboards'));
                expect(item(navbar, 'dashboards').classList).toContain('cdk-mouse-focused');

                await press(fixture, DOWN_ARROW);

                expect(document.activeElement).toBe(item(navbar, 'tasks'));
                expect(item(navbar, 'tasks').classList).toContain('cdk-keyboard-focused');
            });

            it('shows the title of a collapsed item as a tooltip on keyboard focus and on hover', async () => {
                const fixture = await renderScenario(NavbarScenario, config);
                const navbar = verticalNavbar(fixture);

                vi.useFakeTimers();

                tabInto(navbar);
                await elapse(fixture, 0);

                expect(document.activeElement).toBe(item(navbar, 'dashboards'));

                await elapse(fixture, TOOLTIP_ENTER_DELAY);

                let tooltips = visibleTooltips();

                expect(tooltips.map((tooltip) => tooltip.textContent?.trim())).toEqual(['Dashboards']);
                expect(tooltips[0].getAttribute('role')).toBe('tooltip');
                // The item is named by its title already, so the tooltip does not describe it a second time.
                expect(item(navbar, 'dashboards').getAttribute('aria-label')).toBe('Dashboards');
                expect(item(navbar, 'dashboards').hasAttribute('aria-describedby')).toBe(false);

                keydown(document.activeElement!, DOWN_ARROW);
                await elapse(fixture, TOOLTIP_ENTER_DELAY);

                tooltips = visibleTooltips();

                expect(document.activeElement).toBe(item(navbar, 'tasks'));
                expect(tooltips.map((tooltip) => tooltip.textContent?.trim())).toEqual(['Tasks']);

                // Leaving the navbar hides the tooltip and detaches it.
                outsideButton(fixture).focus();
                await elapse(fixture, TOOLTIP_ENTER_DELAY);

                expect(document.querySelector('.kbq-tooltip')).toBeNull();

                item(navbar, 'reports').dispatchEvent(new MouseEvent('mouseenter'));
                await elapse(fixture, TOOLTIP_ENTER_DELAY);

                expect(visibleTooltips().map((tooltip) => tooltip.textContent?.trim())).toEqual(['Reports']);

                item(navbar, 'reports').dispatchEvent(new MouseEvent('mouseleave'));
                await elapse(fixture, TOOLTIP_ENTER_DELAY);

                expect(document.querySelector('.kbq-tooltip')).toBeNull();
            });

            it('shows no tooltip for an item of the expanded navbar', async () => {
                const fixture = await renderScenario(NavbarScenario, config);
                const navbar = verticalNavbar(fixture);

                toggle(fixture).click();
                await fixture.whenStable();

                vi.useFakeTimers();

                tabInto(navbar);
                await elapse(fixture, TOOLTIP_ENTER_DELAY);

                expect(document.activeElement).toBe(item(navbar, 'dashboards'));
                expect(document.querySelector('.kbq-tooltip')).toBeNull();

                item(navbar, 'tasks').dispatchEvent(new MouseEvent('mouseenter'));
                await elapse(fixture, TOOLTIP_ENTER_DELAY);

                expect(document.querySelector('.kbq-tooltip')).toBeNull();

                // Collapsed again, the same hover names the item.
                toggle(fixture).click();
                await elapse(fixture, 0);
                item(navbar, 'tasks').dispatchEvent(new MouseEvent('mouseleave'));
                item(navbar, 'tasks').dispatchEvent(new MouseEvent('mouseenter'));
                await elapse(fixture, TOOLTIP_ENTER_DELAY);

                expect(visibleTooltips().map((tooltip) => tooltip.textContent?.trim())).toEqual(['Tasks']);
            });
        });

        describe('items from a signal', () => {
            it('reaches an added item with the arrow keys in both navbars', async () => {
                const fixture = await renderScenario(NavbarScenario, config);
                const scenario = fixture.componentInstance;
                const { focusableItems } = scenario.navbar();
                const changes = vi.fn();
                const subscription = focusableItems.changes.subscribe(changes);

                scenario.addSection({ id: 'alerts', title: 'Alerts', icon: 'kbq-bell_16' });
                scenario.sidebarExpanded.set(true);
                await fixture.whenStable();
                subscription.unsubscribe();

                expect(changes).toHaveBeenCalled();
                expect(focusableItems.map((focusable) => focusable.getLabel())).toEqual([
                    'Koobiq',
                    'Dashboards',
                    'Tasks',
                    'Reports',
                    'Alerts',
                    'Account'
                ]);

                const horizontal = horizontalNavbar(fixture);

                tabInto(horizontal);
                await fixture.whenStable();

                await pressUntilFocused(fixture, RIGHT_ARROW, item(horizontal, 'reports'));

                await press(fixture, RIGHT_ARROW);

                expect(document.activeElement).toBe(item(horizontal, 'alerts'));

                await press(fixture, RIGHT_ARROW);

                expect(document.activeElement).toBe(item(horizontal, 'account'));

                const vertical = verticalNavbar(fixture);

                tabInto(vertical);
                await fixture.whenStable();

                for (let i = 0; i < 3; i++) await press(fixture, DOWN_ARROW);

                expect(document.activeElement).toBe(item(vertical, 'alerts'));
            });

            it('skips a removed item', async () => {
                const fixture = await renderScenario(NavbarScenario, config);
                const navbar = horizontalNavbar(fixture);

                tabInto(navbar);
                await fixture.whenStable();
                await press(fixture, RIGHT_ARROW);

                expect(focusedLabel()).toBe('Dashboards');

                fixture.componentInstance.removeSection('tasks');
                await fixture.whenStable();

                expect(fixture.componentInstance.navbar().focusableItems.length).toBe(HORIZONTAL_LABELS.length - 1);

                await press(fixture, RIGHT_ARROW);

                expect(focusedLabel()).toBe('Reports');

                await press(fixture, LEFT_ARROW);

                expect(focusedLabel()).toBe('Dashboards');
            });

            it('takes the keyboard back after the focused item is removed', async () => {
                const fixture = await renderScenario(NavbarScenario, config);
                const navbar = horizontalNavbar(fixture);

                tabInto(navbar);
                await fixture.whenStable();
                await press(fixture, RIGHT_ARROW);
                await press(fixture, RIGHT_ARROW);

                expect(focusedLabel()).toBe('Tasks');

                fixture.componentInstance.removeSection('tasks');
                await fixture.whenStable();

                expect(navbar.contains(document.activeElement)).toBe(false);
                expect(navbar.getAttribute('tabindex')).toBe('0');

                tabInto(navbar);
                await fixture.whenStable();

                expect(focusedLabel()).toBe('Koobiq');

                await press(fixture, RIGHT_ARROW);
                await press(fixture, RIGHT_ARROW);

                expect(focusedLabel()).toBe('Reports');
            });
        });
    });
}

import { ComponentFixture } from '@angular/core/testing';
import { ENTER, ESCAPE, TAB, typeInElement } from '@koobiq/components/core';
import { CheckConfig } from '../config';
import { renderScenario } from '../testing';
import { TooltipScenario } from './tooltip';

/** `kbqEnterDelay` of a tooltip that does not bind it. */
const TOOLTIP_ENTER_DELAY = 400;

/** Long enough for a pop-up's zero-delay timers, which the fake clock runs 1 ms apart when one schedules the next. */
const TIMER_CHAIN = 10;

export function defineTooltipSuite(config: CheckConfig): void {
    let fixture: ComponentFixture<TooltipScenario>;
    let scenario: TooltipScenario;

    const byCheck = (name: string): HTMLButtonElement => fixture.nativeElement.querySelector(`[data-check="${name}"]`);

    /** Moves the fake clock and renders what its timers changed. */
    const elapse = async (ms: number): Promise<void> => {
        await vi.advanceTimersByTimeAsync(ms);
        fixture.detectChanges();
    };

    // Native constructors: the mouse and keyboard helpers of `@koobiq/components/core` pass the global `window` as
    // the event's view, which in this jsdom environment is Node's global object, and jsdom rejects it.
    const hover = (element: HTMLElement): void => void element.dispatchEvent(new MouseEvent('mouseenter'));
    const leave = (element: HTMLElement): void => void element.dispatchEvent(new MouseEvent('mouseleave'));

    const press = (element: Element, key: string, keyCode: number): void =>
        void element.dispatchEvent(new KeyboardEvent('keydown', { key, keyCode, bubbles: true, cancelable: true }));

    /** What a Tab press onto the element leaves behind: a keyboard focus origin, then the focus itself. */
    const tabTo = (element: HTMLElement): void => {
        press(document.body, 'Tab', TAB);
        element.focus();
    };

    const pressEscape = (): void => press(document.activeElement ?? document.body, 'Escape', ESCAPE);

    beforeEach(async () => {
        fixture = await renderScenario(TooltipScenario, config);
        scenario = fixture.componentInstance;

        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    describe(`tooltip (${config.name})`, () => {
        let save: HTMLButtonElement;

        const tooltip = (): HTMLElement | null => document.querySelector('.kbq-tooltip');
        const isShown = (): boolean => !!tooltip()?.classList.contains('kbq-tooltip_visible');

        beforeEach(() => {
            save = byCheck('save');
        });

        it('shows on hover after its enter delay and hides when the pointer leaves', async () => {
            hover(save);
            await elapse(TOOLTIP_ENTER_DELAY - 1);

            expect(isShown()).toBe(false);
            expect(scenario.tooltipVisibility()).toEqual([]);

            await elapse(1);

            expect(isShown()).toBe(true);
            expect(tooltip()!.textContent?.trim()).toBe('Saves the draft without publishing it');
            expect(save.classList).toContain('kbq-tooltip_open');
            expect(scenario.tooltipVisibility()).toEqual([true]);

            leave(save);
            await elapse(TIMER_CHAIN);

            expect(tooltip()).toBeNull();
            expect(scenario.tooltipVisibility()).toEqual([true, false]);
        });

        it('shows on keyboard focus and hides on blur', async () => {
            tabTo(save);
            await elapse(TOOLTIP_ENTER_DELAY);

            expect(document.activeElement).toBe(save);
            expect(isShown()).toBe(true);
            expect(scenario.tooltipVisibility()).toEqual([true]);

            save.blur();
            await elapse(TIMER_CHAIN);

            expect(tooltip()).toBeNull();
            expect(scenario.tooltipVisibility()).toEqual([true, false]);
        });

        it('links the trigger to the open tooltip with aria-describedby', async () => {
            expect(save.hasAttribute('aria-describedby')).toBe(false);

            hover(save);
            await elapse(TOOLTIP_ENTER_DELAY);

            const element = tooltip()!;

            expect(element.getAttribute('role')).toBe('tooltip');
            expect(element.id).toBeTruthy();
            expect(save.getAttribute('aria-describedby')).toBe(element.id);
            expect(document.getElementById(save.getAttribute('aria-describedby')!)).toBe(element);

            leave(save);
            await elapse(TIMER_CHAIN);

            expect(save.hasAttribute('aria-describedby')).toBe(false);
        });

        it('is dismissed by Escape while the pointer stays on the trigger', async () => {
            hover(save);
            await elapse(TOOLTIP_ENTER_DELAY);

            expect(isShown()).toBe(true);

            pressEscape();
            await elapse(TIMER_CHAIN);

            expect(tooltip()).toBeNull();
            expect(scenario.tooltipVisibility()).toEqual([true, false]);
        });

        it('stays hidden while kbqTooltipDisabled is set, and shows again once it is cleared', async () => {
            scenario.hintsDisabled.set(true);
            fixture.detectChanges();

            hover(save);
            await elapse(TOOLTIP_ENTER_DELAY * 2);

            expect(tooltip()).toBeNull();

            leave(save);
            tabTo(save);
            await elapse(TOOLTIP_ENTER_DELAY * 2);

            expect(tooltip()).toBeNull();
            expect(save.hasAttribute('aria-describedby')).toBe(false);
            expect(scenario.tooltipVisibility()).toEqual([]);

            save.blur();
            scenario.hintsDisabled.set(false);
            fixture.detectChanges();

            hover(save);
            await elapse(TOOLTIP_ENTER_DELAY);

            expect(isShown()).toBe(true);
            expect(scenario.tooltipVisibility()).toEqual([true]);
        });

        it('detaches the tooltip overlay once it has hidden', async () => {
            hover(save);
            await elapse(TOOLTIP_ENTER_DELAY);

            expect(document.querySelector('.kbq-tooltip-panel')).not.toBeNull();

            leave(save);
            await elapse(TIMER_CHAIN);

            expect(document.querySelector('kbq-tooltip-component')).toBeNull();
            expect(document.querySelector('.kbq-tooltip-panel')).toBeNull();
            expect(save.classList).not.toContain('kbq-tooltip_open');
        });
    });

    describe(`popover (${config.name})`, () => {
        let rename: HTMLButtonElement;

        const panel = (): HTMLElement | null => document.querySelector('.kbq-popover');
        const isShown = (): boolean => !!panel()?.classList.contains('kbq-popover_visible');
        const nameInput = (): HTMLInputElement | null => document.querySelector('.kbq-popover input');

        beforeEach(() => {
            rename = byCheck('rename');

            // CDK's focus trap only focuses an element with a layout box, and jsdom lays nothing out: give the
            // elements of an open overlay the box a browser would.
            const getClientRects = Element.prototype.getClientRects;
            const box = [{ x: 0, y: 0, width: 100, height: 20, top: 0, left: 0, right: 100, bottom: 20 }];

            vi.spyOn(Element.prototype, 'getClientRects').mockImplementation(function (this: Element) {
                return this.closest('.cdk-overlay-pane') ? (box as unknown as DOMRectList) : getClientRects.call(this);
            });
        });

        it('opens on a click and closes on a click outside', async () => {
            expect(rename.getAttribute('aria-haspopup')).toBe('dialog');
            expect(rename.getAttribute('aria-expanded')).toBe('false');

            rename.click();
            await elapse(TIMER_CHAIN);

            expect(isShown()).toBe(true);
            expect(panel()!.getAttribute('role')).toBe('dialog');
            expect(panel()!.getAttribute('aria-label')).toBe('Rename the draft');
            expect(panel()!.querySelector('.kbq-popover__header')?.textContent?.trim()).toBe('Rename the draft');
            expect(nameInput()?.value).toBe('Quarterly report');
            expect(rename.getAttribute('aria-expanded')).toBe('true');
            expect(rename.getAttribute('aria-controls')).toBe(panel()!.id);

            document.body.click();
            await elapse(TIMER_CHAIN);

            expect(panel()).toBeNull();
            expect(rename.getAttribute('aria-expanded')).toBe('false');
            expect(rename.hasAttribute('aria-controls')).toBe(false);
        });

        it('opens on Enter and closes on Escape', async () => {
            tabTo(rename);
            press(rename, 'Enter', ENTER);
            await elapse(TIMER_CHAIN);

            expect(isShown()).toBe(true);

            pressEscape();
            await elapse(TIMER_CHAIN);

            expect(panel()).toBeNull();
            expect(rename.getAttribute('aria-expanded')).toBe('false');
        });

        it('emits kbqPopoverVisibleChange once per open and once per close', async () => {
            rename.click();
            await elapse(TIMER_CHAIN);

            expect(scenario.popoverVisibility()).toEqual([true]);

            pressEscape();
            await elapse(TIMER_CHAIN);

            expect(scenario.popoverVisibility()).toEqual([true, false]);

            rename.click();
            await elapse(TIMER_CHAIN);
            document.body.click();
            await elapse(TIMER_CHAIN);

            expect(scenario.popoverVisibility()).toEqual([true, false, true, false]);
        });

        it('moves focus into the panel on open and back to the trigger on close', async () => {
            tabTo(rename);
            press(rename, 'Enter', ENTER);
            await elapse(TIMER_CHAIN);

            const input = nameInput()!;

            expect(document.activeElement).toBe(input);

            typeInElement('Annual report', input);
            await elapse(0);

            expect(scenario.name.value).toBe('Annual report');

            pressEscape();
            await elapse(TIMER_CHAIN);

            expect(panel()).toBeNull();
            expect(document.activeElement).toBe(rename);
        });

        it('detaches the popover overlay once it has closed', async () => {
            rename.click();
            await elapse(TIMER_CHAIN);

            expect(document.querySelector('.kbq-popover__panel')).not.toBeNull();

            document.body.click();
            await elapse(TIMER_CHAIN);

            expect(document.querySelector('kbq-popover-component')).toBeNull();
            expect(document.querySelector('.kbq-popover__panel')).toBeNull();
            expect(rename.classList).not.toContain('kbq-popover_open');
        });
    });
}

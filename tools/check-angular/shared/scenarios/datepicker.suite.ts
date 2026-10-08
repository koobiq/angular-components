import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DOWN_ARROW, ESCAPE, KBQ_DATE_LOCALE, TAB, UP_ARROW } from '@koobiq/components/core';
import { DateTime } from 'luxon';
import { CheckConfig } from '../config';
import { renderScenario } from '../testing';
import { DatepickerScenario } from './datepicker';

const PANEL = '.cdk-overlay-container .kbq-datepicker__popup';
const FOCUSABLE = '[tabindex], a[href], button:not([disabled]), input:not([disabled]), select, textarea';

function getPanel(): HTMLElement | null {
    return document.querySelector<HTMLElement>(PANEL);
}

/** The month and the year the calendar header shows. */
function getHeader(): string[] {
    return Array.from(
        document.querySelectorAll<HTMLElement>(`${PANEL} .kbq-calendar-header__select-group button`),
        (button) => button.textContent?.trim() ?? ''
    );
}

function getSelectedDay(): string | undefined {
    return document.querySelector(`${PANEL} .kbq-calendar__body-cell-content.kbq-selected`)?.textContent?.trim();
}

function getDay(day: number): HTMLElement {
    const cell = Array.from(document.querySelectorAll<HTMLElement>(`${PANEL} .kbq-calendar__body-cell`)).find(
        (element) => element.textContent?.trim() === `${day}`
    );

    if (!cell) throw new Error(`No day ${day} in the calendar`);

    return cell;
}

/** What a browser does for a primary-button click: press (which moves focus unless prevented), release, click. */
function clickWithMouse(element: HTMLElement): void {
    element.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));

    const mousedown = new MouseEvent('mousedown', { bubbles: true, cancelable: true });

    element.dispatchEvent(mousedown);

    if (!mousedown.defaultPrevented) {
        const focusable = element.closest<HTMLElement>(FOCUSABLE);

        if (focusable) {
            focusable.focus();
        } else {
            (document.activeElement as HTMLElement | null)?.blur();
        }
    }

    element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
    element.click();
}

/** A keydown on the focused element, where the browser delivers it. */
function press(keyCode: number, key?: string, altKey = false): KeyboardEvent {
    const event = new KeyboardEvent('keydown', { key, keyCode, altKey, bubbles: true, cancelable: true });

    document.activeElement!.dispatchEvent(event);

    return event;
}

export function defineDatepickerSuite(config: CheckConfig): void {
    describe(`datepicker (${config.name})`, () => {
        let fixture: ComponentFixture<DatepickerScenario>;
        let input: HTMLInputElement;
        let toggle: HTMLElement;

        /** Lets the timers the input defers its parsing and caret moves to run, then renders. */
        async function settle(): Promise<void> {
            await new Promise((resolve) => setTimeout(resolve, 10));
            await fixture.whenStable();
        }

        /** Types digit by digit into the focused input, the way the browser edits it when a keydown is not prevented. */
        async function type(digits: string): Promise<void> {
            for (const key of digits) {
                const target = document.activeElement as HTMLInputElement;

                if (!press(key.charCodeAt(0), key).defaultPrevented) {
                    const start = target.selectionStart ?? target.value.length;
                    const end = target.selectionEnd ?? start;

                    target.value = target.value.slice(0, start) + key + target.value.slice(end);
                    target.setSelectionRange(start + 1, start + 1);
                    target.dispatchEvent(new Event('input', { bubbles: true }));
                }

                await settle();
            }
        }

        /** Tab out of the input. */
        async function leave(): Promise<void> {
            press(TAB);
            input.blur();
            await settle();
        }

        async function openWithToggle(): Promise<void> {
            clickWithMouse(toggle.querySelector<HTMLElement>('[kbq-icon-button]')!);
            await fixture.whenStable();
        }

        async function openWithKeyboard(): Promise<void> {
            clickWithMouse(input);
            press(DOWN_ARROW, undefined, true);
            await fixture.whenStable();
        }

        function value(): string | null | undefined {
            return fixture.componentInstance.date.value?.toISODate();
        }

        function rendered(): string | undefined {
            return fixture.nativeElement.querySelector('.check-datepicker__value')?.textContent?.trim();
        }

        function events(): string[] {
            return fixture.componentInstance.events();
        }

        function expectClosed(): void {
            expect(getPanel()).toBeNull();
            expect(document.querySelector('.kbq-datepicker__content')).toBeNull();
            expect(toggle.getAttribute('aria-expanded')).toBe('false');
        }

        beforeEach(async () => {
            fixture = await renderScenario(DatepickerScenario, config);
            input = fixture.nativeElement.querySelector('input');
            toggle = fixture.nativeElement.querySelector('kbq-datepicker-toggle-icon');
        });

        it('renders the date of the control in the input', () => {
            expect(input.value).toBe('2026-03-05');
            expect(rendered()).toBe('2026-03-05');
            expectClosed();
        });

        it('shows a placeholder in the format the input takes', async () => {
            fixture.componentInstance.date.setValue(null);
            await fixture.whenStable();

            expect(input.value).toBe('');
            expect(input.placeholder).toBe('yyyy-mm-dd');
        });

        it('types a date into the input and the form control gets it', async () => {
            clickWithMouse(input);
            input.select();
            await type('20260412');

            expect(value()).toBe('2026-04-12');
            expect(input.value).toBe('2026-04-12');
            expect(rendered()).toBe('2026-04-12');

            await leave();

            expect(input.value).toBe('2026-04-12');
            expect(fixture.componentInstance.date.touched).toBe(true);
            expect(fixture.componentInstance.date.valid).toBe(true);
        });

        it('steps the day under the caret with ArrowUp and the control follows', async () => {
            clickWithMouse(input);
            input.setSelectionRange(9, 9);

            expect(press(UP_ARROW).defaultPrevented).toBe(true);
            await settle();

            expect(input.value).toBe('2026-03-06');
            expect(value()).toBe('2026-03-06');
            expect(events()).toEqual(['dateChange 2026-03-06']);
        });

        it('opens the calendar from the toggle on the month of the control', async () => {
            await openWithToggle();

            expect(getPanel()).not.toBeNull();
            expect(toggle.getAttribute('aria-expanded')).toBe('true');
            expect(toggle.querySelector('[kbq-icon-button]')!.classList).toContain('kbq-active');
            expect(getHeader()).toEqual(['Mar', '2026']);
            expect(getSelectedDay()).toBe('5');
            expect(events()).toEqual(['opened']);
        });

        it('opens on the month of a date written to the control', async () => {
            fixture.componentInstance.date.setValue(DateTime.fromObject({ year: 2026, month: 7, day: 20 }));
            await fixture.whenStable();

            expect(input.value).toBe('2026-07-20');

            await openWithToggle();

            expect(getHeader()).toEqual(['Jul', '2026']);
            expect(getSelectedDay()).toBe('20');
        });

        it('sets a clicked day on the control, then closes and detaches the calendar', async () => {
            await openWithToggle();

            clickWithMouse(getDay(17));
            await fixture.whenStable();

            expect(value()).toBe('2026-03-17');
            expect(input.value).toBe('2026-03-17');
            expect(rendered()).toBe('2026-03-17');
            expect(fixture.componentInstance.date.dirty).toBe(true);
            expect(fixture.componentInstance.date.touched).toBe(true);
            expect(events()).toEqual(['opened', 'dateChange 2026-03-17', 'closed']);
            expectClosed();
        });

        it('opens with Alt+ArrowDown and closes on Escape, keeping the focus in the input', async () => {
            await openWithKeyboard();

            expect(getPanel()).not.toBeNull();
            expect(getHeader()).toEqual(['Mar', '2026']);

            expect(press(ESCAPE).defaultPrevented).toBe(true);
            await fixture.whenStable();

            expectClosed();
            expect(document.activeElement).toBe(input);
            expect(value()).toBe('2026-03-05');
            expect(events()).toEqual(['opened', 'closed']);
        });

        it('returns the focus to the input once a day is picked', async () => {
            await openWithKeyboard();

            clickWithMouse(getDay(17));
            await fixture.whenStable();

            expect(value()).toBe('2026-03-17');
            expect(document.activeElement).toBe(input);
            expectClosed();
        });

        it('returns the focus to the input once a day is picked in a calendar opened from the toggle', async () => {
            clickWithMouse(input);
            await openWithToggle();

            clickWithMouse(getDay(17));
            await fixture.whenStable();

            expect(value()).toBe('2026-03-17');
            expect(document.activeElement).toBe(input);
        });

        it('closes on Escape a calendar opened from the toggle', async () => {
            clickWithMouse(input);
            await openWithToggle();

            press(ESCAPE);
            await fixture.whenStable();

            expectClosed();
            expect(events()).toEqual(['opened', 'closed']);
        });

        it('closes on Escape pressed inside the calendar and returns the focus to the input', async () => {
            await openWithToggle();

            const nextMonth = document.querySelector<HTMLElement>(`${PANEL} .kbq-calendar-header__next-button`)!;

            clickWithMouse(nextMonth);
            await fixture.whenStable();

            expect(getHeader()).toEqual(['Apr', '2026']);
            expect(document.activeElement).toBe(nextMonth);

            expect(press(ESCAPE).defaultPrevented).toBe(true);
            await fixture.whenStable();

            expectClosed();
            expect(document.activeElement).toBe(input);
            expect(events()).toEqual(['opened', 'closed']);
        });

        it('closes on a click outside and detaches the calendar', async () => {
            await openWithToggle();

            clickWithMouse(document.body);
            await fixture.whenStable();

            expectClosed();
            expect(value()).toBe('2026-03-05');
            expect(events()).toEqual(['opened', 'closed']);
        });

        it('closes when the toggle is clicked again, and opens on the next click', async () => {
            await openWithToggle();
            await openWithToggle();

            expectClosed();

            await openWithToggle();

            expect(getPanel()).not.toBeNull();
            expect(toggle.getAttribute('aria-expanded')).toBe('true');
        });

        it('fires opened and closed once when the toggle is clicked twice', async () => {
            await openWithToggle();
            await openWithToggle();

            expect(events()).toEqual(['opened', 'closed']);
        });

        it('reports [min] and [max] on the control and shows the error once it is touched', async () => {
            const { date } = fixture.componentInstance;

            date.setValue(DateTime.fromObject({ year: 2025, month: 12, day: 31 }));
            await fixture.whenStable();

            expect(date.hasError('kbqDatepickerMin')).toBe(true);
            expect(fixture.nativeElement.querySelector('kbq-error')).toBeNull();

            clickWithMouse(input);
            await leave();

            const error: HTMLElement = fixture.nativeElement.querySelector('kbq-error');

            expect(error?.textContent?.trim()).toBe('Pick a date in 2026');
            expect(fixture.nativeElement.querySelector('kbq-form-field').classList).toContain('kbq-form-field_invalid');
            expect(input.getAttribute('aria-describedby')?.split(' ')).toContain(error.id);

            date.setValue(DateTime.fromObject({ year: 2027, month: 1, day: 1 }));
            await fixture.whenStable();

            expect(date.hasError('kbqDatepickerMax')).toBe(true);
            expect(date.hasError('kbqDatepickerMin')).toBe(false);

            date.setValue(DateTime.fromObject({ year: 2026, month: 12, day: 31, hour: 12 }));
            await fixture.whenStable();

            expect(date.errors).toBeNull();
            expect(fixture.nativeElement.querySelector('kbq-error')).toBeNull();
            expect(fixture.nativeElement.querySelector('kbq-form-field').classList).not.toContain(
                'kbq-form-field_invalid'
            );
        });

        it('flags a typed date before [min]', async () => {
            clickWithMouse(input);
            input.select();
            await type('20251231');
            await leave();

            expect(value()).toBe('2025-12-31');
            expect(fixture.componentInstance.date.hasError('kbqDatepickerMin')).toBe(true);
            expect(fixture.nativeElement.querySelector('kbq-error')).not.toBeNull();
        });
    });

    describe(`datepicker in a date locale the library ships no strings for (${config.name})`, () => {
        it('shows a placeholder in the format the input takes', async () => {
            // Where the scenario provides its date adapter, as a lazy route would.
            TestBed.overrideComponent(DatepickerScenario, {
                add: { providers: [{ provide: KBQ_DATE_LOCALE, useValue: 'zh-CN' }] }
            });

            const fixture = await renderScenario(DatepickerScenario, config);
            const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

            expect(input.value).toBe('2026/03/05');

            fixture.componentInstance.date.setValue(null);
            await fixture.whenStable();

            expect(input.placeholder).toBe('yyyy/mm/dd');
        });
    });
}

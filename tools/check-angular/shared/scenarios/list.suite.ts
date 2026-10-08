import { QueryList } from '@angular/core';
import { DOWN_ARROW, END, ENTER, HOME, SPACE, TAB, UP_ARROW } from '@koobiq/components/core';
import { KbqListOption } from '@koobiq/components/list';
import { CheckConfig } from '../config';
import { renderScenario } from '../testing';
import { LIST_SCENARIO_FRUITS, ListScenario } from './list';

const KEYS: Record<number, string> = {
    [DOWN_ARROW]: 'ArrowDown',
    [UP_ARROW]: 'ArrowUp',
    [HOME]: 'Home',
    [END]: 'End',
    [SPACE]: ' ',
    [ENTER]: 'Enter',
    [TAB]: 'Tab'
};

const label = (option: Element): string => option.querySelector('.kbq-list-text')?.textContent?.trim() ?? '';

async function renderList(config: CheckConfig) {
    const fixture = await renderScenario(ListScenario, config);
    const scenario = fixture.componentInstance;
    const host: HTMLElement = fixture.nativeElement;
    const list = host.querySelector<HTMLElement>('kbq-list-selection')!;
    const after = host.querySelector<HTMLElement>('[data-testid="list-after"]')!;
    const stable = () => fixture.whenStable();

    const options = (): HTMLElement[] => Array.from(list.querySelectorAll<HTMLElement>('kbq-list-option'));

    const option = (name: string): HTMLElement => {
        const found = options().find((item) => label(item) === name);

        if (!found) throw new Error(`No option "${name}"`);

        return found;
    };

    return {
        scenario,
        list,
        after,
        stable,
        options,
        option,
        labels: () => options().map(label),
        selectedLabels: () =>
            options()
                .filter((item) => item.getAttribute('aria-selected') === 'true')
                .map(label),
        summary: () => host.querySelector('[data-testid="list-summary"]')!.textContent!.trim(),

        /** The option holding the focus, or the tag of whatever else does. */
        focused(): string {
            const active = document.activeElement;

            if (active?.matches('kbq-list-option')) return label(active);

            return `<${active?.getAttribute('data-testid') ?? active?.tagName.toLowerCase()}>`;
        },

        /** A keydown on the focused element, without waiting for the page to settle. */
        keydown(keyCode: number, init: KeyboardEventInit = {}): KeyboardEvent {
            const event = new KeyboardEvent('keydown', {
                key: KEYS[keyCode],
                keyCode,
                bubbles: true,
                cancelable: true,
                ...init
            });

            (document.activeElement ?? document.body).dispatchEvent(event);

            return event;
        },

        async press(keyCode: number, init: KeyboardEventInit = {}): Promise<KeyboardEvent> {
            const event = this.keydown(keyCode, init);

            await stable();

            return event;
        },

        /** Tab into the list. jsdom moves no focus on Tab, so it lands where the browser would put it. */
        async tabIn(): Promise<void> {
            list.focus();
            await stable();
        },

        /** Tab out of the list: the keydown the list handles, then the focus moving on to the next tab stop. */
        async tabOut(): Promise<void> {
            this.keydown(TAB);
            after.focus();
            await stable();
        },

        /** A mouse click, with the focus a mousedown gives the nearest focusable element. */
        async click(element: HTMLElement): Promise<void> {
            element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
            element.closest<HTMLElement>('[tabindex]')?.focus();
            element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
            element.click();
            await stable();
        }
    };
}

export function defineListSuite(config: CheckConfig): void {
    describe(`list (${config.name})`, () => {
        describe('focus', () => {
            it('is a single tab stop that Tab enters on the first option while nothing is selected', async () => {
                const page = await renderList(config);

                expect(page.list.getAttribute('role')).toBe('listbox');
                expect(page.list.getAttribute('aria-multiselectable')).toBe('true');
                expect(page.list.getAttribute('tabindex')).toBe('0');
                expect(page.options().map((option) => option.getAttribute('tabindex'))).toEqual([
                    '-1',
                    '-1',
                    '-1',
                    '-1'
                ]);

                await page.tabIn();

                expect(page.focused()).toBe('Apple');
                expect(page.option('Apple').classList).toContain('kbq-focused');
                expect(page.selectedLabels()).toEqual([]);
            });

            it('enters on the first selected option', async () => {
                const page = await renderList(config);

                page.scenario.fruitsControl.setValue(['grape', 'banana']);
                await page.stable();

                await page.tabIn();

                expect(page.focused()).toBe('Banana');
                expect(page.option('Banana').classList).toContain('kbq-focused');
                expect(page.option('Apple').classList).not.toContain('kbq-focused');
            });

            it('lets Tab leave and takes the focus back in on the selected option', async () => {
                const page = await renderList(config);

                await page.tabIn();
                await page.press(DOWN_ARROW);
                await page.press(SPACE);

                // The list leaves the tab order for the Tab that leaves it, so the focus does not land on its host.
                page.keydown(TAB);
                expect(page.list.tabIndex).toBe(-1);

                page.after.focus();
                await page.stable();

                expect(page.focused()).toBe('<list-after>');
                expect(page.options().filter((option) => option.classList.contains('kbq-focused'))).toEqual([]);
                expect(page.scenario.fruitsControl.touched).toBe(true);

                await new Promise((resolve) => setTimeout(resolve));
                await page.stable();

                expect(page.list.getAttribute('tabindex')).toBe('0');

                await page.tabIn();

                expect(page.focused()).toBe('Banana');
                expect(page.selectedLabels()).toEqual(['Banana']);
            });

            // Library bug: `KbqListSelection.focus()` hands the focus from the host to an option, so the host's own
            // `(blur)` runs `blur()` -> `onTouched()` the moment the list is entered; every option blur inside the
            // list reaches `blur()` -> `onTouched()` as well. A `required` error shown on touched appears on entry.
            it.fails('is touched once the focus leaves the list, not while it moves inside', async () => {
                const page = await renderList(config);
                const control = page.scenario.fruitsControl;

                await page.tabIn();

                expect(control.touched).toBe(false);

                await page.press(DOWN_ARROW);
                await page.press(SPACE);

                expect(control.touched).toBe(false);

                await page.tabOut();

                expect(control.touched).toBe(true);
            });
        });

        describe('keyboard', () => {
            it('moves the focus with the arrow keys, Home and End, without selecting', async () => {
                const page = await renderList(config);

                await page.tabIn();

                const down = await page.press(DOWN_ARROW);

                expect(down.defaultPrevented).toBe(true);
                expect(page.focused()).toBe('Banana');
                expect(page.option('Banana').classList).toContain('kbq-focused');
                expect(page.option('Apple').classList).not.toContain('kbq-focused');

                await page.press(DOWN_ARROW);
                expect(page.focused()).toBe('Cherry');

                await page.press(UP_ARROW);
                expect(page.focused()).toBe('Banana');

                await page.press(END);
                expect(page.focused()).toBe('Grape');

                await page.press(DOWN_ARROW);
                expect(page.focused()).toBe('Grape');

                await page.press(HOME);
                expect(page.focused()).toBe('Apple');

                expect(page.selectedLabels()).toEqual([]);
                expect(page.scenario.fruitsControl.value).toEqual([]);
                expect(page.scenario.selectionChanges()).toEqual([]);
            });

            it('toggles the focused option with Space and Enter', async () => {
                const page = await renderList(config);

                await page.tabIn();

                const space = await page.press(SPACE);

                expect(space.defaultPrevented).toBe(true);
                expect(page.selectedLabels()).toEqual(['Apple']);
                expect(page.option('Apple').classList).toContain('kbq-selected');
                expect(page.scenario.fruitsControl.value).toEqual(['apple']);

                await page.press(DOWN_ARROW);
                await page.press(DOWN_ARROW);
                await page.press(ENTER);

                expect(page.selectedLabels()).toEqual(['Apple', 'Cherry']);
                expect(page.scenario.fruitsControl.value).toEqual(['apple', 'cherry']);
                expect(page.summary()).toBe('apple, cherry');

                await page.press(ENTER);

                expect(page.selectedLabels()).toEqual(['Apple']);
                expect(page.option('Cherry').getAttribute('aria-selected')).toBe('false');
                expect(page.scenario.fruitsControl.value).toEqual(['apple']);
                expect(page.scenario.selectionChanges()).toEqual(['apple:true', 'cherry:true', 'cherry:false']);
                expect(page.focused()).toBe('Cherry');
            });

            it('extends the selection with Shift and the arrow keys', async () => {
                const page = await renderList(config);

                await page.tabIn();
                await page.press(SPACE);
                await page.press(DOWN_ARROW, { shiftKey: true });

                expect(page.focused()).toBe('Banana');
                expect(page.selectedLabels()).toEqual(['Apple', 'Banana']);

                await page.press(DOWN_ARROW, { shiftKey: true });

                expect(page.focused()).toBe('Cherry');
                expect(page.selectedLabels()).toEqual(['Apple', 'Banana', 'Cherry']);
                expect(page.scenario.fruitsControl.value).toEqual(['apple', 'banana', 'cherry']);

                // Shrinking: the range takes the state of the option it starts from.
                await page.press(SPACE);
                await page.press(UP_ARROW, { shiftKey: true });

                expect(page.focused()).toBe('Banana');
                expect(page.selectedLabels()).toEqual(['Apple']);
                expect(page.scenario.fruitsControl.value).toEqual(['apple']);
                expect(page.scenario.selectionChanges()).toEqual([
                    'apple:true',
                    'banana:true',
                    'cherry:true',
                    'cherry:false',
                    'banana:false'
                ]);
            });
        });

        describe('mouse', () => {
            it('toggles an option on click and reports it to the control and through selectionChange', async () => {
                const page = await renderList(config);
                const list = page.scenario.list();
                const sources: unknown[] = [];
                const subscription = list.selectionChange.subscribe((event) => sources.push(event.source));

                expect(page.scenario.fruitsControl.dirty).toBe(false);

                await page.click(page.option('Banana'));

                expect(page.selectedLabels()).toEqual(['Banana']);
                expect(page.focused()).toBe('Banana');
                expect(page.option('Banana').classList).toContain('kbq-focused');
                expect(page.scenario.fruitsControl.value).toEqual(['banana']);
                expect(page.scenario.fruitsControl.dirty).toBe(true);

                await page.click(page.option('Grape'));

                expect(page.selectedLabels()).toEqual(['Banana', 'Grape']);
                expect(page.scenario.fruitsControl.value).toEqual(['banana', 'grape']);

                await page.click(page.option('Banana'));

                expect(page.selectedLabels()).toEqual(['Grape']);
                expect(page.scenario.fruitsControl.value).toEqual(['grape']);
                expect(page.summary()).toBe('grape');
                expect(page.scenario.selectionChanges()).toEqual(['banana:true', 'grape:true', 'banana:false']);
                expect(sources).toEqual([list, list, list]);

                // The keyboard picks up from where the click left the focus.
                await page.press(DOWN_ARROW);
                expect(page.focused()).toBe('Cherry');

                subscription.unsubscribe();
            });
        });

        describe('form control', () => {
            it('shows a value written to the control without emitting selectionChange', async () => {
                const page = await renderList(config);

                page.scenario.fruitsControl.setValue(['grape', 'apple']);
                await page.stable();

                expect(page.selectedLabels()).toEqual(['Apple', 'Grape']);

                page.scenario.fruitsControl.setValue([]);
                await page.stable();

                expect(page.selectedLabels()).toEqual([]);
                expect(page.scenario.selectionChanges()).toEqual([]);
                expect(page.scenario.fruitsControl.dirty).toBe(false);
            });

            it('disables the list and its options with the control', async () => {
                const page = await renderList(config);

                await page.tabIn();

                page.scenario.fruitsControl.disable();
                await page.stable();

                expect(page.list.getAttribute('aria-disabled')).toBe('true');
                expect(page.list.classList).toContain('kbq-disabled');
                expect(page.list.getAttribute('tabindex')).toBe('-1');
                expect(page.options().map((option) => option.getAttribute('aria-disabled'))).toEqual([
                    'true',
                    'true',
                    'true',
                    'true'
                ]);
                expect(page.options().some((option) => option.hasAttribute('tabindex'))).toBe(false);

                // Reaches the option that kept the focus while the control was disabled.
                await page.press(SPACE);
                await page.press(DOWN_ARROW);
                await page.click(page.option('Banana'));

                expect(page.selectedLabels()).toEqual([]);
                expect(page.scenario.fruitsControl.value).toEqual([]);
                expect(page.scenario.selectionChanges()).toEqual([]);

                page.scenario.fruitsControl.enable();
                await page.stable();

                expect(page.list.hasAttribute('aria-disabled')).toBe(false);
                expect(page.list.classList).not.toContain('kbq-disabled');
                expect(page.list.getAttribute('tabindex')).toBe('0');
                expect(page.options().map((option) => option.getAttribute('tabindex'))).toEqual([
                    '-1',
                    '-1',
                    '-1',
                    '-1'
                ]);

                await page.click(page.option('Banana'));

                expect(page.selectedLabels()).toEqual(['Banana']);
                expect(page.scenario.fruitsControl.value).toEqual(['banana']);
            });
        });

        describe('options changing through the signal', () => {
            it('selects the options that arrive after the value', async () => {
                const page = await renderList(config);

                page.scenario.fruits.set([]);
                await page.stable();

                expect(page.options()).toEqual([]);
                expect(page.list.getAttribute('tabindex')).toBe('-1');

                page.scenario.fruitsControl.setValue(['cherry']);
                await page.stable();

                page.scenario.fruits.set(LIST_SCENARIO_FRUITS);
                await page.stable();

                expect(page.selectedLabels()).toEqual(['Cherry']);
                expect(page.list.getAttribute('tabindex')).toBe('0');
                expect(page.scenario.fruitsControl.value).toEqual(['cherry']);

                await page.tabIn();

                expect(page.focused()).toBe('Cherry');
            });

            it('keeps the selection and the focus when options are added', async () => {
                const page = await renderList(config);

                await page.click(page.option('Apple'));
                await page.click(page.option('Cherry'));

                page.scenario.addFruit({ id: 'apricot', name: 'Apricot' }, 1);
                page.scenario.addFruit({ id: 'kiwi', name: 'Kiwi' });
                await page.stable();

                expect(page.labels()).toEqual(['Apple', 'Apricot', 'Banana', 'Cherry', 'Grape', 'Kiwi']);
                expect(page.selectedLabels()).toEqual(['Apple', 'Cherry']);
                expect(page.scenario.fruitsControl.value).toEqual(['apple', 'cherry']);
                expect(page.scenario.selectionChanges()).toEqual(['apple:true', 'cherry:true']);
                expect(page.focused()).toBe('Cherry');

                await page.press(DOWN_ARROW);
                expect(page.focused()).toBe('Grape');

                await page.press(DOWN_ARROW);
                expect(page.focused()).toBe('Kiwi');

                await page.press(SPACE);
                expect(page.scenario.fruitsControl.value).toEqual(['apple', 'cherry', 'kiwi']);

                await page.press(HOME);
                await page.press(DOWN_ARROW);
                expect(page.focused()).toBe('Apricot');
            });

            it('moves the focus on when the focused option is removed', async () => {
                const page = await renderList(config);

                await page.tabIn();
                await page.press(DOWN_ARROW);

                page.scenario.removeFruit('banana');
                await page.stable();

                expect(page.labels()).toEqual(['Apple', 'Cherry', 'Grape']);
                expect(page.focused()).toBe('Cherry');
                expect(page.option('Cherry').classList).toContain('kbq-focused');

                await page.press(DOWN_ARROW);
                expect(page.focused()).toBe('Grape');

                // The last option hands the focus back instead.
                page.scenario.removeFruit('grape');
                await page.stable();

                expect(page.focused()).toBe('Cherry');

                await page.press(UP_ARROW);
                expect(page.focused()).toBe('Apple');
                expect(page.selectedLabels()).toEqual([]);
            });

            it('keeps the value of a removed selected option and selects it again when it comes back', async () => {
                const page = await renderList(config);

                await page.click(page.option('Apple'));
                await page.click(page.option('Banana'));

                page.scenario.removeFruit('banana');
                await page.stable();

                expect(page.selectedLabels()).toEqual(['Apple']);
                expect(page.scenario.fruitsControl.value).toEqual(['apple', 'banana']);
                expect(page.scenario.selectionChanges()).toEqual(['apple:true', 'banana:true']);

                page.scenario.addFruit({ id: 'banana', name: 'Banana' }, 1);
                await page.stable();

                expect(page.selectedLabels()).toEqual(['Apple', 'Banana']);
                expect(page.scenario.fruitsControl.value).toEqual(['apple', 'banana']);
            });

            it('keeps the public options QueryList in step and emits options.changes once per change', async () => {
                const page = await renderList(config);
                const list = page.scenario.list();
                const emissions: string[][] = [];
                const subscription = list.options.changes.subscribe((options: QueryList<KbqListOption<string>>) =>
                    emissions.push(options.map((option) => option.value))
                );

                expect(list.options.map((option) => option.value)).toEqual(['apple', 'banana', 'cherry', 'grape']);

                await page.click(page.option('Banana'));

                expect(emissions).toEqual([]);

                page.scenario.addFruit({ id: 'kiwi', name: 'Kiwi' }, 0);
                await page.stable();

                expect(emissions).toEqual([['kiwi', 'apple', 'banana', 'cherry', 'grape']]);
                expect(list.options.first.value).toBe('kiwi');

                page.scenario.removeFruit('cherry');
                await page.stable();

                expect(emissions.at(-1)).toEqual(['kiwi', 'apple', 'banana', 'grape']);
                expect(emissions).toHaveLength(2);

                page.scenario.fruits.update((fruits) => [...fruits].reverse());
                await page.stable();

                expect(emissions.at(-1)).toEqual(['grape', 'banana', 'apple', 'kiwi']);
                expect(emissions).toHaveLength(3);
                expect(list.options.length).toBe(4);
                expect(list.options.map((option) => option.getHostElement())).toEqual(page.options());
                expect(page.selectedLabels()).toEqual(['Banana']);

                subscription.unsubscribe();
            });
        });
    });
}

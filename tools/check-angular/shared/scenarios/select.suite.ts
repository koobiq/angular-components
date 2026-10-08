import { ComponentFixture } from '@angular/core/testing';
import { CheckConfig } from '../config';
import { renderScenario } from '../testing';
import { SelectScenario } from './select';
import {
    byTestId,
    click,
    failOnConsole,
    focus,
    focusedElement,
    Key,
    overlayContainer,
    press,
    settle,
    stubElementScrollTo,
    text
} from './select.helpers';

export function defineSelectSuite(config: CheckConfig): void {
    describe(`select (${config.name})`, () => {
        stubElementScrollTo();
        failOnConsole();

        let fixture: ComponentFixture<SelectScenario>;
        let scenario: SelectScenario;

        const panel = () => document.querySelector<HTMLElement>('.kbq-select__panel');
        const listbox = () => panel()?.querySelector<HTMLElement>('[role="listbox"]') ?? null;
        const options = () => Array.from(document.querySelectorAll<HTMLElement>('.kbq-select__panel kbq-option'));
        const option = (label: string) => options().find((element) => text(element) === label)!;
        const trigger = (select: HTMLElement) => select.querySelector<HTMLElement>('.kbq-select__trigger')!;

        beforeEach(async () => {
            fixture = await renderScenario(SelectScenario, config);
            scenario = fixture.componentInstance;
        });

        describe('single', () => {
            let select: HTMLElement;

            beforeEach(() => (select = byTestId(fixture, 'city')));

            it('renders a closed combobox named by the form field label', () => {
                expect(select.getAttribute('role')).toBe('combobox');
                expect(select.getAttribute('aria-haspopup')).toBe('listbox');
                expect(select.getAttribute('aria-expanded')).toBe('false');
                expect(select.hasAttribute('aria-controls')).toBe(false);
                expect(select.tabIndex).toBe(0);
                expect(text(document.getElementById(select.getAttribute('aria-labelledby')!))).toBe('City');
                expect(text(select.querySelector('.kbq-select__placeholder'))).toBe('Choose a city');
                expect(panel()).toBeNull();
                expect(text(byTestId(fixture, 'city-summary'))).toBe('closed: none');
            });

            it('opens on click, emits openedChange and activates the first option', async () => {
                await click(fixture, trigger(select));

                expect(select.getAttribute('aria-expanded')).toBe('true');
                expect(overlayContainer()?.contains(listbox())).toBe(true);
                expect(select.getAttribute('aria-controls')).toBe(listbox()!.id);
                expect(listbox()!.getAttribute('aria-labelledby')).toBe(select.getAttribute('aria-labelledby'));
                expect(options().map(text)).toEqual(scenario.cities);
                expect(options().map((element) => element.getAttribute('aria-selected'))).toEqual(
                    scenario.cities.map(() => 'false')
                );
                expect(options()[0].classList).toContain('kbq-active');
                expect(scenario.cityOpenedChanges()).toEqual([true]);
                expect(text(byTestId(fixture, 'city-summary'))).toBe('open: none');
            });

            it('moves focus to the active option when opened by a click', async () => {
                await click(fixture, trigger(select));

                expect(focusedElement()).toBe(options()[0]);
            });

            it.each<[string, Key, { altKey?: boolean }]>([
                ['Enter', 'Enter', {}],
                ['Space', ' ', {}],
                ['Alt+ArrowDown', 'ArrowDown', { altKey: true }]
            ])('opens with %s on the focused trigger', async (_, key, modifiers) => {
                await focus(fixture, select);
                const event = await press(fixture, key, modifiers);

                expect(event.defaultPrevented).toBe(true);
                expect(select.getAttribute('aria-expanded')).toBe('true');
                expect(focusedElement()).toBe(options()[0]);
                expect(scenario.cityOpenedChanges()).toEqual([true]);
                expect(scenario.city.value).toBeNull();
            });

            it('changes the value with arrows while closed, like a native select', async () => {
                await focus(fixture, select);

                await press(fixture, 'ArrowDown');
                expect(scenario.city.value).toBe('Amsterdam');

                await press(fixture, 'ArrowDown');
                expect(scenario.city.value).toBe('Berlin');

                await press(fixture, 'ArrowUp');
                expect(scenario.city.value).toBe('Amsterdam');

                expect(select.getAttribute('aria-expanded')).toBe('false');
                expect(panel()).toBeNull();
                expect(focusedElement()).toBe(select);
                expect(text(select.querySelector('.kbq-select__matcher-text'))).toBe('Amsterdam');
                expect(text(byTestId(fixture, 'city-summary'))).toBe('closed: Amsterdam');
                expect(scenario.city.dirty).toBe(true);
                expect(scenario.cityOpenedChanges()).toEqual([]);
            });

            it('moves the active option with arrows, selects it with Enter and gives focus back', async () => {
                await focus(fixture, select);
                await press(fixture, 'Enter');

                await press(fixture, 'ArrowDown');
                await press(fixture, 'ArrowDown');
                expect(focusedElement()).toBe(option('Lisbon'));

                await press(fixture, 'ArrowUp');
                expect(focusedElement()).toBe(option('Berlin'));
                expect(option('Berlin').classList).toContain('kbq-active');
                expect(options().filter((element) => element.classList.contains('kbq-active'))).toHaveLength(1);
                expect(scenario.city.value).toBeNull();

                await press(fixture, 'Enter');

                expect(scenario.city.value).toBe('Berlin');
                expect(scenario.city.dirty).toBe(true);
                expect(select.getAttribute('aria-expanded')).toBe('false');
                expect(panel()).toBeNull();
                expect(focusedElement()).toBe(select);
                expect(text(select.querySelector('.kbq-select__matcher-text'))).toBe('Berlin');
                expect(scenario.cityOpenedChanges()).toEqual([true, false]);
                expect(text(byTestId(fixture, 'city-summary'))).toBe('closed: Berlin');
            });

            it('selects an option with a click and gives focus back', async () => {
                await click(fixture, trigger(select));
                await click(fixture, option('Madrid'));

                expect(scenario.city.value).toBe('Madrid');
                expect(select.getAttribute('aria-expanded')).toBe('false');
                expect(panel()).toBeNull();
                expect(focusedElement()).toBe(select);
                expect(scenario.cityOpenedChanges()).toEqual([true, false]);
                expect(text(byTestId(fixture, 'city-summary'))).toBe('closed: Madrid');
            });

            it.each<[string, Key, { altKey?: boolean }]>([
                ['Escape', 'Escape', {}],
                ['Tab', 'Tab', {}],
                ['Alt+ArrowUp', 'ArrowUp', { altKey: true }]
            ])('closes on %s, keeps the value, gives focus back and detaches the panel', async (_, key, modifiers) => {
                await click(fixture, trigger(select));
                const openPanel = panel()!;

                expect(openPanel.isConnected).toBe(true);

                await press(fixture, key, modifiers);

                expect(select.getAttribute('aria-expanded')).toBe('false');
                expect(select.hasAttribute('aria-controls')).toBe(false);
                expect(openPanel.isConnected).toBe(false);
                expect(overlayContainer()?.querySelector('[role="listbox"]') ?? null).toBeNull();
                expect(focusedElement()).toBe(select);
                expect(scenario.city.value).toBeNull();
                expect(scenario.cityOpenedChanges()).toEqual([true, false]);
                expect(text(byTestId(fixture, 'city-summary'))).toBe('closed: none');
            });

            it('closes on a click outside and detaches the panel', async () => {
                await click(fixture, trigger(select));
                const openPanel = panel()!;

                await click(fixture, document.body);

                expect(select.getAttribute('aria-expanded')).toBe('false');
                expect(openPanel.isConnected).toBe(false);
                expect(scenario.city.value).toBeNull();
                expect(scenario.cityOpenedChanges()).toEqual([true, false]);
            });

            it('is not touched while focus moves into the panel, and is once the panel closes', async () => {
                await focus(fixture, select);
                await press(fixture, 'Enter');

                expect(focusedElement()).toBe(options()[0]);
                expect(scenario.city.touched).toBe(false);

                await press(fixture, 'Escape');

                expect(scenario.city.touched).toBe(true);
                expect(scenario.city.dirty).toBe(false);
            });

            it('is touched once focus leaves the closed trigger', async () => {
                await focus(fixture, select);
                expect(scenario.city.touched).toBe(false);

                select.blur();
                await settle(fixture);

                expect(scenario.city.touched).toBe(true);
            });

            it('shows a value written to the form control and opens on it', async () => {
                scenario.city.setValue('Madrid');
                await settle(fixture);

                expect(text(select.querySelector('.kbq-select__matcher-text'))).toBe('Madrid');
                expect(select.querySelector('.kbq-select__placeholder')).toBeNull();
                expect(scenario.city.pristine).toBe(true);
                expect(text(byTestId(fixture, 'city-summary'))).toBe('closed: Madrid');

                await click(fixture, trigger(select));

                expect(option('Madrid').getAttribute('aria-selected')).toBe('true');
                expect(option('Madrid').classList).toContain('kbq-selected');
                expect(option('Madrid').classList).toContain('kbq-active');
            });

            it('follows the form control being disabled and enabled', async () => {
                scenario.city.disable();
                await settle(fixture);

                expect(select.getAttribute('aria-disabled')).toBe('true');
                expect(select.classList).toContain('kbq-disabled');

                await click(fixture, trigger(select));
                expect(select.getAttribute('aria-expanded')).toBe('false');
                expect(panel()).toBeNull();

                scenario.city.enable();
                await settle(fixture);
                await click(fixture, trigger(select));

                expect(select.getAttribute('aria-disabled')).toBe('false');
                expect(select.getAttribute('aria-expanded')).toBe('true');
                expect(scenario.cityOpenedChanges()).toEqual([true]);
            });
        });

        describe('multiple with tags', () => {
            let select: HTMLElement;

            const tags = () => Array.from(select.querySelectorAll('kbq-tag')).map(text);

            beforeEach(() => (select = byTestId(fixture, 'topics')));

            it('opens with ArrowDown and toggles options with Enter and clicks, keeping the panel open', async () => {
                await focus(fixture, select);
                await press(fixture, 'ArrowDown');

                expect(select.getAttribute('aria-expanded')).toBe('true');
                expect(listbox()!.getAttribute('aria-multiselectable')).toBe('true');
                expect(focusedElement()).toBe(option('Angular'));

                await press(fixture, 'Enter');
                await press(fixture, 'ArrowDown');
                await press(fixture, 'ArrowDown');
                await press(fixture, 'Enter');
                await click(fixture, option('CDK'));

                expect(scenario.topics.value).toEqual(['Angular', 'CDK', 'RxJS']);
                expect(select.getAttribute('aria-expanded')).toBe('true');
                // The clicked option becomes the active one, as a browser would focus it.
                expect(focusedElement()).toBe(option('CDK'));
                expect(options().map((element) => element.getAttribute('aria-selected'))).toEqual([
                    'true',
                    'true',
                    'true',
                    'false',
                    'false'
                ]);
                expect(tags()).toEqual(['Angular', 'CDK', 'RxJS']);
                expect(text(byTestId(fixture, 'topics-summary'))).toBe('Angular, CDK, RxJS');
                expect(scenario.topicsOpenedChanges()).toEqual([true]);

                await press(fixture, 'Enter');
                expect(scenario.topics.value).toEqual(['Angular', 'RxJS']);

                await press(fixture, 'Escape');

                expect(select.getAttribute('aria-expanded')).toBe('false');
                expect(panel()).toBeNull();
                expect(focusedElement()).toBe(select);
                expect(scenario.topics.value).toEqual(['Angular', 'RxJS']);
                expect(tags()).toEqual(['Angular', 'RxJS']);
                expect(scenario.topics.touched).toBe(true);
                expect(scenario.topicsOpenedChanges()).toEqual([true, false]);
            });

            it('removes a value with the remove icon of its tag without opening the panel', async () => {
                scenario.topics.setValue(['CDK', 'Vitest']);
                await settle(fixture);

                expect(tags()).toEqual(['CDK', 'Vitest']);

                const remove = select.querySelector('kbq-tag .kbq-tag-remove')!;

                expect(remove.getAttribute('aria-label')).toContain('CDK');

                await click(fixture, remove);

                expect(scenario.topics.value).toEqual(['Vitest']);
                expect(scenario.topics.dirty).toBe(true);
                expect(tags()).toEqual(['Vitest']);
                expect(select.getAttribute('aria-expanded')).toBe('false');
                expect(panel()).toBeNull();
                expect(scenario.topicsOpenedChanges()).toEqual([]);
                expect(text(byTestId(fixture, 'topics-summary'))).toBe('Vitest');
            });
        });
    });
}

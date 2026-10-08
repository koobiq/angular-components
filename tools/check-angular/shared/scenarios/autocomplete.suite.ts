import { ComponentFixture } from '@angular/core/testing';
import { dispatchKeyboardEvent, DOWN_ARROW, ENTER, ESCAPE, typeInElement, UP_ARROW } from '@koobiq/components/core';
import { CheckConfig } from '../config';
import { renderScenario } from '../testing';
import { AUTOCOMPLETE_COUNTRIES, AutocompleteScenario } from './autocomplete';

const KEYS: Record<number, string> = {
    [DOWN_ARROW]: 'ArrowDown',
    [UP_ARROW]: 'ArrowUp',
    [ENTER]: 'Enter',
    [ESCAPE]: 'Escape'
};

export function defineAutocompleteSuite(config: CheckConfig): void {
    describe(`autocomplete (${config.name})`, () => {
        let fixture: ComponentFixture<AutocompleteScenario>;
        let scenario: AutocompleteScenario;
        let input: HTMLInputElement;

        beforeEach(async () => {
            fixture = await renderScenario(AutocompleteScenario, config);
            scenario = fixture.componentInstance;
            input = fixture.nativeElement.querySelector('input');
        });

        /**
         * Lets the application settle on its own after an interaction. The trigger re-reads the options a `delay(0)`
         * after they change; what that changes is rendered by the configured change detection, never forced here.
         */
        async function settle(): Promise<void> {
            for (let pass = 0; pass < 3; pass++) {
                await fixture.whenStable();
                await new Promise((resolve) => setTimeout(resolve, 10));
            }

            await fixture.whenStable();
        }

        // Built natively, so the scenario does not depend on the helpers; the test below covers `dispatchKeyboardEvent`.
        async function press(keyCode: number): Promise<void> {
            input.dispatchEvent(
                new KeyboardEvent('keydown', { keyCode, key: KEYS[keyCode], bubbles: true, cancelable: true })
            );
            await settle();
        }

        async function type(text: string): Promise<void> {
            typeInElement(text, input);
            await settle();
        }

        async function focusField(): Promise<void> {
            input.focus();
            await settle();
        }

        const panel = (): HTMLElement | null => document.querySelector('.kbq-autocomplete-panel');
        const options = (): HTMLElement[] => Array.from(document.querySelectorAll<HTMLElement>('kbq-option'));
        const optionTexts = (): string[] => options().map((option) => option.textContent?.trim() ?? '');
        const activeOption = (): HTMLElement | undefined =>
            options().find((option) => option.id === input.getAttribute('aria-activedescendant'));

        function expectOpen(): void {
            const listbox = panel()?.querySelector('[role="listbox"]');

            expect(listbox).toBeTruthy();
            expect(panel()?.closest('.cdk-overlay-container .cdk-overlay-pane')).toBeTruthy();
            expect(input.getAttribute('role')).toBe('combobox');
            expect(input.getAttribute('aria-expanded')).toBe('true');
            expect(input.getAttribute('aria-controls')).toBe(listbox?.id);
        }

        function expectClosedAndDetached(): void {
            expect(input.getAttribute('aria-expanded')).toBe('false');
            expect(input.hasAttribute('aria-controls')).toBe(false);
            expect(input.hasAttribute('aria-activedescendant')).toBe(false);
            expect(panel()).toBeNull();
            expect(options()).toHaveLength(0);
            expect(document.querySelector('.cdk-overlay-container .cdk-overlay-pane')).toBeNull();
        }

        function expectActive(text: string): void {
            const active = options().filter((option) => option.classList.contains('kbq-active'));

            expect(active).toHaveLength(1);
            expect(active[0].textContent?.trim()).toBe(text);
            expect(activeOption()).toBe(active[0]);
        }

        it('opens on focus with every option, named after the field label', async () => {
            expect(panel()).toBeNull();
            expect(input.getAttribute('aria-expanded')).toBe('false');

            await focusField();

            expectOpen();
            expect(optionTexts()).toEqual(AUTOCOMPLETE_COUNTRIES);
            expectActive('Albania');

            const label: HTMLLabelElement = fixture.nativeElement.querySelector('label');

            expect(label.htmlFor).toBe(input.id);
            expect(panel()?.querySelector('[role="listbox"]')?.getAttribute('aria-labelledby')).toBe(label.id);
            expect(scenario.events()).toEqual(['opened']);
        });

        it('filters the options to what was typed', async () => {
            await type('an');

            expectOpen();
            expect(optionTexts()).toEqual(['Albania', 'Andorra', 'Angola']);
            expectActive('Albania');
            expect(scenario.country.value).toBe('an');
            expect(scenario.events()).toEqual(['opened']);

            await type('ang');

            expect(optionTexts()).toEqual(['Angola']);
            expectActive('Angola');
        });

        it('moves the active option with the arrow keys while focus stays in the field', async () => {
            await focusField();

            await press(DOWN_ARROW);
            expectActive('Algeria');

            await press(DOWN_ARROW);
            expectActive('Andorra');

            await press(UP_ARROW);
            expectActive('Algeria');

            expect(document.activeElement).toBe(input);
            expect(scenario.country.value).toBe('');
        });

        it('selects the active option with Enter: the control takes it and optionSelected fires', async () => {
            await type('an');
            await press(DOWN_ARROW);
            expectActive('Andorra');

            await press(ENTER);

            expect(scenario.country.value).toBe('Andorra');
            expect(scenario.country.dirty).toBe(true);
            expect(input.value).toBe('Andorra');
            expect(scenario.chosen()).toBe('Andorra');
            expect(fixture.nativeElement.querySelector('.check-autocomplete-chosen').textContent).toContain('Andorra');
            expect(scenario.events()).toEqual(['opened', 'selected Andorra', 'closed']);
            expect(document.activeElement).toBe(input);
            expectClosedAndDetached();
        });

        it('selects an option clicked with the mouse', async () => {
            await focusField();

            options()
                .find((option) => option.textContent?.trim() === 'Belgium')!
                .click();
            await settle();

            expect(scenario.country.value).toBe('Belgium');
            expect(input.value).toBe('Belgium');
            expect(scenario.chosen()).toBe('Belgium');
            expect(scenario.events()).toEqual(['opened', 'selected Belgium', 'closed']);
            expect(document.activeElement).toBe(input);
            expectClosedAndDetached();
        });

        it('closes on Escape, keeping what was typed, and detaches the panel', async () => {
            await type('an');
            await press(DOWN_ARROW);

            await press(ESCAPE);

            expectClosedAndDetached();
            expect(scenario.country.value).toBe('an');
            expect(input.value).toBe('an');
            expect(scenario.chosen()).toBeNull();
            expect(scenario.events()).toEqual(['opened', 'closed']);
            expect(document.activeElement).toBe(input);
        });

        it('closes on a click outside and detaches the panel', async () => {
            await focusField();
            expectOpen();

            const elsewhere: HTMLButtonElement = fixture.nativeElement.querySelector('.check-autocomplete-elsewhere');

            elsewhere.focus();
            elsewhere.click();
            await settle();

            expectClosedAndDetached();
            expect(scenario.country.value).toBe('');
            expect(scenario.country.touched).toBe(true);
            expect(scenario.events()).toEqual(['opened', 'closed']);
        });

        it('reopens on a click, ArrowDown or typing once closed in the focused field', async () => {
            await focusField();
            await press(ESCAPE);
            expectClosedAndDetached();

            input.click();
            await settle();
            expectOpen();
            expect(optionTexts()).toEqual(AUTOCOMPLETE_COUNTRIES);

            await press(ESCAPE);
            await press(DOWN_ARROW);
            expectOpen();
            expectActive('Albania');

            await press(ESCAPE);
            await type('b');
            expectOpen();
            expect(optionTexts()).toEqual(['Albania', 'Belgium', 'Brazil', 'Bulgaria']);

            expect(scenario.events()).toEqual(['opened', 'closed', 'opened', 'closed', 'opened', 'closed', 'opened']);
        });

        it('reopens with the options for the new text after a selection', async () => {
            await type('an');
            await press(ENTER);
            expect(scenario.country.value).toBe('Albania');
            expectClosedAndDetached();

            await type('ar');

            expectOpen();
            expect(optionTexts()).toEqual(['Argentina', 'Armenia', 'Bulgaria']);
            expectActive('Argentina');
            expect(scenario.country.value).toBe('ar');
            expect(scenario.events()).toEqual(['opened', 'selected Albania', 'closed', 'opened']);
        });

        // The public event helpers work in Vitest's jsdom environment, whose `window` is Node's global object.
        it('closes on Escape sent through the public dispatchKeyboardEvent helper', async () => {
            await focusField();

            dispatchKeyboardEvent(input, 'keydown', ESCAPE);
            await settle();

            expectClosedAndDetached();
        });
    });
}

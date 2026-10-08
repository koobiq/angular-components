import { ComponentFixture } from '@angular/core/testing';
import {
    DOWN_ARROW,
    END,
    ENTER,
    ESCAPE,
    HOME,
    LEFT_ARROW,
    RIGHT_ARROW,
    typeInElement,
    UP_ARROW
} from '@koobiq/components/core';
import { CheckConfig } from '../config';
import { renderScenario } from '../testing';
import { DropdownScenario } from './dropdown';
import { clickWithMouse, pressKey as press, pressEnterOnButton, stubElementScrollTo } from './dropdown.helpers';

const PANEL = '.kbq-dropdown__panel';
const ITEM = '.kbq-dropdown-item';

function getTrigger(fixture: ComponentFixture<DropdownScenario>): HTMLButtonElement {
    return fixture.nativeElement.querySelector('.check-dropdown__trigger');
}

function getPanels(): HTMLElement[] {
    return Array.from(document.querySelectorAll<HTMLElement>(PANEL));
}

function getItems(panel: Element): HTMLElement[] {
    return Array.from(panel.querySelectorAll<HTMLElement>(ITEM));
}

function getItem(label: string): HTMLElement {
    const item = Array.from(document.querySelectorAll<HTMLElement>(ITEM)).find(
        (element) => element.textContent?.trim() === label
    );

    if (!item) throw new Error(`No dropdown item "${label}" in the document`);

    return item;
}

function getFocusedLabel(): string | undefined {
    return document.activeElement?.textContent?.trim();
}

export function defineDropdownSuite(config: CheckConfig): void {
    describe(`dropdown (${config.name})`, () => {
        let fixture: ComponentFixture<DropdownScenario>;
        let trigger: HTMLButtonElement;

        async function openWithKeyboard(): Promise<void> {
            trigger.focus();
            press(DOWN_ARROW, trigger);
            await fixture.whenStable();
        }

        async function openWithMouse(): Promise<void> {
            clickWithMouse(trigger);
            await fixture.whenStable();
        }

        let restoreScrollTo: () => void;

        beforeAll(() => (restoreScrollTo = stubElementScrollTo()));
        afterAll(() => restoreScrollTo());

        beforeEach(async () => {
            fixture = await renderScenario(DropdownScenario, config);
            trigger = getTrigger(fixture);
        });

        it('renders nothing of the menu until it opens', () => {
            expect(getPanels().length).toBe(0);
            expect(document.querySelectorAll(ITEM).length).toBe(0);
            expect(trigger.getAttribute('aria-expanded')).toBe('false');
        });

        it('opens on a mouse click with the panel focused and no item highlighted', async () => {
            await openWithMouse();

            const [panel] = getPanels();

            expect(getPanels().length).toBe(1);
            expect(getItems(panel).map((item) => item.textContent?.trim())).toEqual([
                'Open report.pdf',
                'Rename',
                'Delete',
                'Export'
            ]);
            expect(trigger.getAttribute('aria-expanded')).toBe('true');
            expect(trigger.classList).toContain('kbq-pressed');
            expect(document.activeElement).toBe(panel);
            expect(panel.querySelectorAll(`${ITEM}.cdk-focused`).length).toBe(0);
        });

        it.each([
            ['ENTER', ENTER],
            ['DOWN_ARROW', DOWN_ARROW]
        ])('opens with %s on the focused trigger and focuses the first item', async (_, keyCode) => {
            trigger.focus();

            const keydown = press(keyCode, trigger);

            // A prevented ENTER is not turned into a click, which would toggle the menu shut again.
            expect(keydown.defaultPrevented).toBe(true);
            await fixture.whenStable();

            const [panel] = getPanels();
            const [first] = getItems(panel);

            expect(getPanels().length).toBe(1);
            expect(trigger.getAttribute('aria-expanded')).toBe('true');
            expect(document.activeElement).toBe(first);
            expect(first.classList).toContain('cdk-keyboard-focused');
        });

        it('moves the focus through the items with the arrow keys, HOME and END, skipping a disabled one', async () => {
            await openWithKeyboard();

            const moves: [number, string][] = [
                [DOWN_ARROW, 'Rename'],
                [DOWN_ARROW, 'Export'],
                [UP_ARROW, 'Rename'],
                [END, 'Export'],
                [HOME, 'Open report.pdf']
            ];

            for (const [keyCode, label] of moves) {
                press(keyCode);
                await fixture.whenStable();

                expect(getFocusedLabel()).toBe(label);
                expect(document.activeElement!.classList).toContain('cdk-keyboard-focused');
            }

            expect(getPanels().length).toBe(1);
        });

        it('opens the nested menu with RIGHT_ARROW and closes it with LEFT_ARROW', async () => {
            await openWithKeyboard();
            press(END);
            await fixture.whenStable();

            const exportItem = getItem('Export');

            expect(exportItem.getAttribute('aria-expanded')).toBe('false');

            press(RIGHT_ARROW, exportItem);
            await fixture.whenStable();

            const [, nested] = getPanels();

            expect(getPanels().length).toBe(2);
            expect(nested.classList).toContain('kbq-dropdown__panel_nested');
            expect(getItems(nested).map((item) => item.textContent?.trim())).toEqual(['PDF', 'CSV']);
            expect(document.activeElement).toBe(getItem('PDF'));
            expect(exportItem.getAttribute('aria-expanded')).toBe('true');

            press(DOWN_ARROW);
            await fixture.whenStable();

            expect(getFocusedLabel()).toBe('CSV');

            press(LEFT_ARROW);
            await fixture.whenStable();

            expect(getPanels().length).toBe(1);
            expect(nested.isConnected).toBe(false);
            expect(document.activeElement).toBe(exportItem);
            expect(exportItem.getAttribute('aria-expanded')).toBe('false');
            expect(trigger.getAttribute('aria-expanded')).toBe('true');
        });

        it('closes only the nested menu on ESCAPE inside it', async () => {
            await openWithKeyboard();
            press(END);
            await fixture.whenStable();
            press(RIGHT_ARROW);
            await fixture.whenStable();

            expect(getPanels().length).toBe(2);

            press(ESCAPE);
            await fixture.whenStable();

            expect(getPanels().length).toBe(1);
            expect(document.activeElement).toBe(getItem('Export'));
            expect(fixture.componentInstance.closeReasons()).toEqual([]);
        });

        it('runs the handler of a clicked item, closes the menu and returns the focus to the trigger', async () => {
            await openWithMouse();
            clickWithMouse(getItem('Rename'));
            await fixture.whenStable();

            expect(fixture.componentInstance.lastAction()).toBe('Rename');
            expect(fixture.nativeElement.querySelector('.check-dropdown__last-action').textContent.trim()).toBe(
                'Rename'
            );
            expect(getPanels().length).toBe(0);
            expect(document.activeElement).toBe(trigger);
            expect(trigger.getAttribute('aria-expanded')).toBe('false');
            expect(trigger.classList).not.toContain('kbq-pressed');
        });

        it('ignores a click on a disabled item', async () => {
            await openWithMouse();
            clickWithMouse(getItem('Delete'));
            await fixture.whenStable();

            expect(fixture.componentInstance.lastAction()).toBe('');
            expect(getPanels().length).toBe(1);
        });

        it('activates an item with ENTER, closes the menu and returns the focus to the trigger', async () => {
            await openWithKeyboard();
            press(DOWN_ARROW);
            await fixture.whenStable();
            pressEnterOnButton();
            await fixture.whenStable();

            expect(fixture.componentInstance.lastAction()).toBe('Rename');
            expect(getPanels().length).toBe(0);
            expect(document.activeElement).toBe(trigger);
            expect(trigger.classList).toContain('cdk-keyboard-focused');
        });

        it('closes both menus when an item of the nested menu is clicked', async () => {
            await openWithMouse();
            clickWithMouse(getItem('Export'));
            await fixture.whenStable();

            expect(getPanels().length).toBe(2);

            clickWithMouse(getItem('PDF'));
            await fixture.whenStable();

            expect(fixture.componentInstance.lastAction()).toBe('Export as PDF');
            expect(getPanels().length).toBe(0);
            expect(fixture.componentInstance.closeReasons()).toEqual(['click']);
            expect(document.activeElement).toBe(trigger);
        });

        it('closes both menus when an item of the nested menu is activated with ENTER', async () => {
            await openWithKeyboard();
            press(END);
            await fixture.whenStable();
            press(RIGHT_ARROW);
            await fixture.whenStable();
            press(DOWN_ARROW);
            await fixture.whenStable();
            pressEnterOnButton();
            await fixture.whenStable();

            expect(fixture.componentInstance.lastAction()).toBe('Export as CSV');
            expect(getPanels().length).toBe(0);
            expect(fixture.componentInstance.closeReasons()).toEqual(['keydown']);
            expect(document.activeElement).toBe(trigger);
            expect(trigger.classList).toContain('cdk-keyboard-focused');
        });

        it('closes on ESCAPE and returns the focus to the trigger', async () => {
            await openWithKeyboard();
            press(DOWN_ARROW);
            await fixture.whenStable();

            const pageKeydown = vi.fn();

            document.addEventListener('keydown', pageKeydown);
            press(ESCAPE);
            document.removeEventListener('keydown', pageKeydown);
            await fixture.whenStable();

            expect(getPanels().length).toBe(0);
            expect(document.activeElement).toBe(trigger);
            expect(trigger.getAttribute('aria-expanded')).toBe('false');
            expect(trigger.classList).toContain('cdk-keyboard-focused');
            // Handled by the panel, so a page-level ESCAPE handler (closing a modal, say) does not see it.
            expect(pageKeydown).not.toHaveBeenCalled();
        });

        it('closes on an outside click and leaves the focus where the click put it', async () => {
            const fileName: HTMLInputElement = fixture.nativeElement.querySelector('.check-dropdown__file-name');

            await openWithMouse();
            clickWithMouse(fileName);
            await fixture.whenStable();

            expect(getPanels().length).toBe(0);
            expect(document.activeElement).toBe(fileName);
            expect(trigger.getAttribute('aria-expanded')).toBe('false');
        });

        it('toggles closed on a second click on the trigger', async () => {
            await openWithMouse();
            clickWithMouse(trigger);
            await fixture.whenStable();

            expect(getPanels().length).toBe(0);
            expect(document.activeElement).toBe(trigger);
        });

        it('emits dropdownOpened and dropdownClosed, and closed with the reason', async () => {
            const scenario = fixture.componentInstance;

            await openWithMouse();

            expect(scenario.openedChanges()).toEqual([true]);
            expect(scenario.closeReasons()).toEqual([]);

            clickWithMouse(getItem('Rename'));
            await fixture.whenStable();

            expect(scenario.openedChanges()).toEqual([true, false]);
            expect(scenario.closeReasons()).toEqual(['click']);

            await openWithKeyboard();
            press(ESCAPE);
            await fixture.whenStable();

            expect(scenario.openedChanges()).toEqual([true, false, true, false]);
            expect(scenario.closeReasons()).toEqual(['click', 'keydown']);

            await openWithMouse();
            clickWithMouse(fixture.nativeElement.querySelector('.check-dropdown__file-name'));
            await fixture.whenStable();

            expect(scenario.openedChanges()).toEqual([true, false, true, false, true, false]);
            expect(scenario.closeReasons()).toEqual(['click', 'keydown', undefined]);
        });

        it('detaches the panel and the lazy content after closing, and renders the content again with new data', async () => {
            await openWithMouse();

            const [panel] = getPanels();
            const rename = getItem('Rename');

            press(ESCAPE, panel);
            await fixture.whenStable();

            expect(panel.isConnected).toBe(false);
            expect(rename.isConnected).toBe(false);
            expect(document.querySelectorAll(ITEM).length).toBe(0);
            expect(document.querySelectorAll('.cdk-overlay-pane').length).toBe(0);

            typeInElement('notes.txt', fixture.nativeElement.querySelector('.check-dropdown__file-name'));
            await fixture.whenStable();
            await openWithMouse();

            expect(getItems(getPanels()[0]).map((item) => item.textContent?.trim())).toEqual([
                'Open notes.txt',
                'Rename',
                'Delete',
                'Export'
            ]);

            clickWithMouse(getItem('Open notes.txt'));
            await fixture.whenStable();

            expect(fixture.componentInstance.lastAction()).toBe('Open notes.txt');
        });
    });
}

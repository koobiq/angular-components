import { ComponentFixture } from '@angular/core/testing';
import { CheckConfig } from '../config';
import { renderScenario } from '../testing';
import {
    byTestId,
    click,
    failOnConsole,
    focus,
    focusedElement,
    itFailsIn,
    Key,
    overlayContainer,
    press,
    settle,
    stubElementScrollTo,
    text
} from './select.helpers';
import { TreeSelectInitialDataScenario, TreeSelectScenario } from './tree-select';

export function defineTreeSelectSuite(config: CheckConfig): void {
    describe(`tree-select (${config.name})`, () => {
        stubElementScrollTo();
        failOnConsole();

        describe('with its data assigned to the data source', () => {
            let fixture: ComponentFixture<TreeSelectScenario>;
            let scenario: TreeSelectScenario;
            let select: HTMLElement;

            const panel = () => document.querySelector<HTMLElement>('.kbq-tree-select__panel');
            const tree = () => panel()?.querySelector<HTMLElement>('[role="tree"]') ?? null;
            const nodes = () =>
                Array.from(document.querySelectorAll<HTMLElement>('.kbq-tree-select__panel kbq-tree-option'));
            const node = (label: string) => nodes().find((element) => text(element) === label)!;
            const trigger = () => select.querySelector<HTMLElement>('.kbq-select__trigger')!;
            const triggerText = () => text(select.querySelector('.kbq-select__matcher-text'));

            beforeEach(async () => {
                fixture = await renderScenario(TreeSelectScenario, config);
                scenario = fixture.componentInstance;
                select = byTestId(fixture, 'file');
            });

            it('renders a closed combobox', () => {
                expect(select.getAttribute('role')).toBe('combobox');
                expect(select.getAttribute('aria-expanded')).toBe('false');
                expect(select.hasAttribute('aria-controls')).toBe(false);
                expect(select.tabIndex).toBe(0);
                expect(text(select.querySelector('.kbq-select__placeholder'))).toBe('Choose a file');
                expect(panel()).toBeNull();
                expect(text(byTestId(fixture, 'file-summary'))).toBe('closed: none');
            });

            // Library bug: `KbqTreeSelect` binds `aria-labelledby` from its own input only and never reads the form
            // field's `labelId()` the way `KbqSelect` does, so `kbq-label` does not name it and the placeholder becomes
            // its `aria-label`.
            itFailsIn(config, ['zoneless', 'zone', 'zone-animations'])(
                'is named by the form field label, as the select is',
                () => {
                    expect(text(document.getElementById(select.getAttribute('aria-labelledby') ?? ''))).toBe('File');
                }
            );

            it('opens on click, emits openedChange and moves focus to the first node', async () => {
                await click(fixture, trigger());

                expect(select.getAttribute('aria-expanded')).toBe('true');
                expect(overlayContainer()?.contains(tree())).toBe(true);
                expect(select.getAttribute('aria-controls')).toBe(panel()!.id);
                expect(nodes().map(text)).toEqual(['Documents', 'Pictures', 'Readme']);
                expect(nodes().map((element) => element.getAttribute('role'))).toEqual([
                    'treeitem',
                    'treeitem',
                    'treeitem'
                ]);
                expect(nodes().map((element) => element.getAttribute('aria-level'))).toEqual(['1', '1', '1']);
                expect(nodes().map((element) => element.getAttribute('aria-expanded'))).toEqual([
                    'false',
                    'false',
                    null
                ]);
                expect(focusedElement()).toBe(node('Documents'));
                expect(scenario.openedChanges()).toEqual([true]);
                expect(text(byTestId(fixture, 'file-summary'))).toBe('open: none');
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
                expect(focusedElement()).toBe(node('Documents'));
                expect(scenario.openedChanges()).toEqual([true]);
                expect(scenario.file.value).toBeNull();
            });

            it('expands and collapses a node with the arrows and with its toggle, without selecting it', async () => {
                await focus(fixture, select);
                await press(fixture, 'Enter');
                await press(fixture, 'ArrowRight');

                expect(node('Documents').getAttribute('aria-expanded')).toBe('true');
                expect(nodes().map(text)).toEqual(['Documents', 'Invoice', 'Report', 'Pictures', 'Readme']);
                expect(node('Invoice').getAttribute('aria-level')).toBe('2');
                expect(focusedElement()).toBe(node('Documents'));

                await click(fixture, node('Pictures').querySelector('kbq-tree-node-toggle')!);

                expect(node('Pictures').getAttribute('aria-expanded')).toBe('true');
                expect(nodes().map(text)).toEqual([
                    'Documents',
                    'Invoice',
                    'Report',
                    'Pictures',
                    'Cat',
                    'Dog',
                    'Readme'
                ]);

                await press(fixture, 'ArrowLeft');

                expect(node('Documents').getAttribute('aria-expanded')).toBe('false');
                expect(nodes().map(text)).toEqual(['Documents', 'Pictures', 'Cat', 'Dog', 'Readme']);
                expect(select.getAttribute('aria-expanded')).toBe('true');
                expect(scenario.file.value).toBeNull();
                expect(scenario.openedChanges()).toEqual([true]);
            });

            it('selects a leaf with the arrows, closes on Enter and gives focus back', async () => {
                await focus(fixture, select);
                await press(fixture, 'Enter');
                await press(fixture, 'ArrowRight');
                await press(fixture, 'ArrowDown');

                expect(focusedElement()).toBe(node('Invoice'));
                // `autoSelect` is on by default for a single tree-select: the focused node is the value.
                expect(scenario.file.value).toBe('invoice');
                expect(node('Invoice').getAttribute('aria-selected')).toBe('true');

                await press(fixture, 'Enter');

                expect(select.getAttribute('aria-expanded')).toBe('false');
                expect(panel()).toBeNull();
                expect(focusedElement()).toBe(select);
                expect(scenario.file.value).toBe('invoice');
                expect(triggerText()).toBe('Invoice');
                expect(scenario.openedChanges()).toEqual([true, false]);
                expect(text(byTestId(fixture, 'file-summary'))).toBe('closed: invoice');
            });

            it('selects a leaf with a click, closes and gives focus back', async () => {
                await click(fixture, trigger());
                await click(fixture, node('Documents').querySelector('kbq-tree-node-toggle')!);

                const openPanel = panel()!;

                await click(fixture, node('Report'));

                expect(scenario.file.value).toBe('report');
                expect(scenario.file.dirty).toBe(true);
                expect(scenario.file.touched).toBe(true);
                expect(select.getAttribute('aria-expanded')).toBe('false');
                expect(openPanel.isConnected).toBe(false);
                expect(focusedElement()).toBe(select);
                expect(triggerText()).toBe('Report');
                expect(scenario.openedChanges()).toEqual([true, false]);
                expect(text(byTestId(fixture, 'file-summary'))).toBe('closed: report');
            });

            it.each<[string, Key, { altKey?: boolean }]>([
                ['Escape', 'Escape', {}],
                ['Tab', 'Tab', {}],
                ['Alt+ArrowUp', 'ArrowUp', { altKey: true }]
            ])('closes on %s, keeps the value, gives focus back and detaches the panel', async (_, key, modifiers) => {
                await click(fixture, trigger());
                const openPanel = panel()!;

                expect(openPanel.isConnected).toBe(true);

                await press(fixture, key, modifiers);

                expect(select.getAttribute('aria-expanded')).toBe('false');
                expect(select.hasAttribute('aria-controls')).toBe(false);
                expect(openPanel.isConnected).toBe(false);
                expect(overlayContainer()?.querySelector('[role="tree"]') ?? null).toBeNull();
                expect(focusedElement()).toBe(select);
                expect(scenario.file.value).toBeNull();
                expect(scenario.openedChanges()).toEqual([true, false]);
                expect(text(byTestId(fixture, 'file-summary'))).toBe('closed: none');
            });

            it('closes on a click outside and detaches the panel', async () => {
                await click(fixture, trigger());
                const openPanel = panel()!;

                await click(fixture, document.body);

                expect(select.getAttribute('aria-expanded')).toBe('false');
                expect(openPanel.isConnected).toBe(false);
                expect(scenario.file.value).toBeNull();
                expect(scenario.openedChanges()).toEqual([true, false]);
            });

            it('is not touched while focus moves into the panel, and is once the panel closes', async () => {
                await focus(fixture, select);
                await press(fixture, 'Enter');

                expect(focusedElement()).toBe(node('Documents'));
                expect(scenario.file.touched).toBe(false);

                await press(fixture, 'Escape');

                expect(scenario.file.touched).toBe(true);
                expect(scenario.file.dirty).toBe(false);
            });

            // Library bug: `KbqTreeSelect` passes every `selectionModel.changed` to the forms `onChange`, including the
            // change `writeValue` makes through `setSelectionByValue`, so a value the control writes comes back as a
            // change from the view and marks the control dirty. `KbqSelect` keeps it pristine.
            itFailsIn(config, ['zoneless', 'zone', 'zone-animations'])(
                'keeps the form control pristine when the control writes a value',
                async () => {
                    scenario.file.setValue('readme');
                    await settle(fixture);

                    expect(scenario.file.value).toBe('readme');
                    expect(scenario.file.pristine).toBe(true);
                }
            );

            it('shows a value written to the form control and opens on it', async () => {
                scenario.file.setValue('readme');
                await settle(fixture);

                expect(triggerText()).toBe('Readme');
                expect(text(byTestId(fixture, 'file-summary'))).toBe('closed: readme');

                await click(fixture, trigger());

                expect(node('Readme').getAttribute('aria-selected')).toBe('true');
                expect(node('Readme').classList).toContain('kbq-selected');
                expect(focusedElement()).toBe(node('Readme'));
            });

            it('shows a value written to the form control from inside a collapsed node', async () => {
                scenario.file.setValue('dog');
                await settle(fixture);

                expect(triggerText()).toBe('Dog');
                expect(select.querySelector('.kbq-select__placeholder')).toBeNull();
            });
        });

        describe('with its data handed to the data source constructor', () => {
            it('opens on the nodes of the initial data', async () => {
                const fixture = await renderScenario(TreeSelectInitialDataScenario, config);
                const select = byTestId(fixture, 'file');

                await click(fixture, select.querySelector('.kbq-select__trigger')!);

                expect(select.getAttribute('aria-expanded')).toBe('true');
                expect(
                    Array.from(document.querySelectorAll('.kbq-tree-select__panel kbq-tree-option')).map(text)
                ).toEqual(['Documents', 'Pictures', 'Readme']);
            });
        });
    });
}

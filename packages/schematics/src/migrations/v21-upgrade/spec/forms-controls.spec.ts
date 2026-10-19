import { runV21Upgrade } from '../testing';

const CVA_MEMBERS = 'KbqCheckbox and KbqToggleComponent no longer implement ControlValueAccessor';
const ON_TOUCHED = 'KbqCheckbox.onTouched was removed';
const TRANSITION_STATE = 'TransitionCheckState is no longer exported from @koobiq/components/checkbox';
const LABEL_TEXT_CHANGE = 'KbqToggleComponent.onLabelTextChange() does nothing now';
const CHECK_STATE = 'KbqToggleComponent.currentCheckState is a Signal<TransitionCheckState> now';

describe('v21-upgrade: forms-controls', () => {
    it('reports writeValue() called on a KbqCheckbox query', async () => {
        const source = [
            "import { KbqCheckbox } from '@koobiq/components/checkbox';",
            'export class App {',
            '    readonly checkbox = viewChild.required(KbqCheckbox);',
            '    check() { this.checkbox().writeValue(true); }',
            '}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'checkbox-write-value.ts': source });

        expect(run.read('checkbox-write-value.ts')).toBe(source);
        expect(run.log).toContain(`checkbox-write-value.ts\n  ${CVA_MEMBERS}`);
    });

    it('reports registerOnChange() called on a KbqToggleComponent', async () => {
        const source = [
            "import { KbqToggleComponent } from '@koobiq/components/toggle';",
            'export function listen(toggle: KbqToggleComponent, fn: (value: boolean) => void) {',
            '    toggle?.registerOnChange(fn);',
            '}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'toggle-register-on-change.ts': source });

        expect(run.read('toggle-register-on-change.ts')).toBe(source);
        expect(run.log).toContain(`toggle-register-on-change.ts\n  ${CVA_MEMBERS}`);
    });

    it('reports setDisabledState() called through a template reference', async () => {
        const template = [
            '<kbq-toggle #toggle>Toggle</kbq-toggle>',
            '<button (click)="toggle.setDisabledState(true)">Disable</button>',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'toggle-disable.html': template });

        expect(run.read('toggle-disable.html')).toBe(template);
        expect(run.log).toContain(`toggle-disable.html\n  ${CVA_MEMBERS}`);
    });

    it('reports registerOnTouched() called through super in a KbqCheckbox subclass', async () => {
        const source = [
            "import { KbqCheckbox } from '@koobiq/components/checkbox';",
            'export class CustomCheckbox extends KbqCheckbox {',
            '    override registerOnTouched(fn: () => void) { super.registerOnTouched(fn); }',
            '}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'checkbox-subclass.ts': source });

        expect(run.read('checkbox-subclass.ts')).toBe(source);
        expect(run.log).toContain(`checkbox-subclass.ts\n  ${CVA_MEMBERS}`);
    });

    it('reports onTouched called on a KbqCheckbox', async () => {
        const source = [
            "import { KbqCheckbox } from '@koobiq/components/checkbox';",
            'export class App {',
            '    @ViewChild(KbqCheckbox) checkbox: KbqCheckbox;',
            '    blur() { this.checkbox.onTouched(); }',
            '}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'checkbox-on-touched.ts': source });

        expect(run.read('checkbox-on-touched.ts')).toBe(source);
        expect(run.log).toContain(`checkbox-on-touched.ts\n  ${ON_TOUCHED}`);
        expect(run.log).not.toContain(`checkbox-on-touched.ts\n  ${CVA_MEMBERS}`);
    });

    it('reports a provider of KBQ_CHECKBOX_CONTROL_VALUE_ACCESSOR', async () => {
        const source = [
            "import { KBQ_CHECKBOX_CONTROL_VALUE_ACCESSOR } from '@koobiq/components/checkbox';",
            'export const providers = [KBQ_CHECKBOX_CONTROL_VALUE_ACCESSOR];',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'checkbox-accessor.ts': source });

        expect(run.read('checkbox-accessor.ts')).toBe(source);
        expect(run.log).toContain('checkbox-accessor.ts\n  KBQ_CHECKBOX_CONTROL_VALUE_ACCESSOR was removed');
    });

    it('reports onLabelTextChange() called on a toggle', async () => {
        const source = [
            "import { KbqToggleComponent } from '@koobiq/components/toggle';",
            'export class App {',
            '    readonly toggle = viewChild.required(KbqToggleComponent);',
            '    rename() { this.toggle().onLabelTextChange(); }',
            '}',
            ''
        ].join('\n');
        const template = [
            '<kbq-toggle #toggle="kbqToggle">{{ label }}</kbq-toggle>',
            '<button (click)="toggle.onLabelTextChange()">Rename</button>',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'toggle-label.ts': source, 'toggle-label.html': template });

        expect(run.read('toggle-label.ts')).toBe(source);
        expect(run.read('toggle-label.html')).toBe(template);
        expect(run.log).toContain(`toggle-label.ts\n  ${LABEL_TEXT_CHANGE}`);
        expect(run.log).toContain(`toggle-label.html\n  ${LABEL_TEXT_CHANGE}`);
    });

    it('reports currentCheckState read as a value in a toggle subclass', async () => {
        const source = [
            "import { KbqToggleComponent } from '@koobiq/components/toggle';",
            'export class Toggle extends KbqToggleComponent {',
            '    get circleClass() { return `circle_${this.currentCheckState}`; }',
            '}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'toggle-state.ts': source });

        expect(run.read('toggle-state.ts')).toBe(source);
        expect(run.log).toContain(`toggle-state.ts\n  ${CHECK_STATE}`);
    });

    it('leaves a migrated currentCheckState() and one outside a toggle subclass alone', async () => {
        const run = await runV21Upgrade({
            'migrated.ts': [
                "import { KbqToggleComponent } from '@koobiq/components/toggle';",
                'export class Toggle extends KbqToggleComponent {',
                '    get circleClass() { return `circle_${this.currentCheckState()}`; }',
                '}',
                ''
            ].join('\n'),
            'checkbox.ts': [
                "import { KbqCheckbox } from '@koobiq/components/checkbox';",
                'export class Checkbox extends KbqCheckbox {',
                '    get state() { return this.currentCheckState; }',
                '}',
                ''
            ].join('\n')
        });

        expect(run.log).not.toContain(CHECK_STATE);
    });

    it('leaves an onLabelTextChange() of your own alone', async () => {
        const own = [
            '@Component({',
            '    template: `<kbq-toggle><span (cdkObserveContent)="onLabelTextChange()">{{ label }}</span></kbq-toggle>`',
            '})',
            'export class Labelled {',
            '    onLabelTextChange() {}',
            '    refresh() { this.onLabelTextChange(); }',
            '}',
            ''
        ].join('\n');
        const unrelated =
            'export const refresh = (field: { onLabelTextChange(): void }) => field.onLabelTextChange();\n';
        const run = await runV21Upgrade({ 'labelled.ts': own, 'field.ts': unrelated });

        expect(run.log).not.toContain(LABEL_TEXT_CHANGE);
    });

    it('removes the TransitionCheckState specifier with its type modifier from any place in its clause', async () => {
        const from = " from '@koobiq/components/checkbox';\n";
        const cases: [string, string][] = [
            ['import { type TransitionCheckState, KbqCheckbox }', 'import { KbqCheckbox }'],
            [
                'import { KbqCheckbox, type TransitionCheckState, KbqCheckboxModule }',
                'import { KbqCheckbox, KbqCheckboxModule }'
            ],
            ['import { KbqCheckbox, type TransitionCheckState }', 'import { KbqCheckbox }'],
            ['import type { TransitionCheckState, KbqCheckboxChange }', 'import type { KbqCheckboxChange }'],
            ['import type { KbqCheckboxChange, TransitionCheckState }', 'import type { KbqCheckboxChange }']
        ];
        const files = Object.fromEntries(
            cases.map(([clause], i) => [`clause-${i}.ts`, `${clause}${from}export let state: TransitionCheckState;\n`])
        );
        const run = await runV21Upgrade({
            ...files,
            'only.ts': `import { type TransitionCheckState }${from}export let state: TransitionCheckState;\n`
        });
        const core = "import { TransitionCheckState } from '@koobiq/components/core';\n";

        cases.forEach(([, clause], i) =>
            expect(run.read(`clause-${i}.ts`)).toBe(`${core}${clause}${from}export let state: TransitionCheckState;\n`)
        );
        expect(run.read('only.ts')).toBe(`${core}export let state: TransitionCheckState;\n`);
    });

    it('moves the TransitionCheckState import from the checkbox entry point to core', async () => {
        const run = await runV21Upgrade({
            'only.ts': [
                "import { Component } from '@angular/core';",
                "import { TransitionCheckState } from '@koobiq/components/checkbox';",
                'export const state = TransitionCheckState.Checked;',
                ''
            ].join('\n'),
            'with-core.ts': [
                "import { KbqCheckbox, TransitionCheckState } from '@koobiq/components/checkbox';",
                "import { KbqCheckedState } from '@koobiq/components/core';",
                'export const used = [KbqCheckbox, TransitionCheckState.Init];',
                ''
            ].join('\n'),
            'multiline.ts': [
                'import {',
                '    TransitionCheckState,',
                '    KbqCheckboxModule',
                "} from '@koobiq/components/checkbox';",
                'export const used = [KbqCheckboxModule, TransitionCheckState.Indeterminate];',
                ''
            ].join('\n'),
            'type-only.ts': [
                "import type { TransitionCheckState } from '@koobiq/components/checkbox';",
                'export let state: TransitionCheckState;',
                ''
            ].join('\n')
        });

        expect(run.read('only.ts')).toBe(
            [
                "import { TransitionCheckState } from '@koobiq/components/core';",
                "import { Component } from '@angular/core';",
                'export const state = TransitionCheckState.Checked;',
                ''
            ].join('\n')
        );
        expect(run.read('with-core.ts')).toBe(
            [
                "import { KbqCheckbox } from '@koobiq/components/checkbox';",
                "import { KbqCheckedState, TransitionCheckState } from '@koobiq/components/core';",
                'export const used = [KbqCheckbox, TransitionCheckState.Init];',
                ''
            ].join('\n')
        );
        expect(run.read('multiline.ts')).toBe(
            [
                "import { TransitionCheckState } from '@koobiq/components/core';",
                'import {',
                '    KbqCheckboxModule',
                "} from '@koobiq/components/checkbox';",
                'export const used = [KbqCheckboxModule, TransitionCheckState.Indeterminate];',
                ''
            ].join('\n')
        );
        expect(run.read('type-only.ts')).toBe(
            [
                "import { TransitionCheckState } from '@koobiq/components/core';",
                'export let state: TransitionCheckState;',
                ''
            ].join('\n')
        );
        expect(run.log).not.toContain(TRANSITION_STATE);
    });

    it('reports an aliased import, a re-export and a namespace read of TransitionCheckState', async () => {
        const aliased = [
            "import { TransitionCheckState as CheckState } from '@koobiq/components/checkbox';",
            'export const state = CheckState.Checked;',
            ''
        ].join('\n');
        const reExport = "export { KbqCheckbox, TransitionCheckState } from '@koobiq/components/checkbox';\n";
        const namespace = [
            "import * as checkbox from '@koobiq/components/checkbox';",
            'export const state = checkbox.TransitionCheckState.Checked;',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'aliased.ts': aliased, 're-export.ts': reExport, 'namespace.ts': namespace });

        expect(run.read('aliased.ts')).toBe(aliased);
        expect(run.read('re-export.ts')).toBe(reExport);
        expect(run.read('namespace.ts')).toBe(namespace);
        expect(run.log).toContain(`aliased.ts\n  ${TRANSITION_STATE}`);
        expect(run.log).toContain(`re-export.ts\n  ${TRANSITION_STATE}`);
        expect(run.log).toContain(`namespace.ts\n  ${TRANSITION_STATE}`);
    });

    it('leaves TransitionCheckState imported from core or from the app alone', async () => {
        const fromCore = [
            "import { KbqCheckbox } from '@koobiq/components/checkbox';",
            "import { TransitionCheckState as State } from '@koobiq/components/core';",
            'export const used = [KbqCheckbox, State.Checked];',
            ''
        ].join('\n');
        const own = [
            "import * as checkbox from '@koobiq/components/checkbox';",
            "import { TransitionCheckState } from './transition-check-state';",
            'export const used = [checkbox.KbqCheckbox, TransitionCheckState.Checked];',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'from-core.ts': fromCore, 'own.ts': own });

        expect(run.read('from-core.ts')).toBe(fromCore);
        expect(run.read('own.ts')).toBe(own);
        expect(run.log).not.toContain(TRANSITION_STATE);
    });

    it('leaves a custom ControlValueAccessor wrapping a checkbox and the members of other classes alone', async () => {
        const wrapper = [
            "import { ControlValueAccessor } from '@angular/forms';",
            "import { KbqCheckbox } from '@koobiq/components/checkbox';",
            '@Component({',
            '    imports: [KbqCheckbox],',
            '    template: `<kbq-checkbox [checked]="value" (change)="onChange($event.checked)" (blur)="onTouched()" />`',
            '})',
            'export class Consent implements ControlValueAccessor {',
            '    value = false;',
            '    onChange = (value: boolean) => {};',
            '    onTouched = () => {};',
            '    writeValue(value: boolean) { this.value = value; }',
            '    registerOnChange(fn: (value: boolean) => void) { this.onChange = fn; }',
            '    registerOnTouched(fn: () => void) { this.onTouched = fn; }',
            '    setDisabledState(isDisabled: boolean) {}',
            '    reset() { this.writeValue(false); this.onTouched(); }',
            '}',
            ''
        ].join('\n');
        const unrelated = [
            "import { DefaultValueAccessor } from '@angular/forms';",
            'export function reset(accessor: DefaultValueAccessor, onTouched: () => void) {',
            "    accessor.writeValue('');",
            '    accessor.registerOnTouched(onTouched);',
            '    accessor.onTouched();',
            '}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'consent.ts': wrapper, 'accessor.ts': unrelated });

        expect(run.read('consent.ts')).toBe(wrapper);
        expect(run.read('accessor.ts')).toBe(unrelated);
        expect(run.log).not.toContain(CVA_MEMBERS);
        expect(run.log).not.toContain(ON_TOUCHED);
    });
});

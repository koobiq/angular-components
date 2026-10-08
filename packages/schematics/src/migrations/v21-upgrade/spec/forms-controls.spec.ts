import { runV21Upgrade } from '../testing';

const CVA_MEMBERS = 'KbqCheckbox and KbqToggleComponent no longer implement ControlValueAccessor';
const ON_TOUCHED = 'KbqCheckbox.onTouched was removed';

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

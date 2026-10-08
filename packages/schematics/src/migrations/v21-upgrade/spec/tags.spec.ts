import { runV21Upgrade } from '../testing';

const NG_CONTROL = '`KbqTagInput.ngControl` was removed';
const TRIGGER_VALIDATION = '`KbqTagInput.triggerValidation()` was removed';
const SUBCLASS = '`KbqTagInput` no longer declares `ngControl` and `triggerValidation()`';

describe('v21-upgrade: tags', () => {
    it('reports ngControl read off a KbqTagInput query', async () => {
        const source = [
            "import { KbqTagInput } from '@koobiq/components/tags';",
            'export class App {',
            '    readonly tagInput = viewChild.required(KbqTagInput);',
            '    get invalid() { return this.tagInput().ngControl?.invalid; }',
            '}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'ng-control.ts': source });

        expect(run.read('ng-control.ts')).toBe(source);
        expect(run.log).toContain(NG_CONTROL);
    });

    it('reports ngControl read through the exportAs template reference', async () => {
        const template = [
            '<kbq-tag-list #tagList>',
            '    <input #tagInput="kbqTagInput" [kbqTagInputFor]="tagList" />',
            '    @if (tagInput.ngControl?.invalid) { <span>invalid</span> }',
            '</kbq-tag-list>',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'ng-control.html': template });

        expect(run.read('ng-control.html')).toBe(template);
        expect(run.log).toContain(NG_CONTROL);
    });

    it('reports a triggerValidation() call', async () => {
        const source = [
            "import { KbqTagInput } from '@koobiq/components/tags';",
            'export function revalidate(input: KbqTagInput) {',
            '    input.triggerValidation();',
            '}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'trigger-validation.ts': source });

        expect(run.read('trigger-validation.ts')).toBe(source);
        expect(run.log).toContain(TRIGGER_VALIDATION);
    });

    it('reports a subclass that overrides triggerValidation()', async () => {
        const source = [
            "import { KbqTagInput } from '@koobiq/components/tags';",
            'export class CustomTagInput extends KbqTagInput {',
            '    override triggerValidation(): void {}',
            '}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'subclass.ts': source });

        expect(run.read('subclass.ts')).toBe(source);
        expect(run.log).toContain(SUBCLASS);
    });

    it("leaves a component's own control, the tag list control and files without KbqTagInput alone", async () => {
        const wrapper = [
            "import { NgControl } from '@angular/forms';",
            "import { KbqTagInput, KbqTagList } from '@koobiq/components/tags';",
            'export class TagsField {',
            '    readonly ngControl = inject(NgControl, { self: true });',
            '    readonly tagList = viewChild.required(KbqTagList);',
            '    readonly tagInput = viewChild.required(KbqTagInput);',
            '    constructor() { this.ngControl.valueAccessor = this; }',
            '    get listInvalid() { return this.tagList().ngControl?.invalid; }',
            '    triggerValidation() {}',
            '    blur() { this.triggerValidation(); }',
            '}',
            ''
        ].join('\n');
        const unrelated = [
            'interface Validated { ngControl: unknown; triggerValidation(): void }',
            'export function check(input: Validated) {',
            '    input.triggerValidation();',
            '    return input.ngControl;',
            '}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'wrapper.ts': wrapper, 'unrelated.ts': unrelated });

        expect(run.read('wrapper.ts')).toBe(wrapper);
        expect(run.read('unrelated.ts')).toBe(unrelated);
        expect(run.log).not.toContain(NG_CONTROL);
        expect(run.log).not.toContain(TRIGGER_VALIDATION);
        expect(run.log).not.toContain(SUBCLASS);
    });
});

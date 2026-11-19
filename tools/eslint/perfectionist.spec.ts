import { ESLint, type Linter } from 'eslint';
import tseslint from 'typescript-eslint';
import { perfectionistConfig } from './perfectionist';

const overrideConfig: Linter.Config[] = [{ languageOptions: { parser: tseslint.parser } }, ...perfectionistConfig];
const eslint = new ESLint({ overrideConfigFile: true, overrideConfig, fix: true });
const filePath = 'packages/components/probe/probe.ts';

/** The members of a class after the fix, an empty line as `''`. */
const fix = async (members: string[]): Promise<string[]> => {
    const code = ['export class Probe {', ...members.map((member) => (member ? `    ${member}` : '')), '}', ''].join(
        '\n'
    );
    const [result] = await eslint.lintText(code, { filePath });

    return (result!.output ?? code)
        .split('\n')
        .slice(1, -2)
        .map((line) => line.trim());
};

/** The code after the fix. */
const fixCode = async (code: string): Promise<string> => {
    const [result] = await eslint.lintText(code, { filePath });

    return result!.output ?? code;
};

describe('perfectionistConfig', () => {
    it('sorts what has no order of its own', async () => {
        expect(await fixCode("export const a = (x: string) => ['b', 'a'].includes(x);\n")).toBe(
            "export const a = (x: string) => ['a', 'b'].includes(x);\n"
        );
    });

    it('keeps the order of objects, types, enums, imports, heritage clauses and the cases of a switch', async () => {
        const code = [
            'export class A implements OnInit, AfterViewInit {}',
            "import { b, a } from './b';",
            'export const o = { b, a };',
            "export type U = 'before' | 'after';",
            'export type I = { b: 1 } & { a: 1 };',
            'export interface T { b: 1; a: 1 }',
            "export enum E { B = 'b', A = 'a' }",
            "export const s = new Set(['b', 'a']);",
            "export const m = new Map([['b', 1], ['a', 2]]);",
            'export const v = (q: number[]) => { const second = q.shift(), first = q.shift(); return [first, second]; };',
            'export const f = (k: number) => { switch (k) { case 2: return 2; case 1: return 1; } };',
            'export const z = 1;',
            'export const y = 2;',
            ''
        ].join('\n');

        expect(await fixCode(code)).toBe(code);
    });

    it('puts the API of a component first, then its state, the accessors, the constructor, the hooks and the methods', async () => {
        expect(
            await fix([
                'focus(): void {}',
                'ngOnInit(): void {}',
                'get size(): number { return 1; }',
                'constructor() {}',
                'protected open = false;',
                'readonly panel = viewChild(Panel);',
                'readonly changed = output<string>();',
                'readonly value = input<string>();',
                'private readonly element = kbqInjectNativeElement();',
                'private readonly host = inject(Host);',
                'static ngAcceptInputType: string;'
            ])
        ).toEqual([
            'static ngAcceptInputType: string;',
            '',
            'private readonly element = kbqInjectNativeElement();',
            'private readonly host = inject(Host);',
            '',
            'readonly value = input<string>();',
            '',
            'readonly changed = output<string>();',
            '',
            'readonly panel = viewChild(Panel);',
            '',
            'protected open = false;',
            '',
            'get size(): number { return 1; }',
            '',
            'constructor() {}',
            '',
            'ngOnInit(): void {}',
            '',
            'focus(): void {}'
        ]);
    });

    it('puts a field with a function as its value with the methods', async () => {
        expect(await fix(['onChange = (value: string): void => {};', 'value = "";', 'constructor() {}'])).toEqual([
            'value = "";',
            '',
            'constructor() {}',
            '',
            'onChange = (value: string): void => {};'
        ]);
    });

    it('puts the private state before the protected and public one, which keeps its written order', async () => {
        expect(await fix(['value = 1;', '#cache = 0;', 'protected open = false;', 'private size = 0;'])).toEqual([
            '#cache = 0;',
            'private size = 0;',
            '',
            'value = 1;',
            'protected open = false;'
        ]);
    });

    it('keeps a field after the field its initializer reads', async () => {
        expect(await fix(['private readonly a = 1;', 'readonly b = input(this.a);'])).toEqual([
            'private readonly a = 1;',
            'readonly b = input(this.a);'
        ]);
    });

    it('keeps an accessor with a decorator next to its pair', async () => {
        expect(
            await fix([
                '@Input() get disabled(): boolean { return this._disabled; }',
                'set disabled(value: boolean) { this._disabled = value; }',
                'private _disabled = false;'
            ])
        ).toEqual([
            'private _disabled = false;',
            '',
            '@Input() get disabled(): boolean { return this._disabled; }',
            '',
            'set disabled(value: boolean) { this._disabled = value; }'
        ]);
    });

    it('puts an empty line before a field of a group only when a comment describes it', async () => {
        expect(
            await fix([
                'private readonly a = 1;',
                '',
                'private readonly b = 2;',
                '/** C. */',
                'private readonly c = 3;',
                '// D.',
                'private readonly d = 4;'
            ])
        ).toEqual([
            'private readonly a = 1;',
            'private readonly b = 2;',
            '',
            '/** C. */',
            'private readonly c = 3;',
            '',
            '// D.',
            'private readonly d = 4;'
        ]);
    });

    it('keeps a comment on the line a field ends with that field', async () => {
        expect(await fix(['private readonly a = 1; // A.', 'private readonly b = 2;'])).toEqual([
            'private readonly a = 1; // A.',
            'private readonly b = 2;'
        ]);
    });

    it('agrees with the groups of `perfectionist/sort-classes` at their boundaries', async () => {
        expect(
            await fix([
                'private readonly host = inject(Host);',
                'readonly value = input(1);',
                'private open = false;',
                'accessor state = input(1);',
                '',
                'readonly size = 2;'
            ])
        ).toEqual([
            'private readonly host = inject(Host);',
            '',
            'readonly value = input(1);',
            '',
            'private open = false;',
            '',
            'accessor state = input(1);',
            'readonly size = 2;'
        ]);
    });

    it('puts decorated fields of a group without a comment one under the other', async () => {
        expect(await fix(['@Input()', 'a = 1;', '', '@Input()', 'b = 2;'])).toEqual([
            '@Input()',
            'a = 1;',
            '@Input()',
            'b = 2;'
        ]);
    });

    it('moves a field that starts on the line of the previous one to a line of its own', async () => {
        expect(await fixCode('export class Probe {\n    private a = 1; private b = 2;\n}\n')).toBe(
            'export class Probe {\n    private a = 1;\n    private b = 2;\n}\n'
        );
    });
});

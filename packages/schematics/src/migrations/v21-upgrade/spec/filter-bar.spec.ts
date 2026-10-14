import { runV21Upgrade } from '../testing';

const CHANGES = 'KbqFilterBar.changes was removed';
const MIN_WIDTH = 'KbqPipeMinWidth (kbqPipeMinWidth) was removed';
const REQUIRED_KEY = 'KbqPipe.required was removed in 21.0.0; the filter bar never read it';
const REQUIRED_READ = "KbqPipe.required was removed in 21.0.0. If this `.required` is a pipe's";

describe('v21-upgrade: filter-bar', () => {
    it('renames KbqFilterBarRefresher to KbqFilterRefresher', async () => {
        const run = await runV21Upgrade({
            'refresher.ts': [
                "import { KbqFilterBar, KbqFilterBarRefresher } from '@koobiq/components/filter-bar';",
                "import { KbqFilterBarRefresher as Refresher } from '@koobiq/components/filter-bar';",
                'export const used = [KbqFilterBar, KbqFilterBarRefresher, Refresher];',
                ''
            ].join('\n')
        });

        expect(run.read('refresher.ts')).toBe(
            [
                "import { KbqFilterBar, KbqFilterRefresher } from '@koobiq/components/filter-bar';",
                "import { KbqFilterRefresher as Refresher } from '@koobiq/components/filter-bar';",
                'export const used = [KbqFilterBar, KbqFilterRefresher, Refresher];',
                ''
            ].join('\n')
        );
    });

    it('imports KbqFilterRefresher once when both names were imported', async () => {
        const run = await runV21Upgrade({
            'both.ts': [
                "import { KbqFilterRefresher, KbqFilters, KbqFilterBarRefresher } from '@koobiq/components/filter-bar';",
                'export const used = [KbqFilterRefresher, KbqFilters, KbqFilterBarRefresher];',
                ''
            ].join('\n')
        });

        expect(run.read('both.ts')).toBe(
            [
                "import { KbqFilters, KbqFilterRefresher } from '@koobiq/components/filter-bar';",
                'export const used = [KbqFilterRefresher, KbqFilters, KbqFilterRefresher];',
                ''
            ].join('\n')
        );
    });

    it('removes KbqPipeMinWidth from the import and from the imports array', async () => {
        const run = await runV21Upgrade({
            'only.ts': [
                "import { KbqPipeMinWidth } from '@koobiq/components/filter-bar';",
                '@Component({ imports: [KbqPipeMinWidth] })',
                'export class OnlyPipe {}',
                ''
            ].join('\n'),
            'first.ts': [
                "import { KbqPipeMinWidth, KbqPipeState } from '@koobiq/components/filter-bar';",
                '@Component({ imports: [KbqPipeMinWidth, KbqPipeState] })',
                'export class FirstPipe {}',
                ''
            ].join('\n'),
            'middle.ts': [
                'import {',
                '    KbqBasePipe,',
                '    KbqPipeMinWidth,',
                '    KbqPipeState',
                "} from '@koobiq/components/filter-bar';",
                '@Component({',
                '    imports: [',
                '        KbqPipeState,',
                '        KbqPipeMinWidth,',
                '        KbqIcon',
                '    ]',
                '})',
                'export class MiddlePipe extends KbqBasePipe<string> {}',
                ''
            ].join('\n'),
            'last.ts': [
                "import { KbqPipeState, KbqPipeMinWidth } from '@koobiq/components/filter-bar';",
                '@Component({ imports: [KbqPipeState, KbqPipeMinWidth] })',
                'export class LastPipe {}',
                ''
            ].join('\n')
        });

        expect(run.read('only.ts')).toBe(['@Component({ imports: [] })', 'export class OnlyPipe {}', ''].join('\n'));
        expect(run.read('first.ts')).toBe(
            [
                "import { KbqPipeState } from '@koobiq/components/filter-bar';",
                '@Component({ imports: [KbqPipeState] })',
                'export class FirstPipe {}',
                ''
            ].join('\n')
        );
        expect(run.read('middle.ts')).toBe(
            [
                'import {',
                '    KbqBasePipe,',
                '    KbqPipeState',
                "} from '@koobiq/components/filter-bar';",
                '@Component({',
                '    imports: [',
                '        KbqPipeState,',
                '        KbqIcon',
                '    ]',
                '})',
                'export class MiddlePipe extends KbqBasePipe<string> {}',
                ''
            ].join('\n')
        );
        expect(run.read('last.ts')).toBe(
            [
                "import { KbqPipeState } from '@koobiq/components/filter-bar';",
                '@Component({ imports: [KbqPipeState] })',
                'export class LastPipe {}',
                ''
            ].join('\n')
        );
        expect(run.log).not.toContain(MIN_WIDTH);
    });

    it('removes the KbqPipeMinWidth specifier with its type modifier from any place in its clause', async () => {
        const from = " from '@koobiq/components/filter-bar';\n";
        const cases: [string, string][] = [
            ['import { type KbqPipeMinWidth, KbqPipeState }', 'import { KbqPipeState }'],
            ['import { KbqBasePipe, type KbqPipeMinWidth, KbqPipeState }', 'import { KbqBasePipe, KbqPipeState }'],
            ['import { KbqPipeState, type KbqPipeMinWidth }', 'import { KbqPipeState }'],
            ['import type { KbqPipeMinWidth, KbqPipeState }', 'import type { KbqPipeState }'],
            ['export { KbqPipeState, type KbqPipeMinWidth }', 'export { KbqPipeState }']
        ];
        const files = Object.fromEntries(cases.map(([clause], i) => [`clause-${i}.ts`, `${clause}${from}`]));
        const run = await runV21Upgrade({
            ...files,
            'only.ts': `import { type KbqPipeMinWidth }${from}export class Pipe {}\n`,
            'only-export.ts': `export { KbqPipeMinWidth }${from}export type { KbqPipeMinWidth }${from}export class Pipe {}\n`
        });

        cases.forEach(([, clause], i) => expect(run.read(`clause-${i}.ts`)).toBe(`${clause}${from}`));
        expect(run.read('only.ts')).toBe('export class Pipe {}\n');
        expect(run.read('only-export.ts')).toBe('export class Pipe {}\n');
        expect(run.log).not.toContain(MIN_WIDTH);
    });

    it('drops the kbqPipeMinWidth attribute from external and inline templates', async () => {
        const run = await runV21Upgrade({
            'pipe.html': [
                '<span class="kbq-pipe__name" kbqPipeMinWidth>{{ data.name }}</span>',
                '<span',
                '    kbqPipeMinWidth=""',
                '    class="kbq-pipe__value"',
                '>{{ data.value }}</span>',
                '<span kbqPipeMinWidth/>',
                ''
            ].join('\n'),
            'inline.ts': [
                '@Component({',
                '    template: `<span kbqPipeMinWidth class="kbq-pipe__name">{{ data.name }}</span>`',
                '})',
                'export class InlinePipe {}',
                ''
            ].join('\n')
        });

        expect(run.read('pipe.html')).toBe(
            [
                '<span class="kbq-pipe__name">{{ data.name }}</span>',
                '<span',
                '    class="kbq-pipe__value"',
                '>{{ data.value }}</span>',
                '<span/>',
                ''
            ].join('\n')
        );
        expect(run.read('inline.ts')).toBe(
            [
                '@Component({',
                '    template: `<span class="kbq-pipe__name">{{ data.name }}</span>`',
                '})',
                'export class InlinePipe {}',
                ''
            ].join('\n')
        );
    });

    it('reports KbqFilterBar.changes', async () => {
        const source = [
            "import { KbqFilterBar } from '@koobiq/components/filter-bar';",
            'export class App {',
            '    readonly filterBar = viewChild.required(KbqFilterBar);',
            '    ngOnInit() { this.filterBar().changes.subscribe(() => this.load()); }',
            '}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'changes.ts': source });

        expect(run.read('changes.ts')).toBe(source);
        expect(run.log).toContain(CHANGES);
    });

    it('reports a KbqPipeMinWidth reference it cannot remove', async () => {
        const source = [
            "import { KbqPipeMinWidth as MinWidth } from '@koobiq/components/filter-bar';",
            'export class WiderPipeMinWidth extends MinWidth {}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'subclass.ts': source });

        expect(run.read('subclass.ts')).toBe(source);
        expect(run.log).toContain(MIN_WIDTH);
    });

    it('reports the required key of a pipe and of a pipe template', async () => {
        const pipes = [
            "import { KbqPipe, KbqPipeTemplate, KbqPipeTypes } from '@koobiq/components/filter-bar';",
            'export const pipe: KbqPipe = {',
            "    name: 'Status',",
            '    type: KbqPipeTypes.Select,',
            "    value: { name: 'Open', value: 'open' },",
            '    required: true,',
            '    cleanable: false,',
            '    removable: false,',
            '    disabled: false',
            '};',
            ''
        ].join('\n');
        const templates = [
            "import { KbqPipeTemplate, KbqPipeTypes } from '@koobiq/components/filter-bar';",
            'export const templates: KbqPipeTemplate[] = [',
            '    {',
            "        name: 'Owner',",
            '        type: KbqPipeTypes.Text,',
            "        values: [{ name: 'Me', value: { id: 1 } }],",
            '        required: false',
            '    }',
            '];',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'pipes.ts': pipes, 'templates.ts': templates });

        expect(run.read('pipes.ts')).toBe(pipes);
        expect(run.read('templates.ts')).toBe(templates);
        expect(run.log).toContain(`pipes.ts\n  ${REQUIRED_KEY}`);
        expect(run.log).toContain(`templates.ts\n  ${REQUIRED_KEY}`);
        expect(run.log).not.toContain(REQUIRED_READ);
    });

    it('reports a read of required on the data of a custom pipe', async () => {
        const source = [
            "import { KbqBasePipe } from '@koobiq/components/filter-bar';",
            'export class ColorPipe extends KbqBasePipe<string> {',
            '    get locked() { return !!this.data.required; }',
            '}',
            ''
        ].join('\n');
        const template = '@if (!data?.required) {\n    <i class="kbq-pipe__remove" (click)="onRemove()"></i>\n}\n';
        const run = await runV21Upgrade({ 'color-pipe.ts': source, 'color-pipe.html': template });

        expect(run.read('color-pipe.ts')).toBe(source);
        expect(run.read('color-pipe.html')).toBe(template);
        expect(run.log).toContain(`color-pipe.ts\n  ${REQUIRED_READ}`);
        expect(run.log).toContain(`color-pipe.html\n  ${REQUIRED_READ}`);
    });

    it('leaves the required key and reads of forms and validators next to a filter bar alone', async () => {
        const source = [
            "import { Validators } from '@angular/forms';",
            "import { KbqFilter, KbqPipeTypes } from '@koobiq/components/filter-bar';",
            'export class App {',
            "    readonly field = { name: 'email', type: 'text', required: true, validators: [Validators.required] };",
            '    readonly filters: KbqFilter[] = [',
            '        {',
            "            name: 'All',",
            '            readonly: false,',
            '            disabled: false,',
            '            changed: false,',
            '            saved: false,',
            '            pipes: [',
            "                { name: 'Status', type: KbqPipeTypes.Select, value: null, cleanable: true,",
            '                  removable: false, disabled: false }',
            '            ]',
            '        }',
            '    ];',
            '    readonly schema = { required: true, nested: { cleanable: false } };',
            '    readonly label = input.required<string>();',
            '    get mandatory() { return this.field.required || this.email.hasValidator(Validators.required); }',
            '}',
            ''
        ].join('\n');
        const unrelated = [
            "export const pipe = { name: 'deploy', required: true, cleanable: false, removable: false };",
            'export const isRequired = (pipe: { required: boolean }) => pipe.required;',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'form.ts': source, 'deploy.ts': unrelated });

        expect(run.read('form.ts')).toBe(source);
        expect(run.read('deploy.ts')).toBe(unrelated);
        expect(run.log).not.toContain(REQUIRED_KEY);
        expect(run.log).not.toContain(REQUIRED_READ);
    });

    it('leaves the current names, other changes streams and look-alikes alone', async () => {
        const source = [
            "import { QueryList } from '@angular/core';",
            "import { KbqFilterRefresher, KbqFilters } from '@koobiq/components/filter-bar';",
            "import { KbqPipeMinWidthLike } from './pipe-min-width-like';",
            '@Component({',
            '    imports: [KbqFilterRefresher, KbqFilters, KbqPipeMinWidthLike],',
            '    template: `<span kbqPipeMinWidthLike [style.min-width]="minWidth"></span>`',
            '})',
            'export class App {',
            '    items!: QueryList<unknown>;',
            '    ngAfterViewInit() { this.items.changes.subscribe(); }',
            '}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'unrelated.ts': source });

        expect(run.read('unrelated.ts')).toBe(source);
        expect(run.log).not.toContain(CHANGES);
        expect(run.log).not.toContain(MIN_WIDTH);
    });
});

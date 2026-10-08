import { runV21Upgrade } from '../testing';

const CHANGES = 'KbqFilterBar.changes was removed';
const MIN_WIDTH = 'KbqPipeMinWidth (kbqPipeMinWidth) was removed';

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

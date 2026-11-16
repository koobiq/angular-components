import { Component, Directive, inject, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
    KBQ_FILTER_BAR_HOST,
    KBQ_FILTER_BAR_NAME_RESOLVER,
    KbqDateTimeValue,
    KbqFilterBar,
    KbqFilterBarModule,
    KbqFilterBarNameContext,
    KbqFilterBarNameKind,
    KbqFilterBarNameResolver,
    kbqFilterBarNameResolverProvider,
    KbqPipe,
    KbqPipeTemplate,
    KbqPipeTypes,
    KbqSelectValue,
    KbqTreeSelectFlatNode,
    KbqTreeSelectNode
} from '@koobiq/components/filter-bar';
import { KBQ_PIPE_DATA, KbqBasePipe } from './pipes/base-pipe';

const PIPE_TEMPLATE_ID = 'TestSelect';

const createPipe = (overrides: Partial<KbqPipe> = {}): KbqPipe => ({
    name: 'test',
    id: PIPE_TEMPLATE_ID,
    type: KbqPipeTypes.Select,
    value: null,
    search: false,
    cleanable: false,
    removable: false,
    disabled: false,
    ...overrides
});

@Component({
    selector: 'test-app',
    imports: [KbqFilterBarModule],
    template: `
        <kbq-filter-bar [nameResolver]="nameResolver()" />
    `
})
class TestComponent {
    readonly nameResolver = signal<KbqFilterBarNameResolver | null>(null);
}

@Directive({
    selector: '[kbq-test-base-pipe]',
    providers: [{ provide: KBQ_PIPE_DATA, useValue: createPipe({ value: 'value1' }) }]
})
class TestBasePipeDirective extends KbqBasePipe<unknown> {
    readonly host = inject(KBQ_FILTER_BAR_HOST, { optional: true });

    open(): void {}

    exposeResolveName(
        source: Exclude<KbqFilterBarNameContext['source'], KbqPipeTemplate>,
        kind: Exclude<KbqFilterBarNameKind, 'pipe-template'>,
        nameKey?: string
    ): string {
        return this.resolveName(source, kind, nameKey);
    }
}

@Component({
    selector: 'test-base-pipe-app',
    imports: [KbqFilterBarModule, TestBasePipeDirective],
    template: `
        <kbq-filter-bar>
            <div kbq-test-base-pipe></div>
        </kbq-filter-bar>
    `
})
class TestBasePipeComponent {}

describe('KbqFilterBarNameResolver', () => {
    let fixture: ComponentFixture<TestComponent>;
    let filterBar: KbqFilterBar;
    let inputResolver: ReturnType<typeof vi.fn<KbqFilterBarNameResolver>>;
    let diResolver: ReturnType<typeof vi.fn<KbqFilterBarNameResolver>>;

    const currentPipe = createPipe({ value: 'value1' });
    const originalValue: KbqSelectValue = { name: 'Active', value: 'active' };

    const context: KbqFilterBarNameContext = {
        key: 'filters.status',
        fallback: 'Status',
        kind: 'pipe',
        pipe: currentPipe,
        source: currentPipe
    };

    beforeEach(() => {
        inputResolver = vi.fn();
        diResolver = vi.fn();

        TestBed.configureTestingModule({
            imports: [KbqFilterBarModule, TestComponent],
            providers: [kbqFilterBarNameResolverProvider(diResolver)]
        }).compileComponents();

        fixture = TestBed.createComponent(TestComponent);
        fixture.componentInstance.nameResolver.set(inputResolver);
        fixture.detectChanges();

        filterBar = fixture.debugElement.query(By.css('kbq-filter-bar')).componentInstance;
    });

    it('should prefer input resolver over DI resolver', () => {
        inputResolver.mockReturnValue('Input status');

        expect(filterBar.resolveName(context)).toBe('Input status');
        expect(inputResolver).toHaveBeenCalledWith(context);
        expect(diResolver).not.toHaveBeenCalled();
    });

    it('should fall back to the context fallback when the resolver returns nullish', () => {
        inputResolver.mockReturnValue(undefined);
        diResolver.mockReturnValue('DI status');

        expect(filterBar.resolveName(context)).toBe('Status');
        expect(inputResolver).toHaveBeenCalledWith(context);
        expect(diResolver).not.toHaveBeenCalled();
    });

    it('should allow an empty string from the resolver', () => {
        inputResolver.mockReturnValue('');

        expect(filterBar.resolveName(context)).toBe('');
    });

    it('should use the DI resolver when no input resolver is provided', () => {
        fixture.componentInstance.nameResolver.set(null);
        fixture.detectChanges();

        diResolver.mockReturnValue('DI status');

        expect(filterBar.resolveName(context)).toBe('DI status');
        expect(diResolver).toHaveBeenCalledWith(context);
    });

    describe('name context kinds', () => {
        const template: KbqPipeTemplate = {
            name: 'Template',
            id: PIPE_TEMPLATE_ID,
            type: KbqPipeTypes.Select,
            cleanable: false,
            removable: false,
            disabled: false
        };

        it('should accept a pipe context', () => {
            const pipeContext: KbqFilterBarNameContext = {
                ...context,
                kind: 'pipe',
                pipe: currentPipe,
                source: currentPipe
            };

            inputResolver.mockReturnValue('Pipe');

            expect(filterBar.resolveName(pipeContext)).toBe('Pipe');
            expect(inputResolver).toHaveBeenCalledWith(pipeContext);
        });

        it('should accept a pipe-template context', () => {
            const pipeTemplateContext: KbqFilterBarNameContext = {
                ...context,
                kind: 'pipe-template',
                pipe: template,
                source: template
            };

            inputResolver.mockReturnValue('Pipe template');

            expect(filterBar.resolveName(pipeTemplateContext)).toBe('Pipe template');
            expect(inputResolver).toHaveBeenCalledWith(pipeTemplateContext);
            expect(pipeTemplateContext.pipe).toBe(template);
            expect(pipeTemplateContext.source).toBe(template);
        });

        it('should accept a select-option context', () => {
            const selectOptionContext: KbqFilterBarNameContext = {
                ...context,
                kind: 'select-option',
                pipe: currentPipe,
                source: originalValue
            };

            inputResolver.mockReturnValue('Select option');

            expect(filterBar.resolveName(selectOptionContext)).toBe('Select option');
            expect(inputResolver).toHaveBeenCalledWith(selectOptionContext);
            expect(selectOptionContext.pipe).toBe(currentPipe);
            expect(selectOptionContext.source).toBe(originalValue);
        });

        it('should accept a date-preset context', () => {
            const dateValue: KbqDateTimeValue = { name: 'Today', start: '2026-11-12', end: '2026-11-12' };
            const datePresetContext: KbqFilterBarNameContext = {
                ...context,
                kind: 'date-preset',
                pipe: currentPipe,
                source: dateValue
            };

            inputResolver.mockReturnValue('Date preset');

            expect(filterBar.resolveName(datePresetContext)).toBe('Date preset');
            expect(inputResolver).toHaveBeenCalledWith(datePresetContext);
            expect(datePresetContext.pipe).toBe(currentPipe);
            expect(datePresetContext.source).toBe(dateValue);
        });

        it('should accept a tree-node context', () => {
            const treeNode: KbqTreeSelectNode = {
                name: 'Node',
                value: 'node',
                children: null
            };
            const treeNodeContext: KbqFilterBarNameContext = {
                ...context,
                kind: 'tree-node',
                pipe: currentPipe,
                source: treeNode
            };

            inputResolver.mockReturnValue('Tree node');

            expect(filterBar.resolveName(treeNodeContext)).toBe('Tree node');
            expect(inputResolver).toHaveBeenCalledWith(treeNodeContext);
            expect(treeNodeContext.pipe).toBe(currentPipe);
            expect(treeNodeContext.source).toBe(treeNode);
        });

        it('should accept a tree-node context with a flat node', () => {
            const flatNode: KbqTreeSelectFlatNode = new KbqTreeSelectFlatNode();

            flatNode.name = 'Flat node';
            flatNode.value = 'flat-node';
            flatNode.level = 0;
            flatNode.expandable = false;

            const treeNodeContext: KbqFilterBarNameContext = {
                ...context,
                kind: 'tree-node',
                pipe: currentPipe,
                source: flatNode
            };

            inputResolver.mockReturnValue('Flat tree node');

            expect(filterBar.resolveName(treeNodeContext)).toBe('Flat tree node');
            expect(inputResolver).toHaveBeenCalledWith(treeNodeContext);
            expect(treeNodeContext.pipe).toBe(currentPipe);
            expect(treeNodeContext.source).toBe(flatNode);
        });
    });
});

describe('KbqBasePipe.resolveName', () => {
    let fixture: ComponentFixture<TestBasePipeComponent>;
    let pipeDirective: TestBasePipeDirective;
    let diResolver: ReturnType<typeof vi.fn<KbqFilterBarNameResolver>>;

    beforeEach(() => {
        diResolver = vi.fn();

        TestBed.configureTestingModule({
            imports: [KbqFilterBarModule, TestBasePipeComponent]
        })
            .overrideProvider(KBQ_FILTER_BAR_NAME_RESOLVER, { useValue: diResolver })
            .compileComponents();

        fixture = TestBed.createComponent(TestBasePipeComponent);
        fixture.detectChanges();

        pipeDirective = fixture.debugElement
            .query(By.directive(TestBasePipeDirective))
            .injector.get(TestBasePipeDirective);
    });

    it('should return source.name when no nameKey is provided', () => {
        const source: KbqSelectValue = { name: 'Active', value: 'active' };

        expect(pipeDirective.exposeResolveName(source, 'select-option')).toBe('Active');
    });

    it('should return an empty string when source.name is empty and no nameKey is provided', () => {
        const source: KbqSelectValue = { name: '', value: 'active' };

        expect(pipeDirective.exposeResolveName(source, 'select-option')).toBe('');
    });

    it('should return source.name when nameKey is empty', () => {
        const source: KbqSelectValue = { name: 'Active', value: 'active' };

        expect(pipeDirective.exposeResolveName(source, 'select-option', '')).toBe('Active');
    });

    it('should call the host resolver with a nameKey', () => {
        const source: KbqSelectValue = { name: 'Active', value: 'active', nameKey: 'filters.status' };

        pipeDirective.host!.resolveName = vi.fn().mockReturnValue('Resolved status');

        expect(pipeDirective.exposeResolveName(source, 'select-option')).toBe('Resolved status');
        expect(pipeDirective.host!.resolveName).toHaveBeenCalledWith({
            key: 'filters.status',
            fallback: 'Active',
            kind: 'select-option',
            pipe: createPipe({ value: 'value1' }),
            source
        });
        expect(diResolver).not.toHaveBeenCalled();
    });

    it('should fall back to the DI resolver when the host resolver returns nullish', () => {
        const source: KbqSelectValue = { name: 'Active', value: 'active', nameKey: 'filters.status' };

        pipeDirective.host!.resolveName = vi.fn().mockReturnValue(undefined);
        diResolver.mockReturnValue('DI status');

        expect(pipeDirective.exposeResolveName(source, 'select-option')).toBe('DI status');
        expect(diResolver).toHaveBeenCalledWith({
            key: 'filters.status',
            fallback: 'Active',
            kind: 'select-option',
            pipe: createPipe({ value: 'value1' }),
            source
        });
    });

    it('should fall back to source.name when both resolvers return nullish', () => {
        const source: KbqSelectValue = { name: 'Active', value: 'active', nameKey: 'filters.status' };

        pipeDirective.host!.resolveName = vi.fn().mockReturnValue(undefined);
        diResolver.mockReturnValue(undefined);

        expect(pipeDirective.exposeResolveName(source, 'select-option')).toBe('Active');
    });
});

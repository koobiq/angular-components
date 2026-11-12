import { FocusMonitor } from '@angular/cdk/a11y';
import { ChangeDetectorRef, Component, DebugElement, inject, signal, TemplateRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
    kbqBuildTree,
    KbqFilter,
    KbqFilterBar,
    KbqFilterBarModule,
    KbqFilterBarNameResolver,
    kbqFilterBarNameResolverProvider,
    KbqPipe,
    KbqPipeTemplate,
    KbqPipeTypes,
    KbqSelectValue,
    KbqTreeSelectNode
} from '@koobiq/components/filter-bar';
import { KbqTreeOption } from '@koobiq/components/tree';
import { KbqBasePipe } from './base-pipe';
import { registerNoOptionsTests } from './pipe-no-options.spec-helper';
import { registerPipeStatesTests } from './pipe-states.spec-helper';
import { KbqPipeTreeSelectComponent } from './pipe-tree-select';

const DEV_DATA_OBJECT = {
    'No roles': 'value 0',
    'Management and Configuration': {
        Administrator: { value: 'value 1' },
        Operator: 'value 2',
        User: 'value 3'
    },
    'MP 10': {
        Administrator: 'value 4',
        Operator: 'value 5',
        User: 'value 6'
    },
    'Knowledge Base': {
        Administrator: 'value 7',
        Operator: 'value 8',
        User: 'value 9'
    }
};

const TREE_DATA: KbqTreeSelectNode[] = kbqBuildTree(DEV_DATA_OBJECT, 0);

const PIPE_TEMPLATE_ID = 'TestTreeSelect';

const SINGLE_VALUE: KbqSelectValue = { name: 'No roles', value: 'value 0' };

const createPipe = (overrides: Partial<KbqPipe>): KbqPipe => ({
    name: 'test',
    id: PIPE_TEMPLATE_ID,
    type: KbqPipeTypes.TreeSelect,
    value: null,
    search: true,
    cleanable: false,
    removable: false,
    disabled: false,
    ...overrides
});

const createFilter = (pipes: KbqPipe[]): KbqFilter => ({
    name: 'TestFilter',
    readonly: false,
    disabled: false,
    changed: false,
    saved: false,
    pipes
});

@Component({
    selector: 'test-app',
    imports: [KbqFilterBarModule],
    template: `
        <kbq-filter-bar [pipeTemplates]="pipeTemplates" [(filter)]="activeFilter">
            @for (pipe of activeFilter?.pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }
            <kbq-pipe-add />
            <kbq-filter-reset />
        </kbq-filter-bar>

        <ng-template #optionTemplate let-option="option" let-pipe let-search="search">
            <span class="custom-tree-option">{{ option.name }} / {{ option.caption }} / {{ pipe.data.id }}</span>
            <span class="custom-tree-option__badge">{{ option.badge }}</span>
            <span class="custom-tree-option__search">{{ search }}</span>
        </ng-template>
    `
})
class TestComponent {
    readonly changeDetectorRef = inject(ChangeDetectorRef);
    readonly optionTemplate = viewChild.required<TemplateRef<any>>('optionTemplate');

    activeFilter: KbqFilter | null = null;

    pipeTemplates: KbqPipeTemplate[] = [
        {
            name: 'TreeSelect',
            id: PIPE_TEMPLATE_ID,
            type: KbqPipeTypes.TreeSelect,
            values: TREE_DATA,
            cleanable: false,
            removable: false,
            disabled: false
        }
    ];
}

describe('KbqPipeTreeSelectComponent', () => {
    let fixture: ComponentFixture<TestComponent>;
    let filterBarDebugElement: DebugElement;

    const originalStructuredClone = window.structuredClone;

    beforeAll(() => {
        window.structuredClone = (value) => JSON.parse(JSON.stringify(value));
    });

    afterAll(() => {
        window.structuredClone = originalStructuredClone;
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqFilterBarModule, TestComponent]
        })
            .overrideComponent(KbqPipeTreeSelectComponent, {
                set: {
                    providers: [{ provide: KbqBasePipe, useExisting: KbqPipeTreeSelectComponent }]
                }
            })
            .compileComponents();
    });

    afterEach(() => vi.useRealTimers());

    const getPipeComponent = (index: number = 0): KbqPipeTreeSelectComponent => {
        const pipes = fixture.debugElement.queryAll(By.css('kbq-pipe-tree-select'));

        return pipes[index].componentInstance;
    };

    const getFilterBar = (): KbqFilterBar => {
        return filterBarDebugElement.componentInstance;
    };

    registerPipeStatesTests({
        label: 'TreeSelect',
        pipeClass: 'kbq-pipe__tree-select',
        createPipe,
        createFilter,
        nonEmptyValue: () => SINGLE_VALUE,
        createContext: () => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));

            return { fixture, filterBar: filterBarDebugElement };
        }
    });

    registerNoOptionsTests({
        pipeSelector: 'kbq-pipe-tree-select',
        createPipe,
        createFilter,
        createTemplate: (overrides) => ({
            name: 'TreeSelect',
            id: PIPE_TEMPLATE_ID,
            type: KbqPipeTypes.TreeSelect,
            values: TREE_DATA,
            cleanable: false,
            removable: false,
            disabled: false,
            ...overrides
        }),
        values: TREE_DATA,
        createFixture: () => TestBed.createComponent(TestComponent)
    });

    describe('isEmpty', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should be empty when value is null', () => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: null })
            ]);
            fixture.detectChanges();

            expect(getPipeComponent().isEmpty).toBe(true);
        });

        it('should not be empty when value is set', () => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: SINGLE_VALUE })
            ]);
            fixture.detectChanges();

            expect(getPipeComponent().isEmpty).toBe(false);
        });
    });

    describe('selected getter', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should return data.value', () => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: SINGLE_VALUE })
            ]);
            fixture.detectChanges();

            const component = getPipeComponent();

            expect(component.selected).toEqual(SINGLE_VALUE);
        });

        it('should return null when no value', () => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: null })
            ]);
            fixture.detectChanges();

            const component = getPipeComponent();

            expect(component.selected).toBeNull();
        });
    });

    describe('onSelect', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should emit onChangePipe event on selection', async () => {
            vi.useFakeTimers();

            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: null })
            ]);
            fixture.detectChanges();

            const filterBar = getFilterBar();
            const component = getPipeComponent();
            const spy = vi.fn();

            filterBar.onChangePipe.subscribe(spy);

            component.onSelect({ value: SINGLE_VALUE } as KbqTreeOption);
            await vi.runOnlyPendingTimersAsync();

            expect(spy).toHaveBeenCalled();
        });

        it('should set data.value to selected item value', async () => {
            vi.useFakeTimers();

            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: null })
            ]);
            fixture.detectChanges();

            const component = getPipeComponent();
            const mockItem = { value: SINGLE_VALUE } as KbqTreeOption;

            component.onSelect(mockItem);
            await vi.runOnlyPendingTimersAsync();

            expect(component.data.value).toEqual(SINGLE_VALUE);
        });

        it('should close select after selection', async () => {
            vi.useFakeTimers();

            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: null })
            ]);
            fixture.detectChanges();

            const component = getPipeComponent();
            const closeSpy = vi.spyOn(component.select(), 'close');
            const mockItem = { value: SINGLE_VALUE } as KbqTreeOption;

            component.onSelect(mockItem);
            await vi.runOnlyPendingTimersAsync();

            expect(closeSpy).toHaveBeenCalled();
        });

        it('should restore focus to the trigger button after selection', async () => {
            vi.useFakeTimers();

            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: null })
            ]);
            fixture.detectChanges();

            const focusViaSpy = vi.spyOn(TestBed.inject(FocusMonitor), 'focusVia');

            getPipeComponent().onSelect({ value: SINGLE_VALUE } as KbqTreeOption);
            await vi.runOnlyPendingTimersAsync();

            expect(focusViaSpy).toHaveBeenCalledWith(expect.any(HTMLButtonElement), expect.anything());
        });
    });

    describe('updateTemplates', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should populate dataSource from pipeTemplates', () => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: null })
            ]);
            fixture.detectChanges();

            const component = getPipeComponent();

            expect(component.dataSource.data.length).toBe(TREE_DATA.length);
        });
    });

    describe('panelMaxHeight forwarding', () => {
        // `open()` on the pipe is deferred through a `setTimeout`, so drive the inner select directly.
        const openPanel = () => {
            getPipeComponent().select().open();
            fixture.detectChanges();
        };

        // JSDOM computes no layout, so the inline custom property on the panel is the observable
        // contract here; that it resolves to an actual height is covered by the filter-bar Playwright
        // specs, which read the computed `max-height` of `__content`.
        const readPanelMaxHeightToken = (): string => {
            const panel = document.querySelector<HTMLElement>('.kbq-pipe-tree-select__panel')!;

            return panel.style.getPropertyValue('--kbq-select-panel-size-max-height');
        };

        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should forward panelMaxHeight from the pipe template to the panel', async () => {
            vi.useFakeTimers();

            fixture.componentInstance.pipeTemplates = [
                {
                    name: 'TreeSelect',
                    id: PIPE_TEMPLATE_ID,
                    type: KbqPipeTypes.TreeSelect,
                    values: TREE_DATA,
                    panelMaxHeight: 300,
                    cleanable: false,
                    removable: false,
                    disabled: false
                }
            ];
            fixture.componentInstance.activeFilter = createFilter([createPipe({ name: 'test', value: null })]);
            fixture.detectChanges();

            openPanel();
            await vi.runOnlyPendingTimersAsync();
            fixture.detectChanges();

            expect(readPanelMaxHeightToken()).toBe('300px');
        });

        it('should leave the token unset when the template omits panelMaxHeight', async () => {
            vi.useFakeTimers();

            fixture.componentInstance.activeFilter = createFilter([createPipe({ name: 'test', value: null })]);
            fixture.detectChanges();

            openPanel();
            await vi.runOnlyPendingTimersAsync();
            fixture.detectChanges();

            // No inline custom property at all, so the select-family default of 256px applies.
            expect(readPanelMaxHeightToken()).toBe('');
        });
    });

    describe('onClear', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should set value to null', () => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: SINGLE_VALUE })
            ]);
            fixture.detectChanges();

            const component = getPipeComponent();

            component.onClear();

            expect(component.data.value).toBeNull();
        });

        it('should emit onClearPipe event', () => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: SINGLE_VALUE })
            ]);
            fixture.detectChanges();

            const filterBar = getFilterBar();
            const spy = vi.fn();

            filterBar.onClearPipe.subscribe(spy);

            getPipeComponent().onClear();

            expect(spy).toHaveBeenCalled();
        });

        it('should emit onChangePipe event', () => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: SINGLE_VALUE })
            ]);
            fixture.detectChanges();

            const filterBar = getFilterBar();
            const spy = vi.fn();

            filterBar.onChangePipe.subscribe(spy);

            getPipeComponent().onClear();

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('onOpen', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should expand all tree nodes on open', () => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: null })
            ]);
            fixture.detectChanges();

            const component = getPipeComponent();
            const expandAllSpy = vi.spyOn(component.treeControl, 'expandAll');

            component.onOpen();

            expect(expandAllSpy).toHaveBeenCalled();
        });

        describe('with defaultExpanded: false', () => {
            it('should not expand all nodes on open', () => {
                fixture.componentInstance.activeFilter = createFilter([
                    createPipe({ name: 'test', value: null, defaultExpanded: false })
                ]);
                fixture.detectChanges();

                const component = getPipeComponent();
                const expandAllSpy = vi.spyOn(component.treeControl, 'expandAll');

                component.onOpen();

                expect(expandAllSpy).not.toHaveBeenCalled();
                expect(component.treeControl.expansionModel.selected).toEqual([]);
            });

            it('should expand only the ancestors of the selected node', () => {
                // 'value 2' is the 'Operator' leaf under the 'Management and Configuration' branch; a plain
                // string survives the structuredClone mock, so the select matches it by value.
                fixture.componentInstance.activeFilter = createFilter([
                    createPipe({ name: 'test', value: 'value 2', defaultExpanded: false })
                ]);
                fixture.detectChanges();

                const component = getPipeComponent();

                component.onOpen();

                const expanded = component.treeControl.expansionModel.selected;

                expect(expanded.length).toBeGreaterThan(0);
                expect(expanded.every((node) => node.expandable)).toBe(true);

                const otherBranch = component.treeControl.dataNodes.find(
                    (node) => node.level === 0 && node.name === 'Knowledge Base'
                );

                expect(component.treeControl.isExpanded(otherBranch!)).toBe(false);
            });

            it('should open collapsed when the selected value is not in the tree', () => {
                fixture.componentInstance.activeFilter = createFilter([
                    createPipe({
                        name: 'test',
                        value: { name: 'ghost', value: 'no-such-value' },
                        defaultExpanded: false
                    })
                ]);
                fixture.detectChanges();

                const component = getPipeComponent();

                component.onOpen();

                expect(component.treeControl.expansionModel.selected).toEqual([]);
            });

            it('should return to the collapsed state after the search is cleared', async () => {
                vi.useFakeTimers();

                fixture.componentInstance.activeFilter = createFilter([
                    createPipe({ name: 'test', value: null, defaultExpanded: false, search: true })
                ]);
                fixture.detectChanges();

                const component = getPipeComponent();

                component.onOpen();
                component.searchControl.setValue('Admin');
                await vi.runOnlyPendingTimersAsync();

                expect(component.treeControl.expansionModel.selected.length).toBeGreaterThan(0);

                component.searchControl.setValue('');
                await vi.runOnlyPendingTimersAsync();

                expect(component.treeControl.expansionModel.selected).toEqual([]);
            });
        });
    });

    describe('hasChild', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: null })
            ]);
            fixture.detectChanges();
        });

        it('should return true for expandable nodes', () => {
            const component = getPipeComponent();

            expect(component.hasChild(0, { name: 'node', value: null, level: 0, expandable: true })).toBe(true);
        });

        it('should return false for leaf nodes', () => {
            const component = getPipeComponent();

            expect(component.hasChild(0, { name: 'node', value: null, level: 0, expandable: false })).toBe(false);
        });
    });

    describe('option content', () => {
        interface CaptionedNode extends Omit<KbqTreeSelectNode, 'children'> {
            badge?: string;
            children: CaptionedNode[] | null;
        }

        const CAPTIONED_TREE_DATA: CaptionedNode[] = [
            {
                name: 'Events',
                value: 'events',
                caption: 'category.events',
                children: [
                    { name: 'Threat type', value: 'threat', caption: 'category.generic', badge: 'B1', children: null },
                    { name: 'Action', value: 'action', children: null }
                ]
            }
        ];

        const setTemplate = (valueTemplate?: TemplateRef<any>, multilineOptions?: boolean) => {
            fixture.componentInstance.pipeTemplates = [
                {
                    name: 'TreeSelect',
                    id: PIPE_TEMPLATE_ID,
                    type: KbqPipeTypes.TreeSelect,
                    values: CAPTIONED_TREE_DATA,
                    valueTemplate,
                    multilineOptions,
                    cleanable: false,
                    removable: false,
                    disabled: false
                }
            ];
        };

        const renderPanel = async () => {
            getPipeComponent().select().open();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();
            fixture.detectChanges();
        };

        const getOption = (value: unknown): KbqTreeOption =>
            getPipeComponent()
                .select()
                .tree()!
                .renderedOptions.find((option) => option.value === value)!;

        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should render captions for branches and leaves only when provided', async () => {
            vi.useFakeTimers();

            setTemplate();
            fixture.componentInstance.activeFilter = createFilter([createPipe({ name: 'test', value: null })]);
            fixture.detectChanges();
            await renderPanel();

            expect(getOption('events').getHostElement().querySelector('.kbq-option-caption')!.textContent!.trim()).toBe(
                'category.events'
            );
            expect(getOption('threat').getHostElement().querySelector('.kbq-option-caption')!.textContent!.trim()).toBe(
                'category.generic'
            );
            expect(getOption('action').getHostElement().querySelector('.kbq-option-caption')).toBeNull();
        });

        it('should keep the caption out of the trigger and type-ahead label', async () => {
            vi.useFakeTimers();

            setTemplate();
            fixture.componentInstance.activeFilter = createFilter([createPipe({ name: 'test', value: 'threat' })]);
            fixture.detectChanges();
            await renderPanel();

            expect(getPipeComponent().select().triggerValue).toBe('Threat type');
            expect(getOption('threat').getLabel()).toBe('Threat type');
        });

        it('should search by name and caption in the default template', async () => {
            vi.useFakeTimers();

            setTemplate();
            fixture.componentInstance.activeFilter = createFilter([createPipe({ name: 'test', value: null })]);
            fixture.detectChanges();

            const component = getPipeComponent();

            component.searchControl.setValue('category.generic');
            await vi.runOnlyPendingTimersAsync();

            expect(component.treeControl.filterModel.selected.map((node) => node.name)).toEqual([
                'Events',
                'Threat type'
            ]);

            component.searchControl.setValue('Action');
            await vi.runOnlyPendingTimersAsync();

            expect(component.treeControl.filterModel.selected.map((node) => node.name)).toEqual(['Events', 'Action']);
        });

        it('should highlight the caption matched by the search', async () => {
            vi.useFakeTimers();

            setTemplate();
            fixture.componentInstance.activeFilter = createFilter([createPipe({ name: 'test', value: null })]);
            fixture.detectChanges();
            await renderPanel();

            getPipeComponent().searchControl.setValue('category.generic');
            await vi.runOnlyPendingTimersAsync();
            fixture.detectChanges();

            const caption = getOption('threat').getHostElement().querySelector('.kbq-option-caption')!;

            expect(caption.querySelector('mark.kbq-highlight-background')!.textContent).toBe('category.generic');
        });

        it('should let valueTemplate own the node content and hide the caption from search', async () => {
            vi.useFakeTimers();

            setTemplate(fixture.componentInstance.optionTemplate());
            fixture.componentInstance.activeFilter = createFilter([createPipe({ name: 'test', value: null })]);
            fixture.detectChanges();
            await renderPanel();

            const option = getOption('threat');
            const customContent = option.getHostElement().querySelector('.custom-tree-option')!;

            expect(customContent.textContent!.replace(/\s+/g, ' ').trim()).toBe(
                'Threat type / category.generic / TestTreeSelect'
            );
            expect(option.getHostElement().querySelector('.kbq-option-caption')).toBeNull();
            expect(option.getLabel()).toBe('Threat type');

            expect(option.getHostElement().querySelector('.custom-tree-option__badge')!.textContent).toBe('B1');

            // No query yet: the search context is null and renders empty.
            expect(option.getHostElement().querySelector('.custom-tree-option__search')!.textContent).toBe('');

            getPipeComponent().searchControl.setValue('Threat');
            await vi.runOnlyPendingTimersAsync();
            fixture.detectChanges();

            expect(getOption('threat').getHostElement().querySelector('.custom-tree-option__search')!.textContent).toBe(
                'Threat'
            );

            // The branch node also receives the source node and the query.
            expect(getOption('events').getHostElement().querySelector('.custom-tree-option__search')!.textContent).toBe(
                'Threat'
            );

            getPipeComponent().searchControl.setValue('category.generic');
            await vi.runOnlyPendingTimersAsync();

            expect(getPipeComponent().treeControl.filterModel.selected).toEqual([]);
        });

        it('should forward multilineOptions to the panel', async () => {
            vi.useFakeTimers();

            setTemplate(undefined, true);
            fixture.componentInstance.activeFilter = createFilter([createPipe({ name: 'test', value: null })]);
            fixture.detectChanges();
            await renderPanel();

            const panel = document.querySelector<HTMLElement>('.kbq-pipe-tree-select__panel')!;

            expect(panel.classList).toContain('kbq-pipe-tree-select__panel_multiline');
        });
    });

    describe('searchControl', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should filter tree nodes when search value changes', async () => {
            vi.useFakeTimers();

            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: null, search: true })
            ]);
            fixture.detectChanges();

            const component = getPipeComponent();
            const applyFilterSpy = vi.spyOn(component.treeControl, 'applyFilter');

            component.searchControl.setValue('Admin');
            await vi.runOnlyPendingTimersAsync();

            expect(applyFilterSpy).toHaveBeenCalledWith('Admin');
        });
    });

    describe('name resolution', () => {
        const translations = signal<Record<string, string>>({
            'filters.status': 'Status',
            'filters.active': 'Active'
        });

        const resolver = vi.fn<KbqFilterBarNameResolver>(({ key, fallback }) => translations()[key] ?? fallback);

        const keyedTree: KbqTreeSelectNode[] = [
            {
                name: 'Status',
                nameKey: 'filters.status',
                value: 'status',
                children: [{ name: 'Active', nameKey: 'filters.active', value: 'active', children: null }]
            }
        ];

        beforeEach(() => {
            translations.set({ 'filters.status': 'Status', 'filters.active': 'Active' });

            TestBed.configureTestingModule({
                imports: [KbqFilterBarModule, TestComponent],
                providers: [kbqFilterBarNameResolverProvider(resolver)]
            })
                .overrideComponent(KbqPipeTreeSelectComponent, {
                    set: {
                        providers: [{ provide: KbqBasePipe, useExisting: KbqPipeTreeSelectComponent }]
                    }
                })
                .compileComponents();

            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        const pipe = (): KbqPipeTreeSelectComponent => getPipeComponent();

        it('should resolve node names through the resolver and update without changing selection', () => {
            fixture.componentInstance.pipeTemplates = [
                {
                    name: 'TreeSelect',
                    id: PIPE_TEMPLATE_ID,
                    type: KbqPipeTypes.TreeSelect,
                    values: keyedTree,
                    cleanable: false,
                    removable: false,
                    disabled: false
                }
            ];
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: 'status' })]);
            fixture.detectChanges();

            const component = pipe();
            const statusNode = component.treeControl.dataNodes.find((node) => node.value === 'status')!;

            expect(component.treeControl.getViewValue(statusNode)).toBe('Status');

            const original = component.data.value;

            translations.set({ 'filters.status': 'Stato', 'filters.active': 'Attivo' });
            fixture.detectChanges();

            expect(component.treeControl.getViewValue(statusNode)).toBe('Stato');
            expect(component.data.value).toBe(original);
        });

        it('should keep the stored fallback for unkeyed nodes without invoking the resolver', () => {
            fixture.componentInstance.pipeTemplates = [
                {
                    name: 'TreeSelect',
                    id: PIPE_TEMPLATE_ID,
                    type: KbqPipeTypes.TreeSelect,
                    values: [{ name: 'Plain', value: 'plain', children: null }],
                    cleanable: false,
                    removable: false,
                    disabled: false
                }
            ];
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: 'plain' })]);
            fixture.detectChanges();

            const component = pipe();
            const node = component.treeControl.dataNodes.find((item) => item.value === 'plain')!;

            expect(component.treeControl.getViewValue(node)).toBe('Plain');
            expect(resolver).not.toHaveBeenCalled();
        });
    });
});

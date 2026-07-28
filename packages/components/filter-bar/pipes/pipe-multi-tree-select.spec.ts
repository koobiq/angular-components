import { FocusMonitor } from '@angular/cdk/a11y';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ChangeDetectorRef, Component, DebugElement, inject } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KBQ_LOCALE_SERVICE } from '@koobiq/components/core';
import {
    KBQ_FILTER_BAR_DEFAULT_CONFIGURATION,
    kbqBuildTree,
    KbqFilter,
    KbqFilterBar,
    KbqFilterBarConfiguration,
    KbqFilterBarModule,
    KbqPipe,
    KbqPipeTemplate,
    KbqPipeTypes,
    KbqTreeSelectNode
} from '@koobiq/components/filter-bar';
import { kbqTreeSelectAllValue } from '@koobiq/components/tree';
import { BehaviorSubject } from 'rxjs';
import { KbqBasePipe } from './base-pipe';
import { KbqPipeMultiTreeSelectComponent } from './pipe-multi-tree-select';
import { registerPipeStatesTests } from './pipe-states.spec-helper';

const DEV_DATA_OBJECT = {
    'No roles': 'value 0',
    'Management and Configuration': {
        Administrator: 'value 1',
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

const PIPE_TEMPLATE_ID = 'TestMultiTreeSelect';

const createPipe = (overrides: Partial<KbqPipe>): KbqPipe => ({
    name: 'test',
    id: PIPE_TEMPLATE_ID,
    type: KbqPipeTypes.MultiTreeSelect,
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
        <kbq-filter-bar
            [pipeTemplates]="pipeTemplates"
            [selectedAllEqualsSelectedNothing]="selectedAllEqualsSelectedNothing"
            [(filter)]="activeFilter"
        >
            @for (pipe of activeFilter?.pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }
            <kbq-pipe-add />
            <kbq-filter-reset />
        </kbq-filter-bar>
    `
})
class TestComponent {
    readonly changeDetectorRef = inject(ChangeDetectorRef);

    selectedAllEqualsSelectedNothing = true;

    activeFilter: KbqFilter | null = null;

    pipeTemplates: KbqPipeTemplate[] = [
        {
            name: 'MultiTreeSelect',
            id: PIPE_TEMPLATE_ID,
            type: KbqPipeTypes.MultiTreeSelect,
            values: TREE_DATA,
            cleanable: false,
            removable: false,
            disabled: false
        }
    ];
}

describe('KbqPipeMultiTreeSelectComponent', () => {
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
            imports: [NoopAnimationsModule, KbqFilterBarModule, TestComponent]
        })
            .overrideComponent(KbqPipeMultiTreeSelectComponent, {
                set: {
                    providers: [{ provide: KbqBasePipe, useExisting: KbqPipeMultiTreeSelectComponent }]
                }
            })
            .compileComponents();
    });

    const getPipeComponent = (index: number = 0): KbqPipeMultiTreeSelectComponent => {
        const pipes = fixture.debugElement.queryAll(By.css('kbq-pipe-multi-tree-select'));

        return pipes[index].componentInstance;
    };

    const getFilterBar = (): KbqFilterBar => {
        return filterBarDebugElement.componentInstance;
    };

    const openSelect = (index: number = 0) => {
        const pipe = getPipeComponent(index);

        pipe.select().open();
        fixture.detectChanges();
    };

    registerPipeStatesTests({
        label: 'MultiTreeSelect',
        pipeClass: 'kbq-pipe__multi-tree-select',
        createPipe,
        createFilter,
        nonEmptyValue: () => ['value 0'],
        createContext: () => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));

            return { fixture, filterBar: filterBarDebugElement };
        }
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

        it('should be empty when value is empty array', () => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [] })
            ]);
            fixture.detectChanges();

            expect(getPipeComponent().isEmpty).toBe(true);
        });

        it('should not be empty when value has items', () => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: ['value 0'] })
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

        it('should return internalSelected when selectedAllEqualsSelectedNothing is true', () => {
            fixture.componentInstance.selectedAllEqualsSelectedNothing = true;
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: ['value 0', 'value 2'] })
            ]);
            fixture.detectChanges();

            const component = getPipeComponent();

            expect(component.selected).toEqual(['value 0', 'value 2']);
        });

        it('should return data.value when selectedAllEqualsSelectedNothing is false', () => {
            fixture.componentInstance.selectedAllEqualsSelectedNothing = false;
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: ['value 0'], selectedAllEqualsSelectedNothing: false })
            ]);
            fixture.detectChanges();

            const component = getPipeComponent();

            expect(component.selected).toEqual(['value 0']);
        });
    });

    describe('selectAllCheckboxState', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should return unchecked when no options selected', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [], selectAll: true })
            ]);
            fixture.detectChanges();
            flush();

            expect(getPipeComponent().selectAllCheckboxState).toBe('unchecked');
        }));

        it('should return checked when all options selected', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [], selectAll: true })
            ]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            const component = getPipeComponent();

            component.toggleSelectAllNode();
            flush();
            fixture.detectChanges();

            expect(component.allOptionsSelected).toBe(true);
            expect(component.selectAllCheckboxState).toBe('checked');
        }));

        it('should return indeterminate when some options selected', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: ['value 0'], selectAll: true })
            ]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            const component = getPipeComponent();

            expect(component.select().selected.length).toBeGreaterThan(0);
            expect(component.allOptionsSelected).toBe(false);
            expect(component.selectAllCheckboxState).toBe('indeterminate');
        }));
    });

    describe('onSelect', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should emit onChangePipe event on selection', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: ['value 0'] })
            ]);
            fixture.detectChanges();

            const filterBar = getFilterBar();
            const spy = jest.fn();

            filterBar.onChangePipe.subscribe(spy);

            openSelect();
            flush();
            fixture.detectChanges();

            const component = getPipeComponent();

            component.onSelect({ value: { data: component.treeControl.dataNodes[0], selected: true } });
            flush();
            fixture.detectChanges();

            expect(spy).toHaveBeenCalled();
        }));
    });

    describe('toggleSelectAllNode', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should select all nodes when none selected', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [], selectAll: true })
            ]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            const component = getPipeComponent();

            component.toggleSelectAllNode();
            flush();
            fixture.detectChanges();

            expect(component.tree().selectionModel.selected.length).toBeGreaterThan(0);
        }));

        it('should deselect all nodes when all selected', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [], selectAll: true })
            ]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            const component = getPipeComponent();

            component.toggleSelectAllNode();
            flush();
            fixture.detectChanges();

            expect(component.allOptionsSelected).toBe(true);

            component.toggleSelectAllNode();
            flush();
            fixture.detectChanges();

            expect(component.tree().selectionModel.selected.length).toBe(0);
        }));

        it('should set data.value to empty when selectedAllEqualsSelectedNothing and all toggled on', fakeAsync(() => {
            fixture.componentInstance.selectedAllEqualsSelectedNothing = true;
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [], selectAll: true })
            ]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            const component = getPipeComponent();

            component.toggleSelectAllNode();
            flush();
            fixture.detectChanges();

            expect(component.allOptionsSelected).toBe(true);
            expect(component.selectedAllEqualsSelectedNothing).toBe(true);
            expect(component.data.value).toEqual([]);
        }));
    });

    describe('updateTemplates', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should populate dataSource from pipeTemplates', () => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [] })
            ]);
            fixture.detectChanges();

            const component = getPipeComponent();

            expect(component.dataSource.data.length).toBe(TREE_DATA.length);
        });

        it('should prepend selectAll node when data.selectAll is true', () => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [], selectAll: true })
            ]);
            fixture.detectChanges();

            const component = getPipeComponent();
            const firstNode = component.dataSource.data[0];

            expect(firstNode.value).toBe(kbqTreeSelectAllValue);
        });

        it('should not prepend selectAll node when data.selectAll is false', () => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [], selectAll: false })
            ]);
            fixture.detectChanges();

            const component = getPipeComponent();
            const firstNode = component.dataSource.data[0];

            expect(firstNode.value).not.toBe(kbqTreeSelectAllValue);
        });
    });

    describe('onClear', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should set value to null', () => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: ['value 0', 'value 2'] })
            ]);
            fixture.detectChanges();

            const component = getPipeComponent();

            component.onClear();

            expect(component.data.value).toBeNull();
        });

        it('should emit onClearPipe event', () => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: ['value 0'] })
            ]);
            fixture.detectChanges();

            const filterBar = getFilterBar();
            const spy = jest.fn();

            filterBar.onClearPipe.subscribe(spy);

            getPipeComponent().onClear();

            expect(spy).toHaveBeenCalled();
        });

        it('should emit onChangePipe event', () => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: ['value 0'] })
            ]);
            fixture.detectChanges();

            const filterBar = getFilterBar();
            const spy = jest.fn();

            filterBar.onChangePipe.subscribe(spy);

            getPipeComponent().onClear();

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('onOpen / onClose', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should expand all tree nodes on open', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [] })
            ]);
            fixture.detectChanges();

            const component = getPipeComponent();
            const expandAllSpy = jest.spyOn(component.treeControl, 'expandAll');

            component.onOpen();

            expect(expandAllSpy).toHaveBeenCalled();
        }));

        it('should update internalSelected on close when all options selected', fakeAsync(() => {
            fixture.componentInstance.selectedAllEqualsSelectedNothing = true;
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: ['value 0'], selectAll: true })
            ]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            const component = getPipeComponent();

            // Select every option. Under selectedAllEqualsSelectedNothing this collapses data.value
            // to [], while internalSelected still holds the previously committed value (stale).
            component.toggleSelectAllNode();
            flush();
            fixture.detectChanges();

            expect(component.allOptionsSelected).toBe(true);
            expect(component.data.value).toEqual([]);
            // internalSelected is not refreshed during selection, so `selected` is still the old value.
            expect(component.selected).toEqual(['value 0']);

            // onClose refreshes internalSelected from the current data.value.
            component.onClose();
            flush();

            expect(component.selected).toEqual([]);
        }));

        it('should restore focus to the trigger button on close', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [], selectAll: true })
            ]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            const focusViaSpy = jest.spyOn(TestBed.inject(FocusMonitor), 'focusVia');

            getPipeComponent().onClose();
            flush();

            expect(focusViaSpy).toHaveBeenCalledWith(expect.any(HTMLButtonElement), expect.anything());
        }));
    });

    describe('numberOfSelectedLeaves', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should count selected items excluding selectAll value', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: ['value 0', 'value 2'], selectAll: true })
            ]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            const component = getPipeComponent();
            const selectedCount = component.numberOfSelectedLeaves;

            const selectedWithoutSelectAll = component
                .select()
                .selected.filter(({ value }) => value !== kbqTreeSelectAllValue).length;

            expect(selectedCount).toBe(selectedWithoutSelectAll);
        }));
    });

    describe('hasChild / isNodeSelectAll', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [], selectAll: true })
            ]);
            fixture.detectChanges();
        });

        it('should return true for expandable nodes', () => {
            const component = getPipeComponent();
            const expandableNode = { expandable: true, name: 'parent', value: 'v', level: 0 };

            expect(component.hasChild(0, expandableNode)).toBe(true);
        });

        it('should return false for leaf nodes', () => {
            const component = getPipeComponent();
            const leafNode = { expandable: false, name: 'leaf', value: 'v', level: 1 };

            expect(component.hasChild(0, leafNode)).toBe(false);
        });

        it('should return true for selectAll node', () => {
            const component = getPipeComponent();
            const selectAllNode = { value: kbqTreeSelectAllValue, name: 'all', level: 0, expandable: false };

            expect(component.isNodeSelectAll(0, selectAllNode)).toBe(true);
        });

        it('should return false for regular nodes', () => {
            const component = getPipeComponent();
            const regularNode = { value: 'value 0', name: 'test', level: 0, expandable: false };

            expect(component.isNodeSelectAll(0, regularNode)).toBe(false);
        });
    });

    describe('searchControl', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should filter tree nodes when search value changes', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [], search: true })
            ]);
            fixture.detectChanges();

            const component = getPipeComponent();
            const filterNodesSpy = jest.spyOn(component.treeControl, 'filterNodes');

            component.searchControl.setValue('Admin');
            flush();

            expect(filterNodesSpy).toHaveBeenCalledWith('Admin');
        }));
    });

    describe('selectAllHandler', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should prevent default and toggle select all', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [], selectAll: true })
            ]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            const component = getPipeComponent();
            const toggleSpy = jest.spyOn(component, 'toggleSelectAllNode');
            const event = new KeyboardEvent('keydown');
            const preventSpy = jest.spyOn(event, 'preventDefault');

            component.selectAllHandler(event);

            expect(preventSpy).toHaveBeenCalled();
            expect(toggleSpy).toHaveBeenCalled();
        }));
    });

    // The select-all node is synthesized by `updateTemplates`, which only re-runs when `pipeTemplates`
    // change — so its label must be resolved on read (via `getViewValue`) rather than baked into the node,
    // otherwise it alone stays in the old locale while every other string in the panel follows along.
    describe('select-all label localization', () => {
        class MockLocaleService {
            readonly changes = new BehaviorSubject<string>('locale-a');

            private readonly params: Record<string, KbqFilterBarConfiguration> = {
                'locale-a': {
                    ...KBQ_FILTER_BAR_DEFAULT_CONFIGURATION,
                    pipe: { ...KBQ_FILTER_BAR_DEFAULT_CONFIGURATION.pipe, selectAll: 'Select all A' }
                },
                'locale-b': {
                    ...KBQ_FILTER_BAR_DEFAULT_CONFIGURATION,
                    pipe: { ...KBQ_FILTER_BAR_DEFAULT_CONFIGURATION.pipe, selectAll: 'Select all B' }
                }
            };

            getParams(): KbqFilterBarConfiguration {
                return this.params[this.changes.value];
            }

            setLocale(id: string): void {
                this.changes.next(id);
            }
        }

        it('should re-render the select-all node when the locale service emits a change', async () => {
            const localeService = new MockLocaleService();

            TestBed.configureTestingModule({
                providers: [{ provide: KBQ_LOCALE_SERVICE, useValue: localeService }]
            });

            const overlayContainerElement = TestBed.inject(OverlayContainer).getContainerElement();

            fixture = TestBed.createComponent(TestComponent);
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [], selectAll: true })
            ]);

            // `autoDetectChanges` only — a manual `detectChanges()` after `setLocale` below would force a
            // check regardless of whether the label is resolved live, which is the thing under test.
            fixture.autoDetectChanges();
            await fixture.whenStable();

            getPipeComponent().select().open();
            await fixture.whenStable();

            const getSelectAllOption = () => overlayContainerElement.querySelector('kbq-tree-option');

            expect(getSelectAllOption()?.textContent?.trim()).toBe('Select all A');

            localeService.setLocale('locale-b');
            await fixture.whenStable();

            expect(getSelectAllOption()?.textContent?.trim()).toBe('Select all B');
        });
    });

    describe('lockedValues', () => {
        // `kbqBuildTree` keeps a leaf's raw value and gives a branch the nested object it was built from,
        // so a branch is locked by passing that object.
        const LOCKED_LEAF = 'value 0';
        const LOCKED_BRANCH = DEV_DATA_OBJECT['MP 10'];
        const BRANCH_LEAVES = ['value 4', 'value 5', 'value 6'];

        const setLockedTemplate = (lockedValues: unknown[]) => {
            fixture.componentInstance.pipeTemplates = [
                {
                    name: 'MultiTreeSelect',
                    id: PIPE_TEMPLATE_ID,
                    type: KbqPipeTypes.MultiTreeSelect,
                    values: TREE_DATA,
                    lockedValues,
                    cleanable: false,
                    removable: false,
                    disabled: false
                }
            ];
        };

        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
            setLockedTemplate([LOCKED_LEAF]);
        });

        it('should report the locked node as disabled through the tree control', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ name: 'test', value: null })]);
            fixture.detectChanges();

            const { treeControl } = getPipeComponent();
            const isDisabled = (value: unknown) =>
                treeControl.isDisabled(treeControl.dataNodes.find((node) => node.value === value)!);

            expect(isDisabled(LOCKED_LEAF)).toBe(true);
            expect(isDisabled('value 2')).toBe(false);
        });

        it('should render the locked option as disabled and selected', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ name: 'test', value: null })]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            const locked = getPipeComponent()
                .tree()
                .renderedOptions.find((option) => option.value === LOCKED_LEAF)!;

            expect(locked.disabled).toBe(true);
            expect(locked.selected).toBe(true);
        }));

        it('should append the missing locked values without emitting a change', () => {
            const changeSpy = jest.fn();

            fixture.componentInstance.activeFilter = createFilter([createPipe({ name: 'test', value: [] })]);
            fixture.detectChanges();

            getFilterBar().onChangePipe.subscribe(changeSpy);
            fixture.detectChanges();

            expect(getPipeComponent().data.value).toEqual([LOCKED_LEAF]);
            expect(changeSpy).not.toHaveBeenCalled();
        });

        it('should leave only the locked values on clear', () => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [LOCKED_LEAF, 'value 2'] })
            ]);
            fixture.detectChanges();

            const component = getPipeComponent();

            component.onClear();

            expect(component.data.value).toEqual([LOCKED_LEAF]);
        });

        it('should emit the cleared value carrying the locked values', () => {
            const clearSpy = jest.fn();

            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [LOCKED_LEAF, 'value 2'] })
            ]);
            fixture.detectChanges();

            getFilterBar().onClearPipe.subscribe(clearSpy);

            getPipeComponent().onClear();

            expect(clearSpy).toHaveBeenCalledWith(expect.objectContaining({ value: [LOCKED_LEAF] }));
        });

        it('should keep the locked nodes selected when all nodes are deselected', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [], selectAll: true })
            ]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            const component = getPipeComponent();

            component.toggleSelectAllNode();
            flush();
            fixture.detectChanges();

            expect(component.allOptionsSelected).toBe(true);

            component.toggleSelectAllNode();
            flush();
            fixture.detectChanges();

            expect(component.select().selectedValues).toEqual([LOCKED_LEAF]);
            expect(component.data.value).toEqual([LOCKED_LEAF]);
        }));

        it('should expose no built-in select cleaner, which would bypass onClear', () => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [LOCKED_LEAF, 'value 2'], cleanable: true })
            ]);
            fixture.detectChanges();

            const select = getPipeComponent().select();

            // `KbqTreeSelect.clearValue()` empties the selection model directly, bypassing the pipe's
            // `onClear()` and taking the locked values with it — hence no `kbqSelectCleaner` in the
            // template, which is what leaves `canShowCleaner` permanently false.
            expect(select.cleaner()).toBeUndefined();
            expect(select.canShowCleaner).toBe(false);
        });

        it('should keep the "all selected" sentinel across a later template update', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [], selectAll: true })
            ]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            const component = getPipeComponent();

            component.toggleSelectAllNode();
            flush();
            fixture.detectChanges();

            expect(component.data.value).toEqual([]);

            // A fresh `pipeTemplates` reference re-emits `internalTemplatesChanges`. The locked values must
            // not be folded into `[]` here — under "all selected = nothing selected" it stands for a full
            // selection, so merging would silently downgrade it to "only the locked values selected".
            setLockedTemplate([LOCKED_LEAF]);
            fixture.detectChanges();

            expect(component.data.value).toEqual([]);
        }));

        it('should read as empty when only the locked values are selected', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ name: 'test', value: [LOCKED_LEAF] })]);
            fixture.detectChanges();

            const component = getPipeComponent();

            expect(component.isEmpty).toBe(true);
            expect(component.showRemoveButton).toBe(false);
        });

        it('should read as not empty once an unlocked value is selected', () => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [LOCKED_LEAF, 'value 2'] })
            ]);
            fixture.detectChanges();

            expect(getPipeComponent().isEmpty).toBe(false);
        });

        it('should keep the select-all checkbox unchecked when only the locked values are selected', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [LOCKED_LEAF], selectAll: true })
            ]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            expect(getPipeComponent().selectAllCheckboxState).toBe('unchecked');
        }));

        it('should lock the whole subtree of a locked branch', () => {
            setLockedTemplate([LOCKED_BRANCH]);
            fixture.componentInstance.activeFilter = createFilter([createPipe({ name: 'test', value: null })]);
            fixture.detectChanges();

            const component = getPipeComponent();
            const { treeControl } = component;

            BRANCH_LEAVES.forEach((value) => {
                expect(treeControl.isDisabled(treeControl.dataNodes.find((node) => node.value === value)!)).toBe(true);
            });

            expect(component.data.value).toEqual([LOCKED_BRANCH, ...BRANCH_LEAVES]);
        });

        it('should keep a locked child selected when its parent is deselected', fakeAsync(() => {
            setLockedTemplate(['value 4']);
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [LOCKED_BRANCH, ...BRANCH_LEAVES] })
            ]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            const component = getPipeComponent();
            const parent = component.tree().renderedOptions.find((option) => option.value === LOCKED_BRANCH)!;

            component.onSelect({ value: parent });
            flush();
            fixture.detectChanges();

            expect(component.data.value).toContain('value 4');
            expect(component.data.value).not.toContain('value 5');
        }));
    });
});

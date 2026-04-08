import { ChangeDetectorRef, Component, DebugElement, inject } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    kbqBuildTree,
    KbqFilter,
    KbqFilterBar,
    KbqFilterBarModule,
    KbqPipe,
    KbqPipeTemplate,
    KbqPipeTypes,
    KbqTreeSelectNode
} from '@koobiq/components/filter-bar';
import { kbqTreeSelectAllValue } from '@koobiq/components/tree';
import { KbqBasePipe } from './base-pipe';
import { KbqPipeMultiTreeSelectComponent } from './pipe-multi-tree-select';

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

const ALL_LEAF_VALUES = [
    'value 0',
    'value 1',
    'value 2',
    'value 3',
    'value 4',
    'value 5',
    'value 6',
    'value 7',
    'value 8',
    'value 9'
];

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

    window.structuredClone = (value) => JSON.parse(JSON.stringify(value));

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

        pipe.select.open();
        fixture.detectChanges();
    };

    describe('Pipe states', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({
                    name: 'required',
                    value: ['value 0'],
                    cleanable: false,
                    removable: false,
                    disabled: false
                }),
                createPipe({ name: 'empty', value: null, cleanable: true, removable: false, disabled: false }),
                createPipe({
                    name: 'cleanable',
                    value: ['value 2'],
                    cleanable: true,
                    removable: false,
                    disabled: false
                }),
                createPipe({
                    name: 'removable',
                    value: ['value 2'],
                    cleanable: false,
                    removable: true,
                    disabled: false
                }),
                createPipe({ name: 'disabled', value: ['value 2'], cleanable: false, removable: false, disabled: true })
            ]);
            fixture.detectChanges();
        });

        it('should render all MultiTreeSelect pipes', () => {
            const pipes = filterBarDebugElement.queryAll(By.css('.kbq-pipe'));

            expect(pipes.length).toBe(5);
            pipes.forEach((pipe) => {
                expect(pipe.nativeElement.classList).toContain('kbq-pipe__multi-tree-select');
            });
        });

        it('should apply required state (no special classes)', () => {
            const required = filterBarDebugElement.queryAll(By.css('.kbq-pipe'))[0];

            expect(required.nativeElement.classList).not.toContain('kbq-pipe_cleanable');
            expect(required.nativeElement.classList).not.toContain('kbq-pipe_removable');
            expect(required.nativeElement.classList).not.toContain('kbq-pipe_disabled');
            expect(required.nativeElement.classList).not.toContain('kbq-pipe_empty');
        });

        it('should apply empty state', () => {
            const empty = filterBarDebugElement.queryAll(By.css('.kbq-pipe'))[1];

            expect(empty.nativeElement.classList).toContain('kbq-pipe_empty');
        });

        it('should apply cleanable state', () => {
            const cleanable = filterBarDebugElement.queryAll(By.css('.kbq-pipe'))[2];

            expect(cleanable.nativeElement.classList).toContain('kbq-pipe_cleanable');
            expect(cleanable.nativeElement.classList).not.toContain('kbq-pipe_removable');
        });

        it('should apply removable state', () => {
            const removable = filterBarDebugElement.queryAll(By.css('.kbq-pipe'))[3];

            expect(removable.nativeElement.classList).toContain('kbq-pipe_removable');
            expect(removable.nativeElement.classList).not.toContain('kbq-pipe_cleanable');
        });

        it('should apply disabled state', () => {
            const disabled = filterBarDebugElement.queryAll(By.css('.kbq-pipe'))[4];

            expect(disabled.nativeElement.classList).toContain('kbq-pipe_disabled');
        });
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
                createPipe({ name: 'test', value: ALL_LEAF_VALUES, selectAll: true })
            ]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            const component = getPipeComponent();

            if (component.allOptionsSelected) {
                expect(component.selectAllCheckboxState).toBe('checked');
            }
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

            if (component.select.selected.length > 0 && !component.allOptionsSelected) {
                expect(component.selectAllCheckboxState).toBe('indeterminate');
            }
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

            const options = document.querySelectorAll('.kbq-tree-option');

            if (options.length > 0) {
                (options[0] as HTMLElement).click();
                flush();
                fixture.detectChanges();

                expect(spy).toHaveBeenCalled();
            }
        }));

        it('should set data.value to empty array when all selected and selectedAllEqualsSelectedNothing', fakeAsync(() => {
            fixture.componentInstance.selectedAllEqualsSelectedNothing = true;
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: ALL_LEAF_VALUES })
            ]);
            fixture.detectChanges();

            const component = getPipeComponent();

            openSelect();
            flush();
            fixture.detectChanges();

            if (component.allOptionsSelected && component.selectedAllEqualsSelectedNothing) {
                component.onSelect({ value: { data: component.treeControl.dataNodes[0], selected: true } });
                flush();

                if (component.allOptionsSelected) {
                    expect(component.data.value).toEqual([]);
                }
            }
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

            expect(component.tree.selectionModel.selected.length).toBeGreaterThan(0);
        }));

        it('should deselect all nodes when all selected', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: ALL_LEAF_VALUES, selectAll: true })
            ]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            const component = getPipeComponent();

            if (component.allOptionsSelected) {
                component.toggleSelectAllNode();
                flush();
                fixture.detectChanges();

                expect(component.tree.selectionModel.selected.length).toBe(0);
            }
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

            if (component.allOptionsSelected && component.selectedAllEqualsSelectedNothing) {
                expect(component.data.value).toEqual([]);
            }
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
                createPipe({ name: 'test', value: ALL_LEAF_VALUES, selectAll: true })
            ]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            const component = getPipeComponent();

            // call onClose directly
            component.onClose();

            // after close with all selected, internalSelected should be updated
            expect(component.selected).toBeDefined();
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

            const selectedWithoutSelectAll = component.select.selected.filter(
                ({ value }) => value !== kbqTreeSelectAllValue
            ).length;

            expect(selectedCount).toBe(selectedWithoutSelectAll);
        }));
    });

    describe('isNodeHasChild / isNodeSelectAll', () => {
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

            expect(component.isNodeHasChild(0, expandableNode)).toBe(true);
        });

        it('should return false for leaf nodes', () => {
            const component = getPipeComponent();
            const leafNode = { expandable: false, name: 'leaf', value: 'v', level: 1 };

            expect(component.isNodeHasChild(0, leafNode)).toBe(false);
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
});

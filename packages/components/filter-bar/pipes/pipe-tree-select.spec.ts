import { FocusMonitor } from '@angular/cdk/a11y';
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
    KbqSelectValue,
    KbqTreeSelectNode
} from '@koobiq/components/filter-bar';
import { KbqTreeOption } from '@koobiq/components/tree';
import { KbqBasePipe } from './base-pipe';
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
    `
})
class TestComponent {
    readonly changeDetectorRef = inject(ChangeDetectorRef);

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
            imports: [NoopAnimationsModule, KbqFilterBarModule, TestComponent]
        })
            .overrideComponent(KbqPipeTreeSelectComponent, {
                set: {
                    providers: [{ provide: KbqBasePipe, useExisting: KbqPipeTreeSelectComponent }]
                }
            })
            .compileComponents();
    });

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

        it('should emit onChangePipe event on selection', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: null })
            ]);
            fixture.detectChanges();

            const filterBar = getFilterBar();
            const component = getPipeComponent();
            const spy = jest.fn();

            filterBar.onChangePipe.subscribe(spy);

            component.onSelect({ value: SINGLE_VALUE } as KbqTreeOption);
            flush();

            expect(spy).toHaveBeenCalled();
        }));

        it('should set data.value to selected item value', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: null })
            ]);
            fixture.detectChanges();

            const component = getPipeComponent();
            const mockItem = { value: SINGLE_VALUE } as KbqTreeOption;

            component.onSelect(mockItem);
            flush();

            expect(component.data.value).toEqual(SINGLE_VALUE);
        }));

        it('should close select after selection', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: null })
            ]);
            fixture.detectChanges();

            const component = getPipeComponent();
            const closeSpy = jest.spyOn(component.select(), 'close');
            const mockItem = { value: SINGLE_VALUE } as KbqTreeOption;

            component.onSelect(mockItem);
            flush();

            expect(closeSpy).toHaveBeenCalled();
        }));

        it('should restore focus to the trigger button after selection', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: null })
            ]);
            fixture.detectChanges();

            const focusViaSpy = jest.spyOn(TestBed.inject(FocusMonitor), 'focusVia');

            getPipeComponent().onSelect({ value: SINGLE_VALUE } as KbqTreeOption);
            flush();

            expect(focusViaSpy).toHaveBeenCalledWith(expect.any(HTMLButtonElement), expect.anything());
        }));
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
            const spy = jest.fn();

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
            const spy = jest.fn();

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
            const expandAllSpy = jest.spyOn(component.treeControl, 'expandAll');

            component.onOpen();

            expect(expandAllSpy).toHaveBeenCalled();
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

    describe('searchControl', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should filter tree nodes when search value changes', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: null, search: true })
            ]);
            fixture.detectChanges();

            const component = getPipeComponent();
            const filterNodesSpy = jest.spyOn(component.treeControl, 'filterNodes');

            component.searchControl.setValue('Admin');
            flush();

            expect(filterNodesSpy).toHaveBeenCalledWith('Admin');
        }));
    });
});

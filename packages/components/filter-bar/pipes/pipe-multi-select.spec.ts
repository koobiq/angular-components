import { FocusMonitor } from '@angular/cdk/a11y';
import { ChangeDetectorRef, Component, DebugElement, inject } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    KbqFilter,
    KbqFilterBar,
    KbqFilterBarModule,
    KbqPipe,
    KbqPipeTemplate,
    KbqPipeTypes,
    KbqSelectValue
} from '@koobiq/components/filter-bar';
import { KbqBasePipe } from './base-pipe';
import { KbqPipeMultiSelectComponent } from './pipe-multi-select';
import { registerPipeStatesTests } from './pipe-states.spec-helper';

const SELECT_VALUES = [
    { id: 1, name: 'Option 1', value: 'value1' },
    { id: 2, name: 'Option 2', value: 'value2' },
    { id: 3, name: 'Option 3', value: 'value3' },
    { id: 4, name: 'Option 4', value: 'value4' },
    { id: 5, name: 'Option 5', value: 'value5' }
];

const ALL_VALUES = [...SELECT_VALUES];

const PIPE_TEMPLATE_ID = 'TestMultiSelect';

const createPipe = (overrides: Partial<KbqPipe>): KbqPipe => ({
    name: 'test',
    id: PIPE_TEMPLATE_ID,
    type: KbqPipeTypes.MultiSelect,
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
            name: 'MultiSelect',
            id: PIPE_TEMPLATE_ID,
            type: KbqPipeTypes.MultiSelect,
            values: SELECT_VALUES,
            cleanable: false,
            removable: false,
            disabled: false
        }
    ];
}

describe('KbqPipeMultiSelectComponent', () => {
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
            .overrideComponent(KbqPipeMultiSelectComponent, {
                set: {
                    providers: [{ provide: KbqBasePipe, useExisting: KbqPipeMultiSelectComponent }]
                }
            })
            .compileComponents();
    });

    const getPipeComponent = (index: number = 0): KbqPipeMultiSelectComponent => {
        const pipes = fixture.debugElement.queryAll(By.css('kbq-pipe-multi-select'));

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
        label: 'MultiSelect',
        pipeClass: 'kbq-pipe__multiselect',
        createPipe,
        createFilter,
        nonEmptyValue: () => [SELECT_VALUES[0]],
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
                createPipe({ name: 'test', value: [SELECT_VALUES[0]] })
            ]);
            fixture.detectChanges();

            expect(getPipeComponent().isEmpty).toBe(false);
        });

        it('should be empty when selectedAllEqualsSelectedNothing and all options selected', fakeAsync(() => {
            fixture.componentInstance.selectedAllEqualsSelectedNothing = true;
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: ALL_VALUES, selectAll: true })
            ]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            const component = getPipeComponent();

            expect(component.allOptionsSelected).toBe(true);
            expect(component.isEmpty).toBe(true);
        }));
    });

    describe('selected getter', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should return internalSelected when selectedAllEqualsSelectedNothing is true', () => {
            fixture.componentInstance.selectedAllEqualsSelectedNothing = true;
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [SELECT_VALUES[0], SELECT_VALUES[1]] })
            ]);
            fixture.detectChanges();

            const component = getPipeComponent();

            expect(component.selected).toEqual([SELECT_VALUES[0], SELECT_VALUES[1]]);
        });

        it('should return data.value when selectedAllEqualsSelectedNothing is false', () => {
            fixture.componentInstance.selectedAllEqualsSelectedNothing = false;
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [SELECT_VALUES[0]], selectedAllEqualsSelectedNothing: false })
            ]);
            fixture.detectChanges();

            const component = getPipeComponent();

            expect(component.selected).toEqual([SELECT_VALUES[0]]);
        });
    });

    describe('checkboxState', () => {
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

            expect(getPipeComponent().checkboxState).toBe('unchecked');
        }));

        it('should return checked when all options selected', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: ALL_VALUES, selectAll: true })
            ]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            const component = getPipeComponent();

            expect(component.allOptionsSelected).toBe(true);
            expect(component.checkboxState).toBe('checked');
        }));

        it('should return indeterminate when some options selected', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [SELECT_VALUES[0]], selectAll: true })
            ]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            const component = getPipeComponent();

            expect(component.select().selectionModel.selected.length).toBeGreaterThan(0);
            expect(component.allOptionsSelected).toBe(false);
            expect(component.checkboxState).toBe('indeterminate');
        }));
    });

    describe('onSelect', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should emit onChangePipe event on selection', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [SELECT_VALUES[0]] })
            ]);
            fixture.detectChanges();

            const filterBar = getFilterBar();
            const spy = jest.fn();

            filterBar.onChangePipe.subscribe(spy);

            openSelect();
            flush();
            fixture.detectChanges();

            const options = document.querySelectorAll('.kbq-option');

            expect(options.length).toBeGreaterThan(0);

            (options[0] as HTMLElement).click();
            flush();
            fixture.detectChanges();

            expect(spy).toHaveBeenCalled();
        }));

        it('should set data.value to empty array when all selected and selectedAllEqualsSelectedNothing', fakeAsync(() => {
            fixture.componentInstance.selectedAllEqualsSelectedNothing = true;
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: ALL_VALUES })
            ]);
            fixture.detectChanges();

            const component = getPipeComponent();

            openSelect();
            flush();
            fixture.detectChanges();

            expect(component.allOptionsSelected).toBe(true);
            expect(component.selectedAllEqualsSelectedNothing).toBe(true);
            component.onSelect([...ALL_VALUES]);
            flush();
            expect(component.data.value).toEqual([]);
        }));
    });

    describe('toggleSelectionAll', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should select all options when none selected', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [], selectAll: true })
            ]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            const component = getPipeComponent();

            component.toggleSelectionAll();
            flush();
            fixture.detectChanges();

            expect(component.select().selectionModel.selected.length).toBeGreaterThan(0);
        }));

        it('should deselect all options when all selected', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: ALL_VALUES, selectAll: true })
            ]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            const component = getPipeComponent();

            expect(component.allOptionsSelected).toBe(true);
            component.toggleSelectionAll();
            flush();
            fixture.detectChanges();

            expect(component.select().selectionModel.selected.length).toBe(0);
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

            component.toggleSelectionAll();
            flush();
            fixture.detectChanges();

            expect(component.allOptionsSelected).toBe(true);
            expect(component.selectedAllEqualsSelectedNothing).toBe(true);
            expect(component.data.value).toEqual([]);
        }));
    });

    describe('toggleSelectionAllByEnterKey', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should call toggleSelectionAll when activeItemIndex is 0 and selectAll is true', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [], selectAll: true })
            ]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            const component = getPipeComponent();
            const toggleSpy = jest.spyOn(component, 'toggleSelectionAll');

            component.select().keyManager.setActiveItem(0);

            component.toggleSelectionAllByEnterKey();

            expect(toggleSpy).toHaveBeenCalled();
        }));

        it('should not call toggleSelectionAll when selectAll is false', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [], selectAll: false })
            ]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            const component = getPipeComponent();
            const toggleSpy = jest.spyOn(component, 'toggleSelectionAll');

            component.toggleSelectionAllByEnterKey();

            expect(toggleSpy).not.toHaveBeenCalled();
        }));
    });

    describe('onClear', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should set value to empty array', () => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [SELECT_VALUES[0], SELECT_VALUES[1]] })
            ]);
            fixture.detectChanges();

            const component = getPipeComponent();

            component.onClear();

            expect(component.data.value).toEqual([]);
        });

        it('should emit onClearPipe event', () => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [SELECT_VALUES[0]] })
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
                createPipe({ name: 'test', value: [SELECT_VALUES[0]] })
            ]);
            fixture.detectChanges();

            const filterBar = getFilterBar();
            const spy = jest.fn();

            filterBar.onChangePipe.subscribe(spy);

            getPipeComponent().onClear();

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('onClose', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should update internalSelected on close when all options selected', fakeAsync(() => {
            fixture.componentInstance.selectedAllEqualsSelectedNothing = true;
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [SELECT_VALUES[0]], selectAll: true })
            ]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            const component = getPipeComponent();

            // Select every option. Under selectedAllEqualsSelectedNothing this collapses data.value
            // to [], while internalSelected still holds the previously committed value (stale).
            component.toggleSelectionAll();
            flush();
            fixture.detectChanges();

            expect(component.allOptionsSelected).toBe(true);
            expect(component.data.value).toEqual([]);
            // internalSelected is not refreshed during selection, so `selected` is still the old value.
            expect(component.selected).toEqual([SELECT_VALUES[0]]);

            // onClose refreshes internalSelected from the current data.value.
            component.onClose();
            flush();

            expect(component.selected).toEqual([]);
        }));

        it('should restore focus to the trigger button on close', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [] })
            ]);
            fixture.detectChanges();

            const focusViaSpy = jest.spyOn(TestBed.inject(FocusMonitor), 'focusVia');

            getPipeComponent().onClose();
            flush();

            expect(focusViaSpy).toHaveBeenCalledWith(expect.any(HTMLButtonElement), expect.anything());
        }));
    });

    describe('open', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should call select.open()', () => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [] })
            ]);
            fixture.detectChanges();

            const component = getPipeComponent();
            const openSpy = jest.spyOn(component.select(), 'open');

            component.open();

            expect(openSpy).toHaveBeenCalled();
        });
    });

    describe('compareByValue', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [] })
            ]);
            fixture.detectChanges();
        });

        it('should return true when both items have same id', () => {
            const component = getPipeComponent();

            expect(component.compareByValue({ id: 1 }, { id: 1 })).toBe(true);
        });

        it('should return false when items have different ids', () => {
            const component = getPipeComponent();

            expect(component.compareByValue({ id: 1 }, { id: 2 })).toBe(false);
        });

        it('should return false when the first argument is null', () => {
            const component = getPipeComponent();

            expect(component.compareByValue(null, { id: 1 })).toBe(false);
        });

        it('should return false when the second argument is null', () => {
            const component = getPipeComponent();

            expect(component.compareByValue({ id: 1 }, null)).toBe(false);
        });

        it('should return false when both arguments are null', () => {
            const component = getPipeComponent();

            expect(component.compareByValue(null, null)).toBe(false);
        });
    });

    describe('compareWith forwarding', () => {
        const customCompare = (o1: KbqSelectValue | null | undefined, o2: KbqSelectValue | null | undefined): boolean =>
            o1?.value === o2?.value;

        // Options without `id`, used to force reliance on the custom `value`-based comparator (see the
        // 'should match selected values' test below for why).
        const idlessValues: KbqSelectValue[] = [
            { name: 'Option 1', value: 'value1' },
            { name: 'Option 2', value: 'value2' },
            { name: 'Option 3', value: 'value3' }
        ];

        const setTemplate = (values: KbqSelectValue[]) => {
            fixture.componentInstance.pipeTemplates = [
                {
                    name: 'MultiSelect',
                    id: PIPE_TEMPLATE_ID,
                    type: KbqPipeTypes.MultiSelect,
                    values,
                    compareWith: customCompare,
                    cleanable: false,
                    removable: false,
                    disabled: false
                }
            ];
        };

        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should forward a custom compareWith from the pipe template to the inner select', () => {
            setTemplate(SELECT_VALUES);
            fixture.componentInstance.activeFilter = createFilter([createPipe({ name: 'test', value: [] })]);
            fixture.detectChanges();

            expect(getPipeComponent().select().compareWith).toBe(customCompare);
        });

        it('should use the default id comparator when the template omits compareWith', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ name: 'test', value: [] })]);
            fixture.detectChanges();

            const component = getPipeComponent();

            expect(component.select().compareWith).toBe(component.compareByValue);
        });

        it('should clear a previously set compareWith when a later template update omits it', () => {
            setTemplate(SELECT_VALUES);
            fixture.componentInstance.activeFilter = createFilter([createPipe({ name: 'test', value: [] })]);
            fixture.detectChanges();

            expect(getPipeComponent().select().compareWith).toBe(customCompare);

            // A follow-up pipeTemplates update for the same pipe id that omits compareWith (e.g. new
            // id-based values) must fall back to the default comparator, not keep forwarding the stale one.
            fixture.componentInstance.pipeTemplates = [
                {
                    name: 'MultiSelect',
                    id: PIPE_TEMPLATE_ID,
                    type: KbqPipeTypes.MultiSelect,
                    values: SELECT_VALUES,
                    cleanable: false,
                    removable: false,
                    disabled: false
                }
            ];
            fixture.detectChanges();

            const component = getPipeComponent();

            expect(component.select().compareWith).toBe(component.compareByValue);
        });

        it('should forward compareWith from a later template update even when it omits values', () => {
            // First render with an id-based template (no compareWith) → default comparator.
            fixture.componentInstance.pipeTemplates = [
                {
                    name: 'MultiSelect',
                    id: PIPE_TEMPLATE_ID,
                    type: KbqPipeTypes.MultiSelect,
                    values: SELECT_VALUES,
                    cleanable: false,
                    removable: false,
                    disabled: false
                }
            ];
            fixture.componentInstance.activeFilter = createFilter([createPipe({ name: 'test', value: [] })]);
            fixture.detectChanges();

            expect(getPipeComponent().select().compareWith).toBe(getPipeComponent().compareByValue);

            // A follow-up update for the same pipe id that supplies `compareWith` without re-sending
            // `values` must still forward the comparator — it is synced independently of `values`.
            fixture.componentInstance.pipeTemplates = [
                {
                    name: 'MultiSelect',
                    id: PIPE_TEMPLATE_ID,
                    type: KbqPipeTypes.MultiSelect,
                    compareWith: customCompare,
                    cleanable: false,
                    removable: false,
                    disabled: false
                }
            ];
            fixture.detectChanges();

            expect(getPipeComponent().select().compareWith).toBe(customCompare);
        });

        it('should match selected values in the panel using the custom comparator', fakeAsync(() => {
            setTemplate(idlessValues);
            // The two selected values are distinct objects equal to the second and third options only by
            // `value`. Each selected item is resolved independently via `getCorrespondOption`/`.find`, so
            // selecting more than one id-less item catches misattribution between items — under the
            // default id comparator every id-less option compares equal and only the first ('Option 1')
            // would ever be picked, so asserting both 'Option 2' and 'Option 3' are highlighted is what
            // proves the custom `value` comparator is applied per item.
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({
                    name: 'test',
                    value: [
                        { name: 'Option 2', value: 'value2' },
                        { name: 'Option 3', value: 'value3' }
                    ]
                })
            ]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            const selectedText = Array.from(document.querySelectorAll('.kbq-option.kbq-selected')).map((el) =>
                el.textContent?.trim()
            );

            expect(selectedText).toEqual(['Option 2', 'Option 3']);
        }));
    });

    describe('selectAllHandler', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should prevent default and toggle selection all', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [], selectAll: true })
            ]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            const component = getPipeComponent();
            const toggleSpy = jest.spyOn(component, 'toggleSelectionAll');
            const event = new KeyboardEvent('keydown');
            const preventSpy = jest.spyOn(event, 'preventDefault');

            component.selectAllHandler(event);

            expect(preventSpy).toHaveBeenCalled();
            expect(toggleSpy).toHaveBeenCalled();
        }));
    });

    describe('searchControl', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should filter options by search text', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [], search: true })
            ]);
            fixture.detectChanges();

            const component = getPipeComponent();
            let lastFiltered: any[] = [];

            // Subscribe before emitting: filteredOptions is a cold merge with no replay, so the
            // subscription must be active when searchControl emits.
            component.filteredOptions.subscribe((filtered) => {
                lastFiltered = filtered;
            });

            component.searchControl.setValue('Option 1');
            flush();

            expect(lastFiltered.length).toBe(1);
            expect(lastFiltered[0].name).toBe('Option 1');
        }));

        it('should return all options when search is empty', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [], search: true })
            ]);
            fixture.detectChanges();

            const component = getPipeComponent();
            let lastFiltered: any[] = [];

            component.filteredOptions.subscribe((filtered) => {
                lastFiltered = filtered;
            });

            component.searchControl.setValue('Option 1');
            flush();
            component.searchControl.setValue('');
            flush();

            expect(lastFiltered.length).toBe(SELECT_VALUES.length);
        }));
    });

    describe('allVisibleOptionsSelected', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should return true when all visible options are selected', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: ALL_VALUES, selectAll: true })
            ]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            const component = getPipeComponent();

            expect(component.allOptionsSelected).toBe(true);
            expect(component.allVisibleOptionsSelected).toBe(true);
        }));

        it('should return false when some visible options are not selected', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [SELECT_VALUES[0]], selectAll: true })
            ]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            const component = getPipeComponent();

            expect(component.allOptionsSelected).toBe(false);
            expect(component.allVisibleOptionsSelected).toBe(false);
        }));
    });

    describe('allOptionsSelected', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should return true when all options selected', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: ALL_VALUES, selectAll: true })
            ]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            const component = getPipeComponent();

            expect(component.allOptionsSelected).toBe(true);
        }));

        it('should return false when not all options selected', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [SELECT_VALUES[0]], selectAll: true })
            ]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            const component = getPipeComponent();

            expect(component.allOptionsSelected).toBe(false);
        }));
    });
});

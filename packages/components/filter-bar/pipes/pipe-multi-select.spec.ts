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

const SELECT_VALUES: KbqSelectValue[] = [
    { name: 'Option 1', value: 'value1' },
    { name: 'Option 2', value: 'value2' },
    { name: 'Option 3', value: 'value3' },
    { name: 'Option 4', value: 'value4' },
    { name: 'Option 5', value: 'value5' }
];

const ALL_VALUES: KbqSelectValue[] = [...SELECT_VALUES];

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

    window.structuredClone = (value) => JSON.parse(JSON.stringify(value));

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
                    value: [SELECT_VALUES[0]],
                    cleanable: false,
                    removable: false,
                    disabled: false
                }),
                createPipe({ name: 'empty', value: null, cleanable: true, removable: false, disabled: false }),
                createPipe({
                    name: 'cleanable',
                    value: [SELECT_VALUES[1]],
                    cleanable: true,
                    removable: false,
                    disabled: false
                }),
                createPipe({
                    name: 'removable',
                    value: [SELECT_VALUES[1]],
                    cleanable: false,
                    removable: true,
                    disabled: false
                }),
                createPipe({
                    name: 'disabled',
                    value: [SELECT_VALUES[1]],
                    cleanable: false,
                    removable: false,
                    disabled: true
                })
            ]);
            fixture.detectChanges();
        });

        it('should render all MultiSelect pipes', () => {
            const pipes = filterBarDebugElement.queryAll(By.css('.kbq-pipe'));

            expect(pipes.length).toBe(5);
            pipes.forEach((pipe) => {
                expect(pipe.nativeElement.classList).toContain('kbq-pipe__multiselect');
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

            if (component.allOptionsSelected) {
                expect(component.isEmpty).toBe(true);
            }
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

            if (component.allOptionsSelected) {
                expect(component.checkboxState).toBe('checked');
            }
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

            if (component.select.selectionModel.selected.length > 0 && !component.allOptionsSelected) {
                expect(component.checkboxState).toBe('indeterminate');
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
                createPipe({ name: 'test', value: ALL_VALUES })
            ]);
            fixture.detectChanges();

            const component = getPipeComponent();

            openSelect();
            flush();
            fixture.detectChanges();

            if (component.allOptionsSelected && component.selectedAllEqualsSelectedNothing) {
                component.onSelect([...ALL_VALUES]);
                flush();

                if (component.allOptionsSelected) {
                    expect(component.data.value).toEqual([]);
                }
            }
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

            expect(component.select.selectionModel.selected.length).toBeGreaterThan(0);
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

            if (component.allOptionsSelected) {
                component.toggleSelectionAll();
                flush();
                fixture.detectChanges();

                expect(component.select.selectionModel.selected.length).toBe(0);
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

            component.toggleSelectionAll();
            flush();
            fixture.detectChanges();

            if (component.allOptionsSelected && component.selectedAllEqualsSelectedNothing) {
                expect(component.data.value).toEqual([]);
            }
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

            component.select.keyManager.setActiveItem(0);

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
                createPipe({ name: 'test', value: ALL_VALUES, selectAll: true })
            ]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            const component = getPipeComponent();

            component.onClose();

            expect(component.selected).toBeDefined();
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
            const openSpy = jest.spyOn(component.select, 'open');

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

        it('should handle null gracefully', () => {
            const component = getPipeComponent();

            expect(component.compareByValue(null, { id: 1 })).toBe(false);
        });
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

            component.searchControl.setValue('Option 1');
            flush();

            component.filteredOptions.subscribe((filtered) => {
                expect(filtered.length).toBe(1);
                expect(filtered[0].name).toBe('Option 1');
            });
        }));

        it('should return all options when search is empty', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: [], search: true })
            ]);
            fixture.detectChanges();

            const component = getPipeComponent();

            component.searchControl.setValue('');
            flush();

            component.filteredOptions.subscribe((filtered) => {
                expect(filtered.length).toBe(SELECT_VALUES.length);
            });
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

            if (component.allOptionsSelected) {
                expect(component.allVisibleOptionsSelected).toBe(true);
            }
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

            if (!component.allOptionsSelected) {
                expect(component.allVisibleOptionsSelected).toBe(false);
            }
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

            component.toggleSelectionAll();
            flush();
            fixture.detectChanges();

            if (component.select.triggerValues.length === SELECT_VALUES.length) {
                expect(component.allOptionsSelected).toBe(true);
            }
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

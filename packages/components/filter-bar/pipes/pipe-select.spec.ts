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
import { KbqPipeSelectComponent } from './pipe-select';

const SELECT_VALUES: KbqSelectValue[] = [
    { name: 'Option 1', value: 'value1' },
    { name: 'Option 2', value: 'value2' },
    { name: 'Option 3', value: 'value3' }
];

const PIPE_TEMPLATE_ID = 'TestSelect';

const createPipe = (overrides: Partial<KbqPipe>): KbqPipe => ({
    name: 'test',
    id: PIPE_TEMPLATE_ID,
    type: KbqPipeTypes.Select,
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
            name: 'Select',
            id: PIPE_TEMPLATE_ID,
            type: KbqPipeTypes.Select,
            values: SELECT_VALUES,
            cleanable: false,
            removable: false,
            disabled: false
        }
    ];
}

describe('KbqPipeSelectComponent', () => {
    let fixture: ComponentFixture<TestComponent>;
    let filterBarDebugElement: DebugElement;

    window.structuredClone = (value) => JSON.parse(JSON.stringify(value));

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, KbqFilterBarModule, TestComponent]
        })
            .overrideComponent(KbqPipeSelectComponent, {
                set: {
                    providers: [{ provide: KbqBasePipe, useExisting: KbqPipeSelectComponent }]
                }
            })
            .compileComponents();
    });

    const getPipeComponent = (index: number = 0): KbqPipeSelectComponent => {
        const pipes = fixture.debugElement.queryAll(By.css('kbq-pipe-select'));

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
                    value: SELECT_VALUES[0],
                    cleanable: false,
                    removable: false,
                    disabled: false
                }),
                createPipe({ name: 'empty', value: null, cleanable: true, removable: false, disabled: false }),
                createPipe({
                    name: 'cleanable',
                    value: SELECT_VALUES[1],
                    cleanable: true,
                    removable: false,
                    disabled: false
                }),
                createPipe({
                    name: 'removable',
                    value: SELECT_VALUES[1],
                    cleanable: false,
                    removable: true,
                    disabled: false
                }),
                createPipe({
                    name: 'disabled',
                    value: SELECT_VALUES[1],
                    cleanable: false,
                    removable: false,
                    disabled: true
                })
            ]);
            fixture.detectChanges();
        });

        it('should render all Select pipes', () => {
            const pipes = filterBarDebugElement.queryAll(By.css('.kbq-pipe'));

            expect(pipes.length).toBe(5);
            pipes.forEach((pipe) => {
                expect(pipe.nativeElement.classList).toContain('kbq-pipe__select');
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

        it('should not be empty when value is a KbqSelectValue object', () => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: SELECT_VALUES[0] })
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

        it('should return data.value directly', () => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: SELECT_VALUES[0] })
            ]);
            fixture.detectChanges();

            expect(getPipeComponent().selected).toEqual(SELECT_VALUES[0]);
        });

        it('should return null when no selection', () => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: null })
            ]);
            fixture.detectChanges();

            expect(getPipeComponent().selected).toBeNull();
        });
    });

    describe('onSelect', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should set data.value to the selected item', () => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: null })
            ]);
            fixture.detectChanges();

            const component = getPipeComponent();

            component.onSelect(SELECT_VALUES[1]);

            expect(component.data.value).toEqual(SELECT_VALUES[1]);
        });

        it('should emit onChangePipe event on selection', () => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: null })
            ]);
            fixture.detectChanges();

            const filterBar = getFilterBar();
            const spy = jest.fn();

            filterBar.onChangePipe.subscribe(spy);

            getPipeComponent().onSelect(SELECT_VALUES[0]);

            expect(spy).toHaveBeenCalled();
        });

        it('should emit onChangePipe via UI click on option', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: null })
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
    });

    describe('compareByValue', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: null })
            ]);
            fixture.detectChanges();
        });

        it('should return true when both objects have the same id', () => {
            const component = getPipeComponent();

            expect(component.compareByValue({ id: 1 }, { id: 1 })).toBe(true);
        });

        it('should return false when objects have different ids', () => {
            const component = getPipeComponent();

            expect(component.compareByValue({ id: 1 }, { id: 2 })).toBe(false);
        });

        it('should return falsy when first argument is null', () => {
            const component = getPipeComponent();

            expect(component.compareByValue(null, { id: 1 })).toBeFalsy();
        });

        it('should return falsy when second argument is null', () => {
            const component = getPipeComponent();

            expect(component.compareByValue({ id: 1 }, null)).toBeFalsy();
        });
    });

    describe('open', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should call select.open()', () => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: null })
            ]);
            fixture.detectChanges();

            const component = getPipeComponent();
            const openSpy = jest.spyOn(component.select, 'open');

            component.open();

            expect(openSpy).toHaveBeenCalled();
        });
    });

    describe('searchControl / filteredOptions', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should initially emit all values', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: null, search: true })
            ]);
            fixture.detectChanges();

            const component = getPipeComponent();

            component.filteredOptions.subscribe((filtered) => {
                expect(filtered.length).toBe(SELECT_VALUES.length);
            });
        }));

        it('should filter options by search text', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: null, search: true })
            ]);
            fixture.detectChanges();

            const component = getPipeComponent();
            let lastFiltered: any[] = [];

            component.filteredOptions.subscribe((filtered) => {
                lastFiltered = filtered;
            });

            component.searchControl.setValue('Option 1');
            flush();

            expect(lastFiltered.length).toBe(1);
            expect(lastFiltered[0].name).toBe('Option 1');
        }));

        it('should return all options when search is cleared', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: null, search: true })
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

        it('should filter case-insensitively', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: null, search: true })
            ]);
            fixture.detectChanges();

            const component = getPipeComponent();
            let lastFiltered: any[] = [];

            component.filteredOptions.subscribe((filtered) => {
                lastFiltered = filtered;
            });

            component.searchControl.setValue('option 1');
            flush();

            expect(lastFiltered.length).toBe(1);
            expect(lastFiltered[0].name).toBe('Option 1');
        }));
    });

    describe('onClear', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should set value to null', () => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: SELECT_VALUES[0] })
            ]);
            fixture.detectChanges();

            const component = getPipeComponent();

            component.onClear();

            expect(component.data.value).toBeNull();
        });

        it('should emit onClearPipe event', () => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: SELECT_VALUES[0] })
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
                createPipe({ name: 'test', value: SELECT_VALUES[0] })
            ]);
            fixture.detectChanges();

            const filterBar = getFilterBar();
            const spy = jest.fn();

            filterBar.onChangePipe.subscribe(spy);

            getPipeComponent().onClear();

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('ngAfterViewInit / closedStream', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should emit onClosePipe when select closes', () => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: SELECT_VALUES[0] })
            ]);
            fixture.detectChanges();

            const filterBar = getFilterBar();
            const spy = jest.fn();

            filterBar.onClosePipe.subscribe(spy);

            // Simulate select close by emitting false on openedChange (triggers closedStream)
            getPipeComponent().select.openedChange.emit(false);

            expect(spy).toHaveBeenCalledWith(expect.objectContaining({ name: 'test' }));
        });
    });
});

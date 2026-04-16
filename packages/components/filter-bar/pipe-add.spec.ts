import { ChangeDetectorRef, Component, DebugElement, inject } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    KbqFilter,
    KbqFilterBar,
    KbqFilterBarModule,
    KbqPipe,
    KbqPipeAdd,
    KbqPipeTemplate,
    KbqPipeTypes
} from '@koobiq/components/filter-bar';

const PIPE_TEMPLATE_ID_1 = 'TestPipeA';
const PIPE_TEMPLATE_ID_2 = 'TestPipeB';

const createPipe = (overrides: Partial<KbqPipe> = {}): KbqPipe => ({
    name: 'Test',
    id: PIPE_TEMPLATE_ID_1,
    type: KbqPipeTypes.Text,
    value: null,
    search: false,
    cleanable: false,
    removable: false,
    disabled: false,
    ...overrides
});

const createFilter = (pipes: KbqPipe[], overrides: Partial<KbqFilter> = {}): KbqFilter => ({
    name: 'TestFilter',
    readonly: false,
    disabled: false,
    changed: false,
    saved: false,
    pipes,
    ...overrides
});

@Component({
    selector: 'test-app',
    imports: [KbqFilterBarModule],
    template: `
        <kbq-filter-bar [pipeTemplates]="pipeTemplates" [(filter)]="activeFilter">
            <kbq-pipe-add [filterTemplate]="filterTemplate" />
        </kbq-filter-bar>
    `
})
class TestComponent {
    readonly changeDetectorRef = inject(ChangeDetectorRef);

    activeFilter: KbqFilter | null = null;

    filterTemplate: KbqFilter = {
        name: 'DefaultFilter',
        readonly: false,
        disabled: false,
        changed: false,
        saved: false,
        pipes: []
    };

    pipeTemplates: KbqPipeTemplate[] = [
        {
            name: 'PipeA',
            id: PIPE_TEMPLATE_ID_1,
            type: KbqPipeTypes.Text,
            cleanable: false,
            removable: false,
            disabled: false
        },
        {
            name: 'PipeB',
            id: PIPE_TEMPLATE_ID_2,
            type: KbqPipeTypes.Text,
            cleanable: false,
            removable: false,
            disabled: false
        }
    ];
}

describe('KbqPipeAdd', () => {
    let fixture: ComponentFixture<TestComponent>;
    let filterBarDebugElement: DebugElement;

    window.structuredClone = (value) => JSON.parse(JSON.stringify(value));

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, KbqFilterBarModule, TestComponent]
        }).compileComponents();
    });

    const getPipeAdd = (): KbqPipeAdd => {
        return fixture.debugElement.query(By.directive(KbqPipeAdd)).componentInstance;
    };

    const getFilterBar = (): KbqFilterBar => {
        return filterBarDebugElement.componentInstance;
    };

    describe('addedPipes', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
            fixture.detectChanges();
        });

        it('should be empty initially when no filter is set', () => {
            expect(getPipeAdd().addedPipes).toEqual([]);
        });

        it('should update addedPipes when filter with pipes is set', () => {
            const filterBar = getFilterBar();

            filterBar.filter = createFilter([
                createPipe({ id: PIPE_TEMPLATE_ID_1 }),
                createPipe({ id: PIPE_TEMPLATE_ID_2 })
            ]);
            fixture.detectChanges();

            expect(getPipeAdd().addedPipes).toEqual([PIPE_TEMPLATE_ID_1, PIPE_TEMPLATE_ID_2]);
        });

        it('should not update addedPipes when filter is null', () => {
            const filterBar = getFilterBar();
            const pipeAdd = getPipeAdd();

            filterBar.filter = null;
            fixture.detectChanges();

            expect(pipeAdd.addedPipes).toEqual([]);
        });
    });

    describe('addPipeFromTemplate', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
            fixture.detectChanges();
        });

        it('should create filter from filterTemplate when no filter exists', fakeAsync(() => {
            const filterBar = getFilterBar();
            const pipeAdd = getPipeAdd();

            expect(filterBar.filter).toBeNull();

            pipeAdd.select.open();
            flush();
            fixture.detectChanges();

            const options = document.querySelectorAll('.kbq-option');

            (options[0] as HTMLElement).click();
            flush();
            fixture.detectChanges();

            expect(filterBar.filter).not.toBeNull();
            expect(filterBar.filter!.name).toBe('DefaultFilter');
        }));

        it('should push pipe into filter.pipes', fakeAsync(() => {
            const filterBar = getFilterBar();
            const pipeAdd = getPipeAdd();

            pipeAdd.select.open();
            flush();
            fixture.detectChanges();

            const options = document.querySelectorAll('.kbq-option');

            (options[0] as HTMLElement).click();
            flush();
            fixture.detectChanges();

            expect(filterBar.filter!.pipes.length).toBe(1);
            expect(filterBar.filter!.pipes[0].id).toBe(PIPE_TEMPLATE_ID_1);
        }));

        it('should set filter.changed to true', fakeAsync(() => {
            const filterBar = getFilterBar();
            const pipeAdd = getPipeAdd();

            pipeAdd.select.open();
            flush();
            fixture.detectChanges();

            const options = document.querySelectorAll('.kbq-option');

            (options[0] as HTMLElement).click();
            flush();
            fixture.detectChanges();

            expect(filterBar.filter!.changed).toBe(true);
        }));

        it('should strip values and valueTemplate from added pipe', fakeAsync(() => {
            const filterBar = getFilterBar();
            const pipeAdd = getPipeAdd();

            pipeAdd.select.open();
            flush();
            fixture.detectChanges();

            const options = document.querySelectorAll('.kbq-option');

            (options[0] as HTMLElement).click();
            flush();
            fixture.detectChanges();

            const addedPipe = filterBar.filter!.pipes[0];

            expect((addedPipe as any).values).toBeUndefined();
            expect((addedPipe as any).valueTemplate).toBeUndefined();
        }));

        it('should set openOnAdd: true on added pipe', fakeAsync(() => {
            const filterBar = getFilterBar();
            const pipeAdd = getPipeAdd();

            pipeAdd.select.open();
            flush();
            fixture.detectChanges();

            const options = document.querySelectorAll('.kbq-option');

            (options[0] as HTMLElement).click();
            flush();
            fixture.detectChanges();

            expect(filterBar.filter!.pipes[0].openOnAdd).toBe(true);
        }));

        it('should emit onAddPipe event with the template value', fakeAsync(() => {
            const pipeAdd = getPipeAdd();
            const spy = jest.fn();

            pipeAdd.onAddPipe.subscribe(spy);

            pipeAdd.select.open();
            flush();
            fixture.detectChanges();

            const options = document.querySelectorAll('.kbq-option');

            (options[0] as HTMLElement).click();
            flush();
            fixture.detectChanges();

            expect(spy).toHaveBeenCalledWith(expect.objectContaining({ id: PIPE_TEMPLATE_ID_1 }));
        }));

        it('should emit filterBar.filterChange', fakeAsync(() => {
            const filterBar = getFilterBar();
            const pipeAdd = getPipeAdd();
            const spy = jest.fn();

            filterBar.filterChange.subscribe(spy);

            pipeAdd.select.open();
            flush();
            fixture.detectChanges();

            const options = document.querySelectorAll('.kbq-option');

            (options[0] as HTMLElement).click();
            flush();
            fixture.detectChanges();

            expect(spy).toHaveBeenCalled();
        }));

        it('should close the select after adding a pipe', fakeAsync(() => {
            const pipeAdd = getPipeAdd();
            const closeSpy = jest.spyOn(pipeAdd.select, 'close');

            pipeAdd.select.open();
            flush();
            fixture.detectChanges();

            const options = document.querySelectorAll('.kbq-option');

            (options[0] as HTMLElement).click();
            flush();
            fixture.detectChanges();

            expect(closeSpy).toHaveBeenCalled();
        }));

        it('should reuse existing filter when filter is already set', fakeAsync(() => {
            const filterBar = getFilterBar();
            const pipeAdd = getPipeAdd();
            const existingFilter = createFilter([]);

            filterBar.filter = existingFilter;
            fixture.detectChanges();

            pipeAdd.select.open();
            flush();
            fixture.detectChanges();

            const options = document.querySelectorAll('.kbq-option');

            (options[0] as HTMLElement).click();
            flush();
            fixture.detectChanges();

            expect(filterBar.filter).toBe(existingFilter);
            expect(filterBar.filter.pipes.length).toBe(1);
        }));

        it('should call filterBar.openPipe.next when option is already selected', fakeAsync(() => {
            const filterBar = getFilterBar();
            const pipeAdd = getPipeAdd();
            const openPipeSpy = jest.spyOn(filterBar.openPipe, 'next');

            // First click — add the pipe
            pipeAdd.select.open();
            flush();
            fixture.detectChanges();

            let options = document.querySelectorAll('.kbq-option');

            (options[0] as HTMLElement).click();
            flush();
            fixture.detectChanges();

            // Second click — option is now selected, should trigger openPipe
            pipeAdd.select.open();
            flush();
            fixture.detectChanges();

            options = document.querySelectorAll('.kbq-option');
            openPipeSpy.mockClear();

            (options[0] as HTMLElement).click();
            flush();
            fixture.detectChanges();

            expect(openPipeSpy).toHaveBeenCalledWith(PIPE_TEMPLATE_ID_1);
        }));

        it('should NOT add a duplicate pipe when option is already selected', fakeAsync(() => {
            const filterBar = getFilterBar();
            const pipeAdd = getPipeAdd();

            // First click — add the pipe
            pipeAdd.select.open();
            flush();
            fixture.detectChanges();

            let options = document.querySelectorAll('.kbq-option');

            (options[0] as HTMLElement).click();
            flush();
            fixture.detectChanges();

            expect(filterBar.filter!.pipes.length).toBe(1);

            // Second click — should NOT add another pipe
            pipeAdd.select.open();
            flush();
            fixture.detectChanges();

            options = document.querySelectorAll('.kbq-option');

            (options[0] as HTMLElement).click();
            flush();
            fixture.detectChanges();

            expect(filterBar.filter!.pipes.length).toBe(1);
        }));
    });

    describe('compareWith', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
            fixture.detectChanges();
        });

        it('should return true when getId(o1) equals o2', () => {
            const pipeAdd = getPipeAdd();

            expect(pipeAdd.compareWith({ id: PIPE_TEMPLATE_ID_1 } as KbqPipe, PIPE_TEMPLATE_ID_1)).toBe(true);
        });

        it('should return false when ids differ', () => {
            const pipeAdd = getPipeAdd();

            expect(pipeAdd.compareWith({ id: PIPE_TEMPLATE_ID_1 } as KbqPipe, PIPE_TEMPLATE_ID_2)).toBe(false);
        });
    });
});

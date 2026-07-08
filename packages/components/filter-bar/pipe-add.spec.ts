import { ChangeDetectorRef, Component, DebugElement, inject } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { createKeyboardEvent, dispatchEvent, ENTER, SPACE } from '@koobiq/components/core';
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
        }).compileComponents();
    });

    const getPipeAdd = (): KbqPipeAdd => {
        return fixture.debugElement.query(By.directive(KbqPipeAdd)).componentInstance;
    };

    const getFilterBar = (): KbqFilterBar => {
        return filterBarDebugElement.componentInstance;
    };

    describe('UI integration', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
            fixture.detectChanges();
        });

        it('should have kbq-pipe-add class on the host', () => {
            const pipeAddDebug = fixture.debugElement.query(By.directive(KbqPipeAdd));

            expect(pipeAddDebug.nativeElement.classList).toContain('kbq-pipe-add');
        });

        it('should open the template select on trigger click', () => {
            const pipeAdd = getPipeAdd();
            const pipeAddDebug = fixture.debugElement.query(By.directive(KbqPipeAdd));

            expect(pipeAdd.select().panelOpen).toBe(false);

            pipeAddDebug.query(By.css('.kbq-select')).nativeElement.click();
            fixture.detectChanges();

            expect(pipeAdd.select().panelOpen).toBe(true);
        });

        it('should render one option per pipeTemplate', fakeAsync(() => {
            getPipeAdd().select().open();
            flush();
            fixture.detectChanges();

            const options = document.querySelectorAll('.kbq-option');

            expect(options.length).toBe(fixture.componentInstance.pipeTemplates.length);
            fixture.componentInstance.pipeTemplates.forEach((template, index) => {
                expect(options[index].textContent).toContain(template.name);
            });
        }));
    });

    describe('addedPipes', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
            fixture.detectChanges();
        });

        it('should be empty initially when no filter is set', () => {
            expect(getPipeAdd().addedPipes()).toEqual([]);
        });

        it('should update addedPipes when filter with pipes is set', () => {
            const filterBar = getFilterBar();

            filterBar.filter.set(
                createFilter([
                    createPipe({ id: PIPE_TEMPLATE_ID_1 }),
                    createPipe({ id: PIPE_TEMPLATE_ID_2 })
                ])
            );
            fixture.detectChanges();

            expect(getPipeAdd().addedPipes()).toEqual([PIPE_TEMPLATE_ID_1, PIPE_TEMPLATE_ID_2]);
        });

        it('should not update addedPipes when filter is null', () => {
            const filterBar = getFilterBar();
            const pipeAdd = getPipeAdd();

            filterBar.filter.set(null);
            fixture.detectChanges();

            expect(pipeAdd.addedPipes()).toEqual([]);
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

            expect(filterBar.filter()).toBeNull();

            pipeAdd.select().open();
            flush();
            fixture.detectChanges();

            const options = document.querySelectorAll('.kbq-option');

            (options[0] as HTMLElement).click();
            flush();
            fixture.detectChanges();

            expect(filterBar.filter()).not.toBeNull();
            expect(filterBar.filter()!.name).toBe('DefaultFilter');
        }));

        it('should push pipe into filter.pipes', fakeAsync(() => {
            const filterBar = getFilterBar();
            const pipeAdd = getPipeAdd();

            pipeAdd.select().open();
            flush();
            fixture.detectChanges();

            const options = document.querySelectorAll('.kbq-option');

            (options[0] as HTMLElement).click();
            flush();
            fixture.detectChanges();

            expect(filterBar.filter()!.pipes.length).toBe(1);
            expect(filterBar.filter()!.pipes[0].id).toBe(PIPE_TEMPLATE_ID_1);
        }));

        it('should set filter.changed to true', fakeAsync(() => {
            const filterBar = getFilterBar();
            const pipeAdd = getPipeAdd();

            pipeAdd.select().open();
            flush();
            fixture.detectChanges();

            const options = document.querySelectorAll('.kbq-option');

            (options[0] as HTMLElement).click();
            flush();
            fixture.detectChanges();

            expect(filterBar.filter()!.changed).toBe(true);
        }));

        it('should strip values and valueTemplate from added pipe', fakeAsync(() => {
            const filterBar = getFilterBar();
            const pipeAdd = getPipeAdd();

            pipeAdd.select().open();
            flush();
            fixture.detectChanges();

            const options = document.querySelectorAll('.kbq-option');

            (options[0] as HTMLElement).click();
            flush();
            fixture.detectChanges();

            const addedPipe = filterBar.filter()!.pipes[0];

            expect((addedPipe as any).values).toBeUndefined();
            expect((addedPipe as any).valueTemplate).toBeUndefined();
        }));

        it('should set openOnAdd: true on added pipe', fakeAsync(() => {
            const filterBar = getFilterBar();
            const pipeAdd = getPipeAdd();

            pipeAdd.select().open();
            flush();
            fixture.detectChanges();

            const options = document.querySelectorAll('.kbq-option');

            (options[0] as HTMLElement).click();
            flush();
            fixture.detectChanges();

            expect(filterBar.filter()!.pipes[0].openOnAdd).toBe(true);
        }));

        it('should emit onAddPipe event with the template value', fakeAsync(() => {
            const pipeAdd = getPipeAdd();
            const spy = jest.fn();

            pipeAdd.onAddPipe.subscribe(spy);

            pipeAdd.select().open();
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

            filterBar.filter.subscribe(spy);

            pipeAdd.select().open();
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
            const closeSpy = jest.spyOn(pipeAdd.select(), 'close');

            pipeAdd.select().open();
            flush();
            fixture.detectChanges();

            const options = document.querySelectorAll('.kbq-option');

            (options[0] as HTMLElement).click();
            flush();
            fixture.detectChanges();

            expect(closeSpy).toHaveBeenCalled();
        }));

        it('should derive from the existing filter when one is already set', fakeAsync(() => {
            const filterBar = getFilterBar();
            const pipeAdd = getPipeAdd();
            const existingFilter = createFilter([]);

            filterBar.filter.set(existingFilter);
            fixture.detectChanges();

            pipeAdd.select().open();
            flush();
            fixture.detectChanges();

            const options = document.querySelectorAll('.kbq-option');

            (options[0] as HTMLElement).click();
            flush();
            fixture.detectChanges();

            // Immutable add: a new filter reference derived from the existing one — its data is reused
            // (name kept, not the empty pipe-add default template) with the new pipe appended.
            expect(filterBar.filter()).not.toBe(existingFilter);
            expect(filterBar.filter()!.name).toBe(existingFilter.name);
            expect(filterBar.filter()!.pipes.length).toBe(1);
        }));

        it('should announce the added pipe in the visually-hidden live region (WCAG 4.1.3)', fakeAsync(() => {
            const pipeAdd = getPipeAdd();

            pipeAdd.select().open();
            flush();
            fixture.detectChanges();

            const options = document.querySelectorAll('.kbq-option');

            (options[0] as HTMLElement).click();
            flush();
            fixture.detectChanges();

            const liveRegion = fixture.debugElement
                .query(By.directive(KbqPipeAdd))
                .query(By.css('[aria-live="polite"]'));

            // Default (ru-RU) locale message with the added template's name interpolated.
            expect(liveRegion.nativeElement.textContent.trim()).toBe('Фильтр PipeA добавлен');
        }));

        it('should call filterBar.openPipe.next when option is already selected', fakeAsync(() => {
            const filterBar = getFilterBar();
            const pipeAdd = getPipeAdd();
            const openPipeSpy = jest.spyOn(filterBar.openPipe, 'next');

            // First click — add the pipe
            pipeAdd.select().open();
            flush();
            fixture.detectChanges();

            let options = document.querySelectorAll('.kbq-option');

            (options[0] as HTMLElement).click();
            flush();
            fixture.detectChanges();

            // Second click — option is now selected, should trigger openPipe
            pipeAdd.select().open();
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
            pipeAdd.select().open();
            flush();
            fixture.detectChanges();

            let options = document.querySelectorAll('.kbq-option');

            (options[0] as HTMLElement).click();
            flush();
            fixture.detectChanges();

            expect(filterBar.filter()!.pipes.length).toBe(1);

            // Second click — should NOT add another pipe
            pipeAdd.select().open();
            flush();
            fixture.detectChanges();

            options = document.querySelectorAll('.kbq-option');

            (options[0] as HTMLElement).click();
            flush();
            fixture.detectChanges();

            expect(filterBar.filter()!.pipes.length).toBe(1);
        }));
    });

    describe('keyboard (Enter/Space)', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
            fixture.detectChanges();
        });

        const pressEnterOnFirstOption = () => {
            const option = document.querySelectorAll('.kbq-option')[0] as HTMLElement;

            dispatchEvent(option, createKeyboardEvent('keydown', ENTER, undefined, 'Enter'));
        };

        const pressSpaceOnFirstOption = () => {
            const option = document.querySelectorAll('.kbq-option')[0] as HTMLElement;

            dispatchEvent(option, createKeyboardEvent('keydown', SPACE, undefined, ' '));
        };

        it('should add a pipe when Enter is pressed on a template option', fakeAsync(() => {
            const filterBar = getFilterBar();
            const pipeAdd = getPipeAdd();

            pipeAdd.select().open();
            flush();
            fixture.detectChanges();

            pressEnterOnFirstOption();
            flush();
            fixture.detectChanges();

            expect(filterBar.filter()!.pipes.length).toBe(1);
            expect(filterBar.filter()!.pipes[0].id).toBe(PIPE_TEMPLATE_ID_1);
        }));

        it('should add a pipe when Space is pressed on a template option', fakeAsync(() => {
            const filterBar = getFilterBar();
            const pipeAdd = getPipeAdd();

            pipeAdd.select().open();
            flush();
            fixture.detectChanges();

            pressSpaceOnFirstOption();
            flush();
            fixture.detectChanges();

            expect(filterBar.filter()!.pipes.length).toBe(1);
            expect(filterBar.filter()!.pipes[0].id).toBe(PIPE_TEMPLATE_ID_1);
        }));

        it('should emit onAddPipe when Enter is pressed on a template option', fakeAsync(() => {
            const pipeAdd = getPipeAdd();
            const spy = jest.fn();

            pipeAdd.onAddPipe.subscribe(spy);

            pipeAdd.select().open();
            flush();
            fixture.detectChanges();

            pressEnterOnFirstOption();
            flush();
            fixture.detectChanges();

            expect(spy).toHaveBeenCalledWith(expect.objectContaining({ id: PIPE_TEMPLATE_ID_1 }));
        }));

        it('should call filterBar.openPipe.next when Enter is pressed on an already-added option', fakeAsync(() => {
            const filterBar = getFilterBar();
            const pipeAdd = getPipeAdd();
            const openPipeSpy = jest.spyOn(filterBar.openPipe, 'next');

            // First Enter — add the pipe
            pipeAdd.select().open();
            flush();
            fixture.detectChanges();

            pressEnterOnFirstOption();
            flush();
            fixture.detectChanges();

            // Second Enter — option is now selected, should trigger openPipe
            pipeAdd.select().open();
            flush();
            fixture.detectChanges();

            openPipeSpy.mockClear();

            pressEnterOnFirstOption();
            flush();
            fixture.detectChanges();

            expect(openPipeSpy).toHaveBeenCalledWith(PIPE_TEMPLATE_ID_1);
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

import { ChangeDetectorRef, Component, DebugElement, inject, LOCALE_ID } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter, DateFormatter, KBQ_DATE_LOCALE } from '@koobiq/components/core';
import {
    KbqDateTimeValue,
    KbqFilter,
    KbqFilterBar,
    KbqFilterBarModule,
    KbqPipe,
    KbqPipeTemplate,
    KbqPipeTypes
} from '@koobiq/components/filter-bar';
import { DateTime } from 'luxon';
import { KbqBasePipe } from './base-pipe';
import { KbqPipeDatetimeComponent } from './pipe-datetime';

const PIPE_TEMPLATE_ID = 'TestDatetime';

const PRESET_VALUES: KbqDateTimeValue[] = [
    { name: 'Last 24 hours', start: { days: -1 } as any, end: null as any },
    { name: 'Last 7 days', start: { days: -7 } as any, end: null as any }
];

const createPipe = (overrides: Partial<KbqPipe>): KbqPipe => ({
    name: 'test',
    id: PIPE_TEMPLATE_ID,
    type: KbqPipeTypes.Datetime,
    value: null,
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
    imports: [KbqFilterBarModule, KbqLuxonDateModule],
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
            name: 'Datetime',
            id: PIPE_TEMPLATE_ID,
            type: KbqPipeTypes.Datetime,
            values: PRESET_VALUES,
            cleanable: false,
            removable: false,
            disabled: false
        }
    ];
}

describe('KbqPipeDatetimeComponent', () => {
    let fixture: ComponentFixture<TestComponent>;
    let filterBarDebugElement: DebugElement;
    let adapter: DateAdapter<DateTime>;

    window.structuredClone = (value) => JSON.parse(JSON.stringify(value));

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, KbqFilterBarModule, KbqLuxonDateModule, TestComponent],
            providers: [
                { provide: LOCALE_ID, useValue: 'ru-RU' },
                { provide: DateFormatter, deps: [DateAdapter, KBQ_DATE_LOCALE] }
            ]
        })
            .overrideComponent(KbqPipeDatetimeComponent, {
                set: {
                    providers: [{ provide: KbqBasePipe, useExisting: KbqPipeDatetimeComponent }]
                }
            })
            .compileComponents();

        adapter = TestBed.inject(DateAdapter);
    });

    const getPipeComponent = (index: number = 0): KbqPipeDatetimeComponent<DateTime> => {
        const pipes = fixture.debugElement.queryAll(By.css('kbq-pipe-datetime'));

        return pipes[index].componentInstance;
    };

    const getFilterBar = (): KbqFilterBar => filterBarDebugElement.componentInstance;

    const asInternal = (component: KbqPipeDatetimeComponent<DateTime>) => component as any;

    const setupSinglePipe = (pipeOverrides: Partial<KbqPipe>) => {
        fixture = TestBed.createComponent(TestComponent);
        filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        fixture.componentInstance.activeFilter = createFilter([createPipe(pipeOverrides)]);
        fixture.detectChanges();
    };

    const createCustomRangeValue = () => {
        const start = adapter.today().minus({ days: 3 }).set({ hour: 9, minute: 15, second: 0, millisecond: 0 });
        const end = adapter.today().set({ hour: 18, minute: 45, second: 0, millisecond: 0 });

        return {
            start,
            end,
            value: {
                start: start.toISO(),
                end: end.toISO()
            }
        };
    };

    describe('Pipe states', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({
                    name: 'required',
                    value: createCustomRangeValue().value,
                    cleanable: false,
                    removable: false,
                    disabled: false
                }),
                createPipe({ name: 'empty', value: null, cleanable: true, removable: false, disabled: false }),
                createPipe({
                    name: 'cleanable',
                    value: createCustomRangeValue().value,
                    cleanable: true,
                    removable: false,
                    disabled: false
                }),
                createPipe({
                    name: 'removable',
                    value: PRESET_VALUES[0],
                    cleanable: false,
                    removable: true,
                    disabled: false
                }),
                createPipe({
                    name: 'disabled',
                    value: PRESET_VALUES[0],
                    cleanable: false,
                    removable: false,
                    disabled: true
                })
            ]);
            fixture.detectChanges();
        });

        it('should render all Datetime pipes', () => {
            const pipes = filterBarDebugElement.queryAll(By.css('.kbq-pipe'));

            expect(pipes.length).toBe(5);
            pipes.forEach((pipe) => {
                expect(pipe.nativeElement.classList).toContain('kbq-pipe__datetime');
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

    describe('formattedValue', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should return preset name when value has name', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: PRESET_VALUES[0] })]);
            fixture.detectChanges();

            expect(getPipeComponent().formattedValue).toBe(PRESET_VALUES[0].name);
        });

        it('should return formatted range for custom period', () => {
            const { start, end, value } = createCustomRangeValue();

            fixture.componentInstance.activeFilter = createFilter([createPipe({ value })]);
            fixture.detectChanges();

            const component = getPipeComponent();
            const spy = jest
                .spyOn(asInternal(component).formatter, 'rangeShortDateTime')
                .mockReturnValue('formatted datetime range');

            expect(component.formattedValue).toBe('formatted datetime range');
            expect(spy).toHaveBeenCalledWith(start, end);
        });
    });

    describe('isEmpty', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should be empty when value is null', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: null })]);
            fixture.detectChanges();

            expect(getPipeComponent().isEmpty).toBe(true);
        });

        it('should not be empty when value has preset name', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: PRESET_VALUES[0] })]);
            fixture.detectChanges();

            expect(getPipeComponent().isEmpty).toBe(false);
        });

        it('should not be empty when value contains valid custom range', () => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ value: createCustomRangeValue().value })
            ]);
            fixture.detectChanges();

            expect(getPipeComponent().isEmpty).toBe(false);
        });

        it('should be empty when custom range is incomplete', () => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ value: { start: adapter.today().toISO() } })
            ]);
            fixture.detectChanges();

            expect(getPipeComponent().isEmpty).toBe(true);
        });
    });

    xdescribe('defaultStart / defaultEnd', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should use start and end of today as defaults when pipe is empty', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: null })]);
            fixture.detectChanges();

            const component = getPipeComponent();

            expect(component.defaultStart.equals(adapter.today().startOf('day'))).toBe(true);
            expect(component.defaultEnd.equals(adapter.today().endOf('day'))).toBe(true);
        });

        it('should build defaults from relative preset value', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: PRESET_VALUES[0] })]);
            fixture.detectChanges();

            const component = getPipeComponent();

            expect(component.defaultStart.equals(adapter.today().plus(PRESET_VALUES[0].start as any))).toBe(true);
            expect(component.defaultEnd.equals(adapter.today())).toBe(true);
        });
    });

    describe('showPeriod', () => {
        beforeEach(() => {
            setupSinglePipe({ value: PRESET_VALUES[0] });
        });

        it('should switch to custom period mode and initialize form', fakeAsync(() => {
            const component = getPipeComponent();
            const internal = asInternal(component);
            const updatePosition = jest.fn();
            const focus = jest.fn();

            internal.popover = { updatePosition };
            internal.returnButton = () => ({ focus });
            internal.showStartCalendar = true;
            internal.showEndCalendar = true;

            component.showPeriod();

            expect(internal.isListMode).toBe(false);
            expect(internal.showStartCalendar).toBe(false);
            expect(internal.showEndCalendar).toBe(false);
            expect(internal.formGroup).toBeDefined();
            expect(internal.formGroup.controls.start.value.equals(component.defaultStart)).toBe(true);
            expect(internal.formGroup.controls.end.value.equals(component.defaultEnd)).toBe(true);

            flush();

            expect(updatePosition).toHaveBeenCalledWith(true);
            expect(focus).toHaveBeenCalled();
        }));
    });

    describe('showList', () => {
        beforeEach(() => {
            setupSinglePipe({ value: PRESET_VALUES[0] });
        });

        it('should switch back to preset list', fakeAsync(() => {
            const component = getPipeComponent();
            const internal = asInternal(component);
            const updatePosition = jest.fn();
            const focus = jest.fn();

            internal.popover = { updatePosition };
            internal.listSelection = () => ({ focus });
            internal.isListMode = false;

            component.showList();

            expect(internal.isListMode).toBe(true);
            expect(updatePosition).toHaveBeenCalledWith(true);

            flush();

            expect(focus).toHaveBeenCalled();
        }));
    });

    describe('open', () => {
        beforeEach(() => {
            setupSinglePipe({ value: null });
        });

        it('should call popover.show()', () => {
            const component = getPipeComponent();
            const show = jest.fn();

            asInternal(component).popover = { show };
            component.open();

            expect(show).toHaveBeenCalled();
        });
    });

    describe('onSelect', () => {
        beforeEach(() => {
            setupSinglePipe({ value: null });
        });

        it('should set data.value, emit onChangePipe and hide popover', () => {
            const component = getPipeComponent();
            const filterBar = getFilterBar();
            const spy = jest.fn();
            const hide = jest.fn();

            asInternal(component).popover = { hide };
            filterBar.onChangePipe.subscribe(spy);

            component.onSelect(PRESET_VALUES[1]);

            expect(component.data.value).toEqual(PRESET_VALUES[1]);
            expect(spy).toHaveBeenCalledWith(component.data);
            expect(hide).toHaveBeenCalled();
        });
    });

    describe('onApplyPeriod', () => {
        beforeEach(() => {
            setupSinglePipe({ value: null });
        });

        it('should save custom period as ISO strings and emit onChangePipe', () => {
            const component = getPipeComponent();
            const internal = asInternal(component);
            const filterBar = getFilterBar();
            const spy = jest.fn();
            const hide = jest.fn();
            const start = adapter.today().minus({ days: 5 }).set({ hour: 8, minute: 30, second: 0, millisecond: 0 });
            const end = adapter.today().set({ hour: 17, minute: 5, second: 0, millisecond: 0 });

            internal.popover = { hide };
            internal.formGroup = new FormGroup({
                start: new FormControl(start),
                end: new FormControl(end)
            });
            filterBar.onChangePipe.subscribe(spy);

            component.onApplyPeriod();

            expect(component.data.value).toEqual({
                start: start.toISO(),
                end: end.toISO()
            });
            expect(spy).toHaveBeenCalledWith(component.data);
            expect(hide).toHaveBeenCalled();
        });
    });

    describe('disabled', () => {
        beforeEach(() => {
            setupSinglePipe({ value: null });
        });

        it('should be false for valid dates', () => {
            const component = getPipeComponent();
            const internal = asInternal(component);

            internal.formGroup = new FormGroup({
                start: new FormControl(adapter.today().minus({ days: 1 })),
                end: new FormControl(adapter.today())
            });

            expect(component.disabled).toBe(false);
        });

        it('should be true when controls do not contain date instances', () => {
            const component = getPipeComponent();
            const internal = asInternal(component);

            internal.formGroup = new FormGroup({
                start: new FormControl('wrong'),
                end: new FormControl('wrong')
            });

            expect(component.disabled).toBe(true);
        });

        it('should be true when start control is invalid', () => {
            const component = getPipeComponent();
            const internal = asInternal(component);

            component.showPeriod();
            internal.formGroup.controls.start.setErrors({ invalid: true });

            expect(component.disabled).toBe(true);
        });
    });

    describe('date selection handlers', () => {
        beforeEach(() => {
            setupSinglePipe({ value: null });
        });

        it('should update start and end controls', () => {
            const component = getPipeComponent();
            const internal = asInternal(component);
            const start = adapter.today().minus({ days: 2 }).set({ hour: 10, minute: 0, second: 0, millisecond: 0 });
            const end = adapter.today().set({ hour: 19, minute: 0, second: 0, millisecond: 0 });

            component.showPeriod();
            component.onSelectStartDate(start);
            component.onSelectEndDate(end);

            expect(internal.formGroup.controls.start.value).toBe(start);
            expect(internal.formGroup.controls.end.value).toBe(end);
        });
    });

    describe('calendar visibility handlers', () => {
        beforeEach(() => {
            setupSinglePipe({ value: null });
        });

        it('should toggle calendars on focus and hide both on request', () => {
            const component = getPipeComponent();
            const internal = asInternal(component);
            const updatePosition = jest.fn();

            internal.popover = { updatePosition };

            component.onFocusStartInput();

            expect(internal.showStartCalendar).toBe(true);
            expect(internal.showEndCalendar).toBe(false);
            expect(updatePosition).toHaveBeenCalledWith(true);

            component.onFocusEndInput();

            expect(internal.showStartCalendar).toBe(false);
            expect(internal.showEndCalendar).toBe(true);

            component.hideCalendars();

            expect(internal.showStartCalendar).toBe(false);
            expect(internal.showEndCalendar).toBe(false);
        });
    });

    describe('onKeydown', () => {
        beforeEach(() => {
            setupSinglePipe({ value: null });
        });

        it('should apply period on Ctrl+Enter and prevent default', () => {
            const component = getPipeComponent();
            const applySpy = jest.spyOn(component, 'onApplyPeriod').mockImplementation();
            const event = { ctrlKey: true, metaKey: false, keyCode: 13, preventDefault: jest.fn() } as any;

            component.onKeydown(event);

            expect(applySpy).toHaveBeenCalled();
            expect(event.preventDefault).toHaveBeenCalled();
        });

        it('should apply period on Meta+Enter and prevent default', () => {
            const component = getPipeComponent();
            const applySpy = jest.spyOn(component, 'onApplyPeriod').mockImplementation();
            const event = { ctrlKey: false, metaKey: true, keyCode: 13, preventDefault: jest.fn() } as any;

            component.onKeydown(event);

            expect(applySpy).toHaveBeenCalled();
            expect(event.preventDefault).toHaveBeenCalled();
        });

        it('should prevent default on Enter without modifiers', () => {
            const component = getPipeComponent();
            const event = { ctrlKey: false, metaKey: false, keyCode: 13, preventDefault: jest.fn() } as any;

            component.onKeydown(event);

            expect(event.preventDefault).toHaveBeenCalled();
        });
    });

    describe('ngAfterViewInit / visibleChange', () => {
        beforeEach(() => {
            setupSinglePipe({ value: PRESET_VALUES[0] });
        });

        it('should emit onClosePipe when popover closes', () => {
            const component = getPipeComponent();
            const filterBar = getFilterBar();
            const spy = jest.fn();

            filterBar.onClosePipe.subscribe(spy);
            component.popover.visibleChange.emit(false);

            expect(spy).toHaveBeenCalledWith(component.data);
        });
    });

    describe('onClear', () => {
        beforeEach(() => {
            setupSinglePipe({ value: PRESET_VALUES[0] });
        });

        it('should set value to null', () => {
            const component = getPipeComponent();

            component.onClear();

            expect(component.data.value).toBeNull();
        });

        it('should emit onClearPipe and onChangePipe', () => {
            const component = getPipeComponent();
            const filterBar = getFilterBar();
            const clearSpy = jest.fn();
            const changeSpy = jest.fn();

            filterBar.onClearPipe.subscribe(clearSpy);
            filterBar.onChangePipe.subscribe(changeSpy);

            component.onClear();

            expect(clearSpy).toHaveBeenCalledWith(component.data);
            expect(changeSpy).toHaveBeenCalledWith(component.data);
        });
    });
});

import { FocusMonitor } from '@angular/cdk/a11y';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ChangeDetectorRef, Component, DebugElement, inject, LOCALE_ID } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter, DateFormatter } from '@koobiq/components/core';
import {
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
import { registerPipeStatesTests } from './pipe-states.spec-helper';

const PIPE_TEMPLATE_ID = 'TestDatetime';

const PRESET_VALUES = [
    { name: 'Last 24 hours', start: { days: -1 }, end: null },
    { name: 'Last 7 days', start: { days: -7 }, end: null }
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

    const originalStructuredClone = window.structuredClone;

    beforeAll(() => {
        window.structuredClone = (value) => JSON.parse(JSON.stringify(value));
    });

    afterAll(() => {
        window.structuredClone = originalStructuredClone;
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, KbqFilterBarModule, KbqLuxonDateModule, TestComponent],
            providers: [
                { provide: LOCALE_ID, useValue: 'ru-RU' },
                DateFormatter
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

    registerPipeStatesTests({
        label: 'Datetime',
        pipeClass: 'kbq-pipe__datetime',
        createPipe,
        createFilter,
        nonEmptyValue: () => createCustomRangeValue().value,
        createContext: () => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));

            return { fixture, filterBar: filterBarDebugElement };
        }
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

    describe('defaultStart / defaultEnd', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should use start and end of today as defaults when pipe is empty', () => {
            const today = adapter.today();

            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: null })]);
            fixture.detectChanges();

            const component = getPipeComponent();

            expect(component.defaultStart.equals(today.startOf('day'))).toBe(true);
            expect(component.defaultEnd.equals(today.endOf('day'))).toBe(true);
        });

        it('should build defaults from relative preset value', () => {
            const today = adapter.today();

            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: PRESET_VALUES[0] })]);
            fixture.detectChanges();

            const component = getPipeComponent();

            expect(adapter.sameDate(component.defaultStart, today.plus(PRESET_VALUES[0].start as any))).toBe(true);
            expect(adapter.sameDate(component.defaultEnd, today)).toBe(true);
        });

        it('should clamp defaultEnd when the configured max is earlier than the raw default', () => {
            const max = adapter.today();

            fixture.componentInstance.pipeTemplates = [
                {
                    name: 'Datetime',
                    id: PIPE_TEMPLATE_ID,
                    type: KbqPipeTypes.Datetime,
                    values: PRESET_VALUES,
                    cleanable: false,
                    removable: false,
                    disabled: false,
                    maxDateTime: max.toISO()
                }
            ];
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: null })]);
            fixture.detectChanges();

            const component = getPipeComponent();
            const internal = asInternal(component);

            // raw default end is end of today, which is after max ('now') -> clamps down to max
            expect(component.defaultStart.equals(adapter.today().startOf('day'))).toBe(true);
            expect(adapter.compareDateTime(component.defaultEnd, internal.max)).toBe(0);
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
            const focusViaKeyboard = jest.fn();

            internal.popover = () => ({ updatePosition });
            internal.returnButton = () => ({ focusViaKeyboard });
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
            expect(focusViaKeyboard).toHaveBeenCalled();
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

            internal.popover = () => ({ updatePosition });
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

            asInternal(component).popover = () => ({ show });
            component.open();

            expect(show).toHaveBeenCalled();
        });
    });

    describe('onSelect', () => {
        beforeEach(() => {
            setupSinglePipe({ value: null });
        });

        it('should set data.value, emit onChangePipe, hide popover and restore focus', fakeAsync(() => {
            const component = getPipeComponent();
            const filterBar = getFilterBar();
            const spy = jest.fn();
            const hide = jest.fn();
            const focusViaSpy = jest.spyOn(TestBed.inject(FocusMonitor), 'focusVia');

            asInternal(component).popover = () => ({ hide });
            filterBar.onChangePipe.subscribe(spy);

            component.onSelect({ name: 'test', start: '', end: '' });

            expect(component.data.value).toEqual({ name: 'test', start: '', end: '' });
            expect(spy).toHaveBeenCalledWith(component.data);
            expect(hide).toHaveBeenCalled();

            flush();

            expect(focusViaSpy).toHaveBeenCalledWith(expect.any(HTMLButtonElement), expect.anything());
        }));
    });

    describe('onApplyPeriod', () => {
        beforeEach(() => {
            setupSinglePipe({ value: null });
        });

        it('should save custom period as ISO strings, emit onChangePipe and restore focus', fakeAsync(() => {
            const component = getPipeComponent();
            const internal = asInternal(component);
            const filterBar = getFilterBar();
            const spy = jest.fn();
            const hide = jest.fn();
            const focusViaSpy = jest.spyOn(TestBed.inject(FocusMonitor), 'focusVia');
            const start = adapter.today().minus({ days: 5 }).set({ hour: 8, minute: 30, second: 0, millisecond: 0 });
            const end = adapter.today().set({ hour: 17, minute: 5, second: 0, millisecond: 0 });

            internal.popover = () => ({ hide });
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

            flush();

            expect(focusViaSpy).toHaveBeenCalledWith(expect.any(HTMLButtonElement), expect.anything());
        }));
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

        it('should be true when end control is invalid', () => {
            const component = getPipeComponent();
            const internal = asInternal(component);

            component.showPeriod();
            internal.formGroup.controls.end.setErrors({ invalid: true });

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

            internal.popover = () => ({ updatePosition });

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
            component.popover().visibleChange.emit(false);

            expect(spy).toHaveBeenCalledWith(component.data);
        });

        it('should focus the period list when the popover opens so Enter can pick a preset', fakeAsync(() => {
            const component = getPipeComponent();
            const focus = jest.fn();

            asInternal(component).isListMode = true;
            asInternal(component).listSelection = () => ({ focus });

            component.popover().visibleChange.emit(true);
            flush();

            expect(focus).toHaveBeenCalled();
        }));
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

    describe('icon projection', () => {
        beforeEach(() => {
            setupSinglePipe({ value: null });
        });

        it('should render chevron icon inside list text, not in leading icon slot', fakeAsync(() => {
            const component = getPipeComponent();
            const overlayContainer = TestBed.inject(OverlayContainer).getContainerElement();

            component.open();
            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const customPeriodOption = overlayContainer.querySelector('kbq-list-option')!;
            const listText = customPeriodOption.querySelector('.kbq-list-text');
            const icon = customPeriodOption.querySelector('i[kbq-icon]');

            expect(listText?.contains(icon)).toBe(true);
        }));
    });

    describe('min / max bounds', () => {
        const setupWithBounds = (bounds: Partial<KbqPipeTemplate>): KbqPipeDatetimeComponent<DateTime> => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
            fixture.componentInstance.pipeTemplates = [
                {
                    name: 'Datetime',
                    id: PIPE_TEMPLATE_ID,
                    type: KbqPipeTypes.Datetime,
                    values: PRESET_VALUES,
                    cleanable: false,
                    removable: false,
                    disabled: false,
                    ...bounds
                }
            ];
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: null })]);
            fixture.detectChanges();

            return getPipeComponent();
        };

        it('should keep the full instant (single absolute window)', () => {
            const min = adapter.today().minus({ days: 5 }).set({ hour: 9, minute: 30, second: 15, millisecond: 500 });
            const max = adapter.today().plus({ days: 5 }).set({ hour: 18, minute: 45, second: 15, millisecond: 500 });

            const internal = asInternal(setupWithBounds({ minDateTime: min.toISO(), maxDateTime: max.toISO() }));

            expect(adapter.compareDateTime(internal.min, min)).toBe(0);
            expect(adapter.compareDateTime(internal.max, max)).toBe(0);
        });

        it('should accept a DateTime object, not only an ISO string', () => {
            const min = adapter.today().minus({ days: 2 }).set({ hour: 8, minute: 0, second: 0, millisecond: 0 });

            const internal = asInternal(setupWithBounds({ minDateTime: min }));

            expect(adapter.compareDateTime(internal.min, min)).toBe(0);
        });

        it('should leave bounds undefined when not configured', () => {
            const internal = asInternal(setupWithBounds({}));

            expect(internal.min).toBeUndefined();
            expect(internal.max).toBeUndefined();
        });

        it('startMax should fall back to the end value when max is unset', () => {
            const component = setupWithBounds({});

            component.showPeriod();

            const internal = asInternal(component);

            expect(internal.startMax).toBe(internal.formGroup.controls.end.value);
        });

        it('startMax should clamp to max, and end itself is already clamped there', () => {
            const max = adapter.today().minus({ days: 1 }).set({ hour: 12, minute: 0, second: 0, millisecond: 0 });
            const component = setupWithBounds({ maxDateTime: max.toISO() });

            component.showPeriod();

            const internal = asInternal(component);

            // default end (today end-of-day) is now clamped to max by defaultEnd, so both land on max.
            expect(adapter.compareDateTime(internal.formGroup.controls.end.value, max)).toBe(0);
            expect(adapter.compareDateTime(internal.startMax, max)).toBe(0);
        });

        it('should update bounds when pipeTemplates change while the pipe is already constructed', () => {
            const component = setupWithBounds({});

            expect(asInternal(component).min).toBeUndefined();

            const newMin = adapter.today().minus({ days: 10 });

            fixture.componentInstance.pipeTemplates = [
                {
                    name: 'Datetime',
                    id: PIPE_TEMPLATE_ID,
                    type: KbqPipeTypes.Datetime,
                    values: PRESET_VALUES,
                    cleanable: false,
                    removable: false,
                    disabled: false,
                    minDateTime: newMin.toISO()
                }
            ];
            fixture.detectChanges();

            expect(adapter.compareDateTime(asInternal(component).min, newMin)).toBe(0);
        });

        it('should bind each pipe instance to its own template bounds', () => {
            const OTHER_ID = 'OtherDatetime';
            const minA = adapter.today().minus({ days: 5 });
            const minB = adapter.today().minus({ days: 50 });

            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
            fixture.componentInstance.pipeTemplates = [
                {
                    name: 'Datetime',
                    id: PIPE_TEMPLATE_ID,
                    type: KbqPipeTypes.Datetime,
                    values: PRESET_VALUES,
                    cleanable: false,
                    removable: false,
                    disabled: false,
                    minDateTime: minA.toISO()
                },
                {
                    name: 'Other datetime',
                    id: OTHER_ID,
                    type: KbqPipeTypes.Datetime,
                    values: PRESET_VALUES,
                    cleanable: false,
                    removable: false,
                    disabled: false,
                    minDateTime: minB.toISO()
                }
            ];
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ value: null }),
                createPipe({ id: OTHER_ID, value: null })
            ]);
            fixture.detectChanges();

            expect(adapter.compareDateTime(asInternal(getPipeComponent(0)).min, minA)).toBe(0);
            expect(adapter.compareDateTime(asInternal(getPipeComponent(1)).min, minB)).toBe(0);
        });

        it('should treat an unparseable minDateTime/maxDateTime as no bound', () => {
            const internal = asInternal(
                setupWithBounds({ minDateTime: 'not-a-real-date', maxDateTime: 'also-not-a-real-date' })
            );

            expect(internal.min).toBeUndefined();
            expect(internal.max).toBeUndefined();
        });

        it('should not source bounds from a same-id template of a different pipe type', () => {
            const internal = asInternal(
                setupWithBounds({
                    type: KbqPipeTypes.Date,
                    minDateTime: adapter.today().minus({ days: 1 }).toISO()
                })
            );

            expect(internal.min).toBeUndefined();
        });
    });

    describe('min / max interval', () => {
        const setupWithInterval = (template: Partial<KbqPipeTemplate>): KbqPipeDatetimeComponent<DateTime> => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
            fixture.componentInstance.pipeTemplates = [
                {
                    name: 'Datetime',
                    id: PIPE_TEMPLATE_ID,
                    type: KbqPipeTypes.Datetime,
                    values: PRESET_VALUES,
                    cleanable: false,
                    removable: false,
                    disabled: false,
                    ...template
                }
            ];
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: null })]);
            fixture.detectChanges();

            return getPipeComponent();
        };

        const setRange = (component: KbqPipeDatetimeComponent<DateTime>, start: DateTime, end: DateTime) => {
            const internal = asInternal(component);

            component.showPeriod();
            internal.formGroup.controls.start.setValue(start);
            internal.formGroup.controls.end.setValue(end);
        };

        it('should flag a period shorter than minInterval (sub-day) and disable Apply', () => {
            const component = setupWithInterval({ minInterval: { hours: 2 } });
            const start = adapter.today().set({ hour: 9, minute: 0, second: 0, millisecond: 0 });

            setRange(component, start, start.plus({ hours: 1 }));

            expect(asInternal(component).formGroup.errors?.kbqDateIntervalMin).toBeTruthy();
            expect(component.disabled).toBe(true);
        });

        it('should flag a period longer than maxInterval (sub-day) and disable Apply', () => {
            const component = setupWithInterval({ maxInterval: { hours: 12 } });
            const start = adapter.today().set({ hour: 9, minute: 0, second: 0, millisecond: 0 });

            setRange(component, start, start.plus({ hours: 13 }));

            expect(asInternal(component).formGroup.errors?.kbqDateIntervalMax).toBeTruthy();
            expect(component.disabled).toBe(true);
        });

        it('should accept a period within the interval bounds', () => {
            const component = setupWithInterval({ minInterval: { hours: 1 }, maxInterval: { days: 7 } });
            const start = adapter.today().set({ hour: 9, minute: 0, second: 0, millisecond: 0 });

            setRange(component, start, start.plus({ hours: 5 }));

            expect(asInternal(component).formGroup.errors).toBeNull();
            expect(component.disabled).toBe(false);
        });

        it('should impose no interval constraint when unset', () => {
            const component = setupWithInterval({});
            const start = adapter.today().set({ hour: 9, minute: 0, second: 0, millisecond: 0 });

            setRange(component, start, start.plus({ hours: 1 }));

            expect(asInternal(component).formGroup.errors).toBeNull();
            expect(component.disabled).toBe(false);
        });

        it('should extend the default end to satisfy minInterval when the pipe has no stored value', () => {
            const component = setupWithInterval({ minInterval: { days: 2 } });

            // Read both sides of the pair from the same showPeriod()-seeded FormGroup (a single
            // computeDefaultRange() call), not from two independent defaultStart/defaultEnd getter reads,
            // which each resolve their own `today()` and can differ by a stray millisecond under load.
            component.showPeriod();
            const { start, end } = asInternal(component).formGroup.controls;

            expect(adapter.compareDateTime(end.value, start.value.plus({ days: 2 }))).toBe(0);
        });

        it('should shrink the default end to satisfy maxInterval when the pipe has no stored value', () => {
            const component = setupWithInterval({ maxInterval: { hours: 12 } });

            component.showPeriod();
            const { start, end } = asInternal(component).formGroup.controls;

            expect(adapter.compareDateTime(end.value, start.value.plus({ hours: 12 }))).toBe(0);
        });

        it('should pull the default start back when [min, max] alone cannot fit minInterval', () => {
            // Fixed offset from midnight (not wall-clock "now") so the scenario is deterministic: this
            // reproduces the shipped docs example (minDateTime/maxDateTime + minInterval on the same
            // template), where `max` can land soon after local midnight.
            const maxDateTime = adapter.today().startOf('day').plus({ minutes: 30 });
            const component = setupWithInterval({
                minDateTime: adapter.today().minus({ days: 7 }).toISO(),
                maxDateTime: maxDateTime.toISO(),
                minInterval: { hours: 1 }
            });
            const internal = asInternal(component);

            component.showPeriod();
            const { start, end } = internal.formGroup.controls;

            expect(adapter.compareDateTime(end.value, internal.max)).toBe(0);
            expect(adapter.compareDateTime(start.value, end.value.minus({ hours: 1 }))).toBe(0);
        });

        it('should treat a malformed minInterval/maxInterval object as no constraint instead of crashing', () => {
            const component = setupWithInterval({ minInterval: { days: true } as any, maxInterval: 'P1D' as any });
            const internal = asInternal(component);

            expect(internal.minInterval).toBeUndefined();
            expect(internal.maxInterval).toBeUndefined();
            expect(() => component.defaultEnd).not.toThrow();
        });

        it('should treat a bare number as no constraint, not silently as milliseconds', () => {
            const component = setupWithInterval({ minInterval: 5 as any });

            expect(asInternal(component).minInterval).toBeUndefined();
        });

        it('should re-validate an already-open editor when minInterval changes live', () => {
            const component = setupWithInterval({});
            const internal = asInternal(component);

            component.showPeriod();

            const start = adapter.today().set({ hour: 9, minute: 0, second: 0, millisecond: 0 });

            internal.formGroup.controls.start.setValue(start);
            internal.formGroup.controls.end.setValue(start.plus({ hours: 3 }));

            expect(internal.formGroup.errors).toBeNull();

            fixture.componentInstance.pipeTemplates = [
                {
                    name: 'Datetime',
                    id: PIPE_TEMPLATE_ID,
                    type: KbqPipeTypes.Datetime,
                    values: PRESET_VALUES,
                    cleanable: false,
                    removable: false,
                    disabled: false,
                    minInterval: { hours: 5 }
                }
            ];
            fixture.detectChanges();

            expect(internal.formGroup.errors?.kbqDateIntervalMin).toBeTruthy();
        });

        it('should interpolate the locale-formatted minInterval into the hint, passing the matching units', () => {
            const component = setupWithInterval({ minInterval: { hours: 2 } });
            const spy = jest.spyOn(asInternal(component).formatter, 'durationLong').mockReturnValue('SENTINEL');

            const hint = component.minIntervalErrorHint;

            expect(spy).toHaveBeenCalledWith(expect.anything(), expect.anything(), ['hours']);
            expect(hint).toContain('SENTINEL');
            expect(hint).not.toContain('{{ value }}');
        });

        it('should interpolate the locale-formatted maxInterval into the hint, passing the matching units', () => {
            const component = setupWithInterval({ maxInterval: { days: 7 } });
            const spy = jest.spyOn(asInternal(component).formatter, 'durationLong').mockReturnValue('SENTINEL');

            const hint = component.maxIntervalErrorHint;

            expect(spy).toHaveBeenCalledWith(expect.anything(), expect.anything(), ['days']);
            expect(hint).toContain('SENTINEL');
            expect(hint).not.toContain('{{ value }}');
        });

        it('should pass the "months" unit for a { months: N } interval, as used by the docs example', () => {
            const component = setupWithInterval({ maxInterval: { months: 3 } });
            const spy = jest.spyOn(asInternal(component).formatter, 'durationLong').mockReturnValue('SENTINEL');

            void component.maxIntervalErrorHint;

            expect(spy).toHaveBeenCalledWith(expect.anything(), expect.anything(), ['months']);
        });

        it('should pass the "weeks" unit for a { weeks: N } interval', () => {
            const component = setupWithInterval({ minInterval: { weeks: 2 } });
            const spy = jest.spyOn(asInternal(component).formatter, 'durationLong').mockReturnValue('SENTINEL');

            void component.minIntervalErrorHint;

            expect(spy).toHaveBeenCalledWith(expect.anything(), expect.anything(), ['weeks']);
        });

        it('should pass all matching units for a multi-unit interval', () => {
            const component = setupWithInterval({ minInterval: { days: 1, hours: 12 } });
            const spy = jest.spyOn(asInternal(component).formatter, 'durationLong').mockReturnValue('SENTINEL');

            void component.minIntervalErrorHint;

            expect(spy).toHaveBeenCalledWith(expect.anything(), expect.anything(), ['days', 'hours']);
        });
    });

    describe('interval hint rendering', () => {
        it('should render the interpolated minInterval hint text in the popover', fakeAsync(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
            fixture.componentInstance.pipeTemplates = [
                {
                    name: 'Datetime',
                    id: PIPE_TEMPLATE_ID,
                    type: KbqPipeTypes.Datetime,
                    values: PRESET_VALUES,
                    cleanable: false,
                    removable: false,
                    disabled: false,
                    minInterval: { hours: 5 }
                }
            ];
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: null })]);
            fixture.detectChanges();

            const component = getPipeComponent();
            const overlayContainer = TestBed.inject(OverlayContainer).getContainerElement();

            component.open();
            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const internal = asInternal(component);

            // showPeriod()'s deferred focus-restore isn't relevant to hint rendering; stub it out so the
            // real (isListMode-driven) template swap below isn't gated on the returnButton view query.
            internal.returnButton = () => ({ focusViaKeyboard: () => {} });

            component.showPeriod();
            fixture.detectChanges();
            flush();

            const start = adapter.today().set({ hour: 9, minute: 0, second: 0, millisecond: 0 });

            internal.formGroup.controls.start.setValue(start);
            internal.formGroup.controls.end.setValue(start.plus({ hours: 2 }));
            fixture.detectChanges();

            const hint = overlayContainer.querySelector('.kbq-date-period__hint');

            expect(hint?.textContent?.trim()).toBe(component.minIntervalErrorHint);
        }));
    });
});

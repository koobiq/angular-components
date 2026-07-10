import { FocusMonitor } from '@angular/cdk/a11y';
import { ChangeDetectorRef, Component, DebugElement, inject } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ENTER, ESCAPE } from '@koobiq/components/core';
import {
    KbqFilter,
    KbqFilterBar,
    KbqFilterBarModule,
    KbqPipe,
    KbqPipeTemplate,
    KbqPipeTypes
} from '@koobiq/components/filter-bar';
import { KbqBasePipe } from './base-pipe';
import { registerPipeStatesTests } from './pipe-states.spec-helper';
import { KbqPipeTextComponent } from './pipe-text';

const PIPE_TEMPLATE_ID = 'TestText';

const createPipe = (overrides: Partial<KbqPipe>): KbqPipe => ({
    name: 'test',
    id: PIPE_TEMPLATE_ID,
    type: KbqPipeTypes.Text,
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
            name: 'Text',
            id: PIPE_TEMPLATE_ID,
            type: KbqPipeTypes.Text,
            cleanable: false,
            removable: false,
            disabled: false
        }
    ];
}

describe('KbqPipeTextComponent', () => {
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
            .overrideComponent(KbqPipeTextComponent, {
                set: {
                    providers: [{ provide: KbqBasePipe, useExisting: KbqPipeTextComponent }]
                }
            })
            .compileComponents();
    });

    const getPipeComponent = (index: number = 0): KbqPipeTextComponent => {
        const pipes = fixture.debugElement.queryAll(By.css('kbq-pipe-text'));

        return pipes[index].componentInstance;
    };

    const getFilterBar = (): KbqFilterBar => {
        return filterBarDebugElement.componentInstance;
    };

    registerPipeStatesTests({
        label: 'Text',
        pipeClass: 'kbq-pipe__text',
        createPipe,
        createFilter,
        nonEmptyValue: () => 'some text',
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
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: null })]);
            fixture.detectChanges();

            expect(getPipeComponent().isEmpty).toBe(true);
        });

        it('should not be empty when value is a string', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: 'some text' })]);
            fixture.detectChanges();

            expect(getPipeComponent().isEmpty).toBe(false);
        });

        it('should not be empty when value is an empty string', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: '' })]);
            fixture.detectChanges();

            // base class checks === null || === undefined, not falsy
            expect(getPipeComponent().isEmpty).toBe(false);
        });
    });

    describe('disabled getter', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should be disabled when control value is null', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: null })]);
            fixture.detectChanges();

            expect(getPipeComponent().disabled).toBe(true);
        });

        it('should be disabled when control value is empty string', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: '' })]);
            fixture.detectChanges();

            expect(getPipeComponent().disabled).toBe(true);
        });

        it('should not be disabled when control has text', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: 'some text' })]);
            fixture.detectChanges();

            expect(getPipeComponent().disabled).toBe(false);
        });
    });

    describe('ngOnInit', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should initialize control with data.value', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: 'initial value' })]);
            fixture.detectChanges();

            expect(getPipeComponent().control.value).toBe('initial value');
        });

        it('should initialize control with null when data.value is null', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: null })]);
            fixture.detectChanges();

            expect(getPipeComponent().control.value).toBeNull();
        });
    });

    describe('onApply', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should set data.value from control value', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: null })]);
            fixture.detectChanges();

            const component = getPipeComponent();

            component.control.setValue('new text');
            component.onApply();
            flush();

            expect(component.data.value).toBe('new text');
        }));

        it('should mark control as pristine after apply', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: null })]);
            fixture.detectChanges();

            const component = getPipeComponent();

            component.control.setValue('new text');
            component.control.markAsDirty();
            component.onApply();
            flush();

            expect(component.control.pristine).toBe(true);
        }));

        it('should call popover.hide()', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: 'some text' })]);
            fixture.detectChanges();

            const component = getPipeComponent();
            const hideSpy = jest.spyOn(component.popover(), 'hide');

            component.onApply();
            flush();

            expect(hideSpy).toHaveBeenCalled();
        }));

        it('should restore focus to the trigger button after apply', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: 'some text' })]);
            fixture.detectChanges();

            const focusViaSpy = jest.spyOn(TestBed.inject(FocusMonitor), 'focusVia');

            getPipeComponent().onApply();
            flush();

            expect(focusViaSpy).toHaveBeenCalledWith(expect.any(HTMLButtonElement), expect.anything());
        }));

        it('should emit onChangePipe event', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: 'some text' })]);
            fixture.detectChanges();

            const filterBar = getFilterBar();
            const spy = jest.fn();

            filterBar.onChangePipe.subscribe(spy);

            getPipeComponent().onApply();
            flush();

            expect(spy).toHaveBeenCalled();
        }));
    });

    describe('onKeydown', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should call onApply on Ctrl+Enter when not disabled', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: 'some text' })]);
            fixture.detectChanges();

            const component = getPipeComponent();
            const applySpy = jest.spyOn(component, 'onApply');
            const event = new KeyboardEvent('keydown', { keyCode: ENTER, ctrlKey: true });

            component.onKeydown(event);

            expect(applySpy).toHaveBeenCalled();
        });

        it('should call onApply on Cmd+Enter (metaKey) when not disabled', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: 'some text' })]);
            fixture.detectChanges();

            const component = getPipeComponent();
            const applySpy = jest.spyOn(component, 'onApply');
            const event = new KeyboardEvent('keydown', { keyCode: ENTER, metaKey: true });

            component.onKeydown(event);

            expect(applySpy).toHaveBeenCalled();
        });

        it('should not call onApply on Ctrl+Enter when disabled (empty control)', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: null })]);
            fixture.detectChanges();

            const component = getPipeComponent();
            const applySpy = jest.spyOn(component, 'onApply');
            const event = new KeyboardEvent('keydown', { keyCode: ENTER, ctrlKey: true });

            component.onKeydown(event);

            expect(applySpy).not.toHaveBeenCalled();
        });

        it('should not call onApply for other keys', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: 'some text' })]);
            fixture.detectChanges();

            const component = getPipeComponent();
            const applySpy = jest.spyOn(component, 'onApply');
            const event = new KeyboardEvent('keydown', { keyCode: ESCAPE, ctrlKey: true });

            component.onKeydown(event);

            expect(applySpy).not.toHaveBeenCalled();
        });

        it('should not call onApply for Enter without Ctrl or Meta', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: 'some text' })]);
            fixture.detectChanges();

            const component = getPipeComponent();
            const applySpy = jest.spyOn(component, 'onApply');
            const event = new KeyboardEvent('keydown', { keyCode: ENTER });

            component.onKeydown(event);

            expect(applySpy).not.toHaveBeenCalled();
        });
    });

    describe('onClear', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should set data.value to null', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: 'some text' })]);
            fixture.detectChanges();

            const component = getPipeComponent();

            component.onClear();

            expect(component.data.value).toBeNull();
        });

        it('should reset control value', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: 'some text' })]);
            fixture.detectChanges();

            const component = getPipeComponent();

            component.onClear();

            expect(component.control.value).toBeNull();
        });

        it('should emit onClearPipe event', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: 'some text' })]);
            fixture.detectChanges();

            const filterBar = getFilterBar();
            const spy = jest.fn();

            filterBar.onClearPipe.subscribe(spy);

            getPipeComponent().onClear();

            expect(spy).toHaveBeenCalled();
        });

        it('should emit onChangePipe event', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: 'some text' })]);
            fixture.detectChanges();

            const filterBar = getFilterBar();
            const spy = jest.fn();

            filterBar.onChangePipe.subscribe(spy);

            getPipeComponent().onClear();

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('open', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should call popover.show()', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: null })]);
            fixture.detectChanges();

            const component = getPipeComponent();
            const showSpy = jest.spyOn(component.popover(), 'show');

            component.open();

            expect(showSpy).toHaveBeenCalled();
        });
    });

    describe('ngAfterViewInit / popover visibleChange', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should emit onClosePipe when popover hides (visible=false)', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ name: 'test', value: 'some text' })]);
            fixture.detectChanges();

            const filterBar = getFilterBar();
            const spy = jest.fn();

            filterBar.onClosePipe.subscribe(spy);

            getPipeComponent().popover().visibleChange.emit(false);

            expect(spy).toHaveBeenCalledWith(expect.objectContaining({ name: 'test' }));
        });

        it('should not emit onClosePipe when popover shows (visible=true)', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ name: 'test', value: 'some text' })]);
            fixture.detectChanges();

            const filterBar = getFilterBar();
            const spy = jest.fn();

            filterBar.onClosePipe.subscribe(spy);

            getPipeComponent().popover().visibleChange.emit(true);

            expect(spy).not.toHaveBeenCalled();
        });
    });
});

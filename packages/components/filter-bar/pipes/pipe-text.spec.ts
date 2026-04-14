import { ChangeDetectorRef, Component, DebugElement, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    KbqFilter,
    KbqFilterBar,
    KbqFilterBarModule,
    KbqPipe,
    KbqPipeTemplate,
    KbqPipeTypes
} from '@koobiq/components/filter-bar';
import { KbqBasePipe } from './base-pipe';
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

    window.structuredClone = (value) => JSON.parse(JSON.stringify(value));

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

    describe('Pipe states', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({
                    name: 'required',
                    value: 'some text',
                    cleanable: false,
                    removable: false,
                    disabled: false
                }),
                createPipe({ name: 'empty', value: null, cleanable: true, removable: false, disabled: false }),
                createPipe({
                    name: 'cleanable',
                    value: 'some text',
                    cleanable: true,
                    removable: false,
                    disabled: false
                }),
                createPipe({
                    name: 'removable',
                    value: 'some text',
                    cleanable: false,
                    removable: true,
                    disabled: false
                }),
                createPipe({ name: 'disabled', value: 'some text', cleanable: false, removable: false, disabled: true })
            ]);
            fixture.detectChanges();
        });

        it('should render all Text pipes', () => {
            const pipes = filterBarDebugElement.queryAll(By.css('.kbq-pipe'));

            expect(pipes.length).toBe(5);
            pipes.forEach((pipe) => {
                expect(pipe.nativeElement.classList).toContain('kbq-pipe__text');
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

        it('should set data.value from control value', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: null })]);
            fixture.detectChanges();

            const component = getPipeComponent();

            component.control.setValue('new text');
            component.onApply();

            expect(component.data.value).toBe('new text');
        });

        it('should mark control as pristine after apply', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: null })]);
            fixture.detectChanges();

            const component = getPipeComponent();

            component.control.setValue('new text');
            component.control.markAsDirty();
            component.onApply();

            expect(component.control.pristine).toBe(true);
        });

        it('should call popover.hide()', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: 'some text' })]);
            fixture.detectChanges();

            const component = getPipeComponent();
            const hideSpy = jest.spyOn(component.popover, 'hide');

            component.onApply();

            expect(hideSpy).toHaveBeenCalled();
        });

        it('should emit onChangePipe event', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: 'some text' })]);
            fixture.detectChanges();

            const filterBar = getFilterBar();
            const spy = jest.fn();

            filterBar.onChangePipe.subscribe(spy);

            getPipeComponent().onApply();

            expect(spy).toHaveBeenCalled();
        });
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
            const event = new KeyboardEvent('keydown', { keyCode: 13, ctrlKey: true });

            component.onKeydown(event);

            expect(applySpy).toHaveBeenCalled();
        });

        it('should call onApply on Cmd+Enter (metaKey) when not disabled', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: 'some text' })]);
            fixture.detectChanges();

            const component = getPipeComponent();
            const applySpy = jest.spyOn(component, 'onApply');
            const event = new KeyboardEvent('keydown', { keyCode: 13, metaKey: true });

            component.onKeydown(event);

            expect(applySpy).toHaveBeenCalled();
        });

        it('should not call onApply on Ctrl+Enter when disabled (empty control)', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: null })]);
            fixture.detectChanges();

            const component = getPipeComponent();
            const applySpy = jest.spyOn(component, 'onApply');
            const event = new KeyboardEvent('keydown', { keyCode: 13, ctrlKey: true });

            component.onKeydown(event);

            expect(applySpy).not.toHaveBeenCalled();
        });

        it('should not call onApply for other keys', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: 'some text' })]);
            fixture.detectChanges();

            const component = getPipeComponent();
            const applySpy = jest.spyOn(component, 'onApply');
            const event = new KeyboardEvent('keydown', { keyCode: 27, ctrlKey: true }); // Escape

            component.onKeydown(event);

            expect(applySpy).not.toHaveBeenCalled();
        });

        it('should not call onApply for Enter without Ctrl or Meta', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: 'some text' })]);
            fixture.detectChanges();

            const component = getPipeComponent();
            const applySpy = jest.spyOn(component, 'onApply');
            const event = new KeyboardEvent('keydown', { keyCode: 13 });

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
            const showSpy = jest.spyOn(component.popover, 'show');

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

            getPipeComponent().popover.visibleChange.emit(false);

            expect(spy).toHaveBeenCalledWith(expect.objectContaining({ name: 'test' }));
        });

        it('should not emit onClosePipe when popover shows (visible=true)', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ name: 'test', value: 'some text' })]);
            fixture.detectChanges();

            const filterBar = getFilterBar();
            const spy = jest.fn();

            filterBar.onClosePipe.subscribe(spy);

            getPipeComponent().popover.visibleChange.emit(true);

            expect(spy).not.toHaveBeenCalled();
        });
    });
});

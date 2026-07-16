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
    KbqPipeTypes
} from '@koobiq/components/filter-bar';
import { KbqBasePipe } from './base-pipe';
import { KbqPipeInputComponent } from './pipe-input';
import { registerPipeStatesTests } from './pipe-states.spec-helper';

const PIPE_TEMPLATE_ID = 'TestInput';

const createPipe = (overrides: Partial<KbqPipe>): KbqPipe => ({
    name: 'test',
    id: PIPE_TEMPLATE_ID,
    type: KbqPipeTypes.Input,
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
            name: 'Input',
            id: PIPE_TEMPLATE_ID,
            type: KbqPipeTypes.Input,
            cleanable: false,
            removable: false,
            disabled: false
        }
    ];
}

describe('KbqPipeInputComponent', () => {
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
            .overrideComponent(KbqPipeInputComponent, {
                set: {
                    providers: [{ provide: KbqBasePipe, useExisting: KbqPipeInputComponent }]
                }
            })
            .compileComponents();
    });

    const createFixture = () => {
        fixture = TestBed.createComponent(TestComponent);
        filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
    };

    const getPipeComponent = (index: number = 0): KbqPipeInputComponent => {
        return fixture.debugElement.queryAll(By.css('kbq-pipe-input'))[index].componentInstance;
    };

    const getFilterBar = (): KbqFilterBar => filterBarDebugElement.componentInstance;

    const getInputElement = (index: number = 0): HTMLInputElement => {
        return fixture.debugElement.queryAll(By.css('kbq-pipe-input input'))[index].nativeElement;
    };

    /** The `kbq-cleaner` host, or null while the form-field hides it (empty value / disabled / not cleanable). */
    const getCleanerElement = (): HTMLElement | null => {
        return fixture.debugElement.query(By.css('kbq-pipe-input kbq-cleaner'))?.nativeElement ?? null;
    };

    /** Types through the value accessor: it reads `$event.target.value` on `input`. */
    const typeInto = (value: string, index: number = 0) => {
        const input = getInputElement(index);

        input.value = value;
        input.dispatchEvent(new Event('input'));
        fixture.detectChanges();
    };

    const blurInput = (relatedTarget: EventTarget | null = null, index: number = 0) => {
        getInputElement(index).dispatchEvent(new FocusEvent('blur', { relatedTarget }));
        fixture.detectChanges();
    };

    const pressEnter = (index: number = 0) => {
        getInputElement(index).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        fixture.detectChanges();
    };

    registerPipeStatesTests({
        label: 'Input',
        pipeClass: 'kbq-pipe__input',
        createPipe,
        createFilter,
        nonEmptyValue: () => 'some text',
        createContext: () => {
            createFixture();

            return { fixture, filterBar: filterBarDebugElement };
        }
    });

    describe('isEmpty', () => {
        beforeEach(createFixture);

        it('should be true when value is null', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: null })]);
            fixture.detectChanges();

            expect(getPipeComponent().isEmpty).toBe(true);
        });

        it('should be true for an empty string, unlike the base implementation', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: '' })]);
            fixture.detectChanges();

            expect(getPipeComponent().isEmpty).toBe(true);
        });

        it('should be false when value is set', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: 'some text' })]);
            fixture.detectChanges();

            expect(getPipeComponent().isEmpty).toBe(false);
        });
    });

    describe('ngOnInit', () => {
        beforeEach(createFixture);

        it('should seed the control from data.value', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: 'some text' })]);
            fixture.detectChanges();

            expect(getPipeComponent().control.value).toBe('some text');
        });

        it('should not emit onClearPipe while seeding an empty pipe', () => {
            const spy = jest.fn();

            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: null })]);
            fixture.detectChanges();
            getFilterBar().onClearPipe.subscribe(spy);
            fixture.detectChanges();

            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('rendering', () => {
        beforeEach(createFixture);

        it('should use data.name as placeholder and aria-label', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ name: 'Author', value: null })]);
            fixture.detectChanges();

            const input = getInputElement();

            expect(input.placeholder).toBe('Author');
            expect(input.getAttribute('aria-label')).toBe('Author');
        });

        it('should render no trigger button', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: 'some text' })]);
            fixture.detectChanges();

            expect(fixture.debugElement.query(By.css('kbq-pipe-input button'))).toBeNull();
        });

        // Guards the single-root-element rule of the `@if` around `<kbq-cleaner />`: a second node in the
        // block stops the compiler forwarding the tag name, and the cleaner falls through to the
        // form-field's wildcard `<ng-content />` inside `.kbq-form-field__infix` — unwired and unstyled.
        it('should project the cleaner into the form-field suffix, not the infix', () => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ value: 'some text', cleanable: true })
            ]);
            fixture.detectChanges();

            expect(getCleanerElement()!.closest('.kbq-form-field__cleaner')).not.toBeNull();
            expect(getCleanerElement()!.closest('.kbq-form-field__infix')).toBeNull();
        });

        it('should not render the cleaner when the pipe is not cleanable', () => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ value: 'some text', cleanable: false })
            ]);
            fixture.detectChanges();

            expect(getCleanerElement()).toBeNull();
        });

        it('should not render the cleaner when disabled', () => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ value: 'some text', cleanable: true, disabled: true })
            ]);
            fixture.detectChanges();

            expect(getCleanerElement()).toBeNull();
        });
    });

    describe('commit', () => {
        beforeEach(createFixture);

        it('should commit on Enter', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: null })]);
            fixture.detectChanges();

            typeInto('new text');
            pressEnter();

            expect(getPipeComponent().data.value).toBe('new text');
        });

        it('should commit on blur', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: null })]);
            fixture.detectChanges();

            typeInto('new text');
            blurInput();

            expect(getPipeComponent().data.value).toBe('new text');
        });

        it('should emit onChangePipe on commit', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: null })]);
            fixture.detectChanges();

            const spy = jest.fn();

            getFilterBar().onChangePipe.subscribe(spy);

            typeInto('new text');
            blurInput();

            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should normalize an empty string to null', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: 'some text' })]);
            fixture.detectChanges();

            typeInto('');
            blurInput();

            expect(getPipeComponent().data.value).toBeNull();
        });

        // `KbqTrim` auto-applies to `[kbqInput]`, so a whitespace-only value reaches the control as ''.
        it('should commit a whitespace-only value as null', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: 'some text' })]);
            fixture.detectChanges();

            typeInto('   ');
            blurInput();

            expect(getPipeComponent().data.value).toBeNull();
        });

        it('should not emit when blurring without a change', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: 'some text' })]);
            fixture.detectChanges();

            const spy = jest.fn();

            getFilterBar().onChangePipe.subscribe(spy);

            blurInput();

            expect(spy).not.toHaveBeenCalled();
        });

        // A pipe added from a template carries no `value` key at all, so `data.value` is `undefined`. A plain
        // `===` against `null` would miss, and merely tabbing through a fresh pipe would mark the filter changed.
        it('should not mark the filter changed when blurring an untouched freshly-added pipe', () => {
            const pipe = createPipe({});

            delete (pipe as Partial<KbqPipe>).value;

            fixture.componentInstance.activeFilter = createFilter([pipe as KbqPipe]);
            fixture.detectChanges();

            const spy = jest.fn();

            getFilterBar().onChangePipe.subscribe(spy);

            blurInput();

            expect(spy).not.toHaveBeenCalled();
            expect(getFilterBar().filter()?.changed).toBe(false);
        });
    });

    describe('clearing', () => {
        beforeEach(createFixture);

        // `KbqFormField.clearValue()` and the Escape handler only reset the control; the pipe bridges that
        // back into `data`. Driving `reset()` directly covers both entry points at the seam the pipe owns.
        it('should propagate a control reset to data and emit onClearPipe', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: 'some text' })]);
            fixture.detectChanges();

            const spy = jest.fn();

            getFilterBar().onClearPipe.subscribe(spy);

            getPipeComponent().control.reset();
            fixture.detectChanges();

            expect(getPipeComponent().data.value).toBeNull();
            expect(spy).toHaveBeenCalledTimes(1);
        });

        // Typing pushes strings only, so an emptied input must not read as a clear.
        it('should not emit onClearPipe when the text is deleted by typing', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: 'some text' })]);
            fixture.detectChanges();

            const spy = jest.fn();

            getFilterBar().onClearPipe.subscribe(spy);

            typeInto('');

            expect(spy).not.toHaveBeenCalled();
        });

        it('should clear the pipe when the cleaner is clicked', () => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ value: 'some text', cleanable: true })
            ]);
            fixture.detectChanges();

            const spy = jest.fn();

            getFilterBar().onClearPipe.subscribe(spy);

            getCleanerElement()!.click();
            fixture.detectChanges();

            expect(getPipeComponent().data.value).toBeNull();
            expect(spy).toHaveBeenCalledTimes(1);
        });

        // The cleaner is focusable, so clicking it blurs the input first. Committing on that blur would emit
        // the text being discarded, then emit again on clear — two events, the first one stale.
        it('should emit onChangePipe once with null when clearing uncommitted text', () => {
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ value: 'some text', cleanable: true })
            ]);
            fixture.detectChanges();

            const spy = jest.fn();

            getFilterBar().onChangePipe.subscribe(spy);

            typeInto('uncommitted');
            blurInput(getCleanerElement());
            getCleanerElement()!.click();
            fixture.detectChanges();

            expect(spy).toHaveBeenCalledTimes(1);
            expect(getPipeComponent().data.value).toBeNull();
        });

        it('should reset the control when cleared programmatically', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: 'some text' })]);
            fixture.detectChanges();

            const component = getPipeComponent();

            component.onClear();
            fixture.detectChanges();

            expect(component.control.value).toBeNull();
            expect(component.data.value).toBeNull();
        });

        it('should emit onClearPipe exactly once when cleared programmatically', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: 'some text' })]);
            fixture.detectChanges();

            const spy = jest.fn();

            getFilterBar().onClearPipe.subscribe(spy);

            getPipeComponent().onClear();
            fixture.detectChanges();

            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    describe('disabled', () => {
        beforeEach(createFixture);

        it('should disable the control', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: 'some text', disabled: true })]);
            fixture.detectChanges();

            expect(getPipeComponent().control.disabled).toBe(true);
            expect(getInputElement().disabled).toBe(true);
        });

        it('should not emit onClearPipe while disabling an empty pipe', () => {
            const spy = jest.fn();

            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: null, disabled: true })]);
            fixture.detectChanges();
            getFilterBar().onClearPipe.subscribe(spy);
            fixture.detectChanges();

            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('open', () => {
        beforeEach(createFixture);

        it('should focus the input', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: null })]);
            fixture.detectChanges();

            getPipeComponent().open();

            expect(document.activeElement).toBe(getInputElement());
        });

        it('should focus the input on openOnAdd', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: null, openOnAdd: true })]);
            fixture.detectChanges();
            flush();

            expect(document.activeElement).toBe(getInputElement());
        }));

        it('should focus the input when the filter-bar requests it by id', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ value: null })]);
            fixture.detectChanges();

            getFilterBar().openPipe.next(PIPE_TEMPLATE_ID);
            flush();

            expect(document.activeElement).toBe(getInputElement());
        }));
    });
});

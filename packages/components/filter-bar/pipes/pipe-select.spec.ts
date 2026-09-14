import { FocusMonitor } from '@angular/cdk/a11y';
import { ChangeDetectorRef, Component, DebugElement, inject, TemplateRef, viewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { dispatchKeyboardEvent, ENTER } from '@koobiq/components/core';
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
import { registerPipeStatesTests } from './pipe-states.spec-helper';

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

        <ng-template #optionTemplate let-option="option">custom {{ option.name }}</ng-template>
    `
})
class TestComponent {
    readonly changeDetectorRef = inject(ChangeDetectorRef);

    readonly optionTemplate = viewChild.required<TemplateRef<any>>('optionTemplate');

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

        pipe.select().open();
        fixture.detectChanges();
    };

    registerPipeStatesTests({
        label: 'Select',
        pipeClass: 'kbq-pipe__select',
        createPipe,
        createFilter,
        nonEmptyValue: () => SELECT_VALUES[0],
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

    describe('keyboard selection & focus restore', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        const enterSelectsAndRestoresFocus = (search: boolean) => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ name: 'test', value: null, search })]);
            fixture.detectChanges();

            const component = getPipeComponent();
            const filterBar = getFilterBar();
            const changeSpy = jest.fn();
            const focusViaSpy = jest.spyOn(TestBed.inject(FocusMonitor), 'focusVia');

            filterBar.onChangePipe.subscribe(changeSpy);

            const selectEl = fixture.debugElement.query(By.css('kbq-select')).nativeElement;

            component.select().open();
            flush();
            fixture.detectChanges();

            // Highlight the first option, then confirm it with Enter.
            component.select().keyManager.setActiveItem(0);
            dispatchKeyboardEvent(selectEl, 'keydown', ENTER);
            flush();
            fixture.detectChanges();

            expect(changeSpy).toHaveBeenCalled();
            expect(component.data.value).toEqual(SELECT_VALUES[0]);
            expect(component.select().panelOpen).toBe(false);
            // The keyboard origin is what actually keeps the focus ring visible.
            expect(focusViaSpy).toHaveBeenCalledWith(expect.any(HTMLButtonElement), 'keyboard');
        };

        it('should select the active option with Enter and restore focus (no search)', fakeAsync(() => {
            enterSelectsAndRestoresFocus(false);
        }));

        it('should select the active option with Enter and restore focus (with search)', fakeAsync(() => {
            enterSelectsAndRestoresFocus(true);
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

        const setTemplateWithComparator = () => {
            fixture.componentInstance.pipeTemplates = [
                {
                    name: 'Select',
                    id: PIPE_TEMPLATE_ID,
                    type: KbqPipeTypes.Select,
                    values: SELECT_VALUES,
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
            setTemplateWithComparator();
            fixture.componentInstance.activeFilter = createFilter([createPipe({ name: 'test', value: null })]);
            fixture.detectChanges();

            expect(getPipeComponent().select().compareWith).toBe(customCompare);
        });

        it('should use the default id comparator when the template omits compareWith', () => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ name: 'test', value: null })]);
            fixture.detectChanges();

            const component = getPipeComponent();

            expect(component.select().compareWith).toBe(component.compareByValue);
        });

        it('should clear a previously set compareWith when a later template update omits it', () => {
            setTemplateWithComparator();
            fixture.componentInstance.activeFilter = createFilter([createPipe({ name: 'test', value: null })]);
            fixture.detectChanges();

            expect(getPipeComponent().select().compareWith).toBe(customCompare);

            // A follow-up pipeTemplates update for the same pipe id that omits compareWith (e.g. new
            // id-based values) must fall back to the default comparator, not keep forwarding the stale one.
            fixture.componentInstance.pipeTemplates = [
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
            fixture.detectChanges();

            const component = getPipeComponent();

            expect(component.select().compareWith).toBe(component.compareByValue);
        });

        it('should forward compareWith from a later template update even when it omits values', () => {
            // First render with an id-based template (no compareWith) → default comparator.
            fixture.componentInstance.pipeTemplates = [
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
            fixture.componentInstance.activeFilter = createFilter([createPipe({ name: 'test', value: null })]);
            fixture.detectChanges();

            expect(getPipeComponent().select().compareWith).toBe(getPipeComponent().compareByValue);

            // A follow-up update for the same pipe id that supplies `compareWith` without re-sending
            // `values` must still forward the comparator — it is synced independently of `values`.
            fixture.componentInstance.pipeTemplates = [
                {
                    name: 'Select',
                    id: PIPE_TEMPLATE_ID,
                    type: KbqPipeTypes.Select,
                    compareWith: customCompare,
                    cleanable: false,
                    removable: false,
                    disabled: false
                }
            ];
            fixture.detectChanges();

            expect(getPipeComponent().select().compareWith).toBe(customCompare);
        });

        it('should match the selected value in the panel using the custom comparator', fakeAsync(() => {
            setTemplateWithComparator();
            // The selected value is a distinct object equal to SELECT_VALUES[1] only by `value`; the
            // options carry no `id`. `getCorrespondOption` uses `.find`, so exactly one option is
            // selected either way — under the default id comparator every id-less option compares equal
            // and the first ('Option 1') wins, so asserting the selected option is 'Option 2' is what
            // proves the custom `value` comparator is applied.
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: { name: 'Option 2', value: 'value2' } })
            ]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            const selectedText = Array.from(document.querySelectorAll('.kbq-option.kbq-selected')).map((el) =>
                el.textContent?.trim()
            );

            expect(selectedText).toEqual(['Option 2']);
        }));
    });

    describe('panelMaxHeight forwarding', () => {
        const setTemplateWithPanelMaxHeight = (panelMaxHeight: number) => {
            fixture.componentInstance.pipeTemplates = [
                {
                    name: 'Select',
                    id: PIPE_TEMPLATE_ID,
                    type: KbqPipeTypes.Select,
                    values: SELECT_VALUES,
                    panelMaxHeight,
                    cleanable: false,
                    removable: false,
                    disabled: false
                }
            ];
        };

        // JSDOM computes no layout, so the inline custom property on the panel is the observable
        // contract here; that it resolves to an actual height is covered by the select suite and by
        // the filter-bar Playwright specs, which read the computed `max-height` of `__content`.
        const readPanelMaxHeightToken = (): string => {
            const panel = document.querySelector<HTMLElement>('.kbq-pipe-select__panel')!;

            return panel.style.getPropertyValue('--kbq-select-panel-size-max-height');
        };

        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should forward panelMaxHeight from the pipe template to the panel', fakeAsync(() => {
            setTemplateWithPanelMaxHeight(300);
            fixture.componentInstance.activeFilter = createFilter([createPipe({ name: 'test', value: null })]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            expect(readPanelMaxHeightToken()).toBe('300px');
        }));

        it('should leave the token unset when the template omits panelMaxHeight', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ name: 'test', value: null })]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            // No inline custom property at all, so the select-family default of 256px applies.
            expect(readPanelMaxHeightToken()).toBe('');
        }));

        it('should clear a previously set panelMaxHeight when a later template update omits it', fakeAsync(() => {
            setTemplateWithPanelMaxHeight(300);
            fixture.componentInstance.activeFilter = createFilter([createPipe({ name: 'test', value: null })]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            expect(readPanelMaxHeightToken()).toBe('300px');

            // A follow-up pipeTemplates update for the same pipe id that omits panelMaxHeight must fall
            // back to the filter-bar default, not keep the stale height.
            fixture.componentInstance.pipeTemplates = [
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
            fixture.detectChanges();

            expect(readPanelMaxHeightToken()).toBe('');
        }));

        it('should forward panelMaxHeight from a later template update even when it omits values', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ name: 'test', value: null })]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            expect(readPanelMaxHeightToken()).toBe('');

            // `panelMaxHeight` is synced independently of `values`, same as `compareWith`.
            fixture.componentInstance.pipeTemplates = [
                {
                    name: 'Select',
                    id: PIPE_TEMPLATE_ID,
                    type: KbqPipeTypes.Select,
                    panelMaxHeight: 240,
                    cleanable: false,
                    removable: false,
                    disabled: false
                }
            ];
            fixture.detectChanges();

            expect(readPanelMaxHeightToken()).toBe('240px');
        }));
    });

    describe('caption', () => {
        const CAPTIONED: KbqSelectValue = { name: 'Threat type', value: 'threat', caption: 'category.generic' };

        const setTemplate = (values: KbqSelectValue[], valueTemplate?: TemplateRef<any>) => {
            fixture.componentInstance.pipeTemplates = [
                {
                    name: 'Select',
                    id: PIPE_TEMPLATE_ID,
                    type: KbqPipeTypes.Select,
                    values,
                    valueTemplate,
                    cleanable: false,
                    removable: false,
                    disabled: false
                }
            ];
        };

        const getOptions = () => Array.from(document.querySelectorAll<HTMLElement>('.kbq-option'));

        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should render the caption as a second line', fakeAsync(() => {
            setTemplate([CAPTIONED]);
            fixture.componentInstance.activeFilter = createFilter([createPipe({ name: 'test', value: null })]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            expect(getOptions()[0].querySelector('.kbq-option-caption')!.textContent!.trim()).toBe('category.generic');
        }));

        it('should leave an option without a caption as a bare text node', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ name: 'test', value: null })]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            const option = getOptions()[0];

            // A nested block box would cost the name its ellipsis: `text-overflow` does not reach it.
            expect(option.querySelector('.kbq-option-caption')).toBeNull();
            expect(option.querySelector('.kbq-option-text')!.children.length).toBe(0);
            expect(option.textContent!.trim()).toBe(SELECT_VALUES[0].name);
        }));

        it('should keep the caption out of the trigger', fakeAsync(() => {
            setTemplate([CAPTIONED]);
            fixture.componentInstance.activeFilter = createFilter([createPipe({ name: 'test', value: CAPTIONED })]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            // Without `viewValue` the option would derive it from `textContent` and glue the two lines.
            expect(getPipeComponent().select().triggerValue).toBe('Threat type');
            expect(fixture.nativeElement.querySelector('.kbq-pipe__value').textContent.trim()).toBe('Threat type');
        }));

        it('should let a valueTemplate own the option and its view value', fakeAsync(() => {
            setTemplate([CAPTIONED], fixture.componentInstance.optionTemplate());
            fixture.componentInstance.activeFilter = createFilter([createPipe({ name: 'test', value: CAPTIONED })]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            expect(getOptions()[0].querySelector('.kbq-option-caption')).toBeNull();
            expect(getPipeComponent().select().triggerValue).toBe('custom Threat type');
        }));
    });

    describe('multilineOptions', () => {
        const setTemplate = (multilineOptions?: boolean) => {
            fixture.componentInstance.pipeTemplates = [
                {
                    name: 'Select',
                    id: PIPE_TEMPLATE_ID,
                    type: KbqPipeTypes.Select,
                    values: SELECT_VALUES,
                    multilineOptions,
                    cleanable: false,
                    removable: false,
                    disabled: false
                }
            ];
        };

        // JSDOM applies no stylesheets: the class is the contract here, its effect is a Playwright spec.
        const panelHasMultilineClass = (): boolean =>
            document
                .querySelector<HTMLElement>('.kbq-pipe-select__panel')!
                .classList.contains('kbq-pipe-select__panel_multiline');

        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should add the modifier to the panel when the template sets it', fakeAsync(() => {
            setTemplate(true);
            fixture.componentInstance.activeFilter = createFilter([createPipe({ name: 'test', value: null })]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            expect(panelHasMultilineClass()).toBe(true);
        }));

        it('should leave the panel unmodified when the template omits it', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ name: 'test', value: null })]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            expect(panelHasMultilineClass()).toBe(false);
        }));

        it('should clear the modifier when a later template update omits it', fakeAsync(() => {
            setTemplate(true);
            fixture.componentInstance.activeFilter = createFilter([createPipe({ name: 'test', value: null })]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            expect(panelHasMultilineClass()).toBe(true);

            // Synced independently of `values`, same as `compareWith` and `panelMaxHeight`.
            setTemplate();
            fixture.detectChanges();

            expect(panelHasMultilineClass()).toBe(false);
        }));

        it('should apply a later template update that omits values', fakeAsync(() => {
            fixture.componentInstance.activeFilter = createFilter([createPipe({ name: 'test', value: null })]);
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            expect(panelHasMultilineClass()).toBe(false);

            // Synced in the `if (template)` block, so a template with no option list still switches it.
            fixture.componentInstance.pipeTemplates = [
                {
                    name: 'Select',
                    id: PIPE_TEMPLATE_ID,
                    type: KbqPipeTypes.Select,
                    multilineOptions: true,
                    cleanable: false,
                    removable: false,
                    disabled: false
                }
            ];
            fixture.detectChanges();

            expect(panelHasMultilineClass()).toBe(true);
        }));
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
            const openSpy = jest.spyOn(component.select(), 'open');

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
            let lastFiltered: any[] = [];

            component.filteredOptions.subscribe((filtered) => {
                lastFiltered = filtered;
            });
            flush();

            expect(lastFiltered.length).toBe(SELECT_VALUES.length);
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

        describe('by caption', () => {
            const CAPTIONED: KbqSelectValue[] = [
                { name: 'Threat type', value: 'threat', caption: 'category.generic' },
                { name: 'Action', value: 'action', caption: 'audit' },
                // No caption at all: the predicate must skip it rather than throw.
                { name: 'Plain', value: 'plain' }
            ];

            const search = (query: string): KbqSelectValue[] => {
                fixture.componentInstance.pipeTemplates = [
                    {
                        name: 'Select',
                        id: PIPE_TEMPLATE_ID,
                        type: KbqPipeTypes.Select,
                        values: CAPTIONED,
                        cleanable: false,
                        removable: false,
                        disabled: false
                    }
                ];
                fixture.componentInstance.activeFilter = createFilter([
                    createPipe({ name: 'test', value: null, search: true })
                ]);
                fixture.detectChanges();

                const component = getPipeComponent();
                let lastFiltered: KbqSelectValue[] = [];

                component.filteredOptions.subscribe((filtered) => {
                    lastFiltered = filtered;
                });

                component.searchControl.setValue(query);
                flush();

                return lastFiltered;
            };

            it('should match an option whose caption contains the query', fakeAsync(() => {
                expect(search('category').map((item) => item.name)).toEqual(['Threat type']);
            }));

            it('should match the caption case-insensitively', fakeAsync(() => {
                expect(search('AUDIT').map((item) => item.name)).toEqual(['Action']);
            }));
        });
    });

    describe('late pipeTemplates (first-open options)', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should render options on first open when templates are supplied after the pipe is created', fakeAsync(() => {
            // Reproduce a parent assigning `pipeTemplates` in ngAfterViewInit: the Select pipe is
            // created before its template (carrying the option `values`) arrives.
            fixture.componentInstance.pipeTemplates = [];
            fixture.componentInstance.activeFilter = createFilter([
                createPipe({ name: 'test', value: null, search: true })
            ]);
            fixture.detectChanges();

            // Templates arrive after the pipe is already initialized.
            fixture.componentInstance.pipeTemplates = [
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
            fixture.detectChanges();

            openSelect();
            flush();
            fixture.detectChanges();

            const options = document.querySelectorAll('.kbq-option');

            expect(options.length).toBe(SELECT_VALUES.length);
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
            getPipeComponent().select().openedChange.emit(false);

            expect(spy).toHaveBeenCalledWith(expect.objectContaining({ name: 'test' }));
        });
    });
});

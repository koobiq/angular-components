import {
    ChangeDetectorRef,
    Component,
    computed,
    DebugElement,
    effect,
    inject,
    signal,
    Signal,
    viewChild
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import {
    KBQ_LOCALE_SERVICE,
    KBQ_STATE_STORE,
    KbqFilterBarLocaleConfiguration,
    KbqStateStore
} from '@koobiq/components/core';
import {
    KBQ_FILTER_BAR_DEFAULT_LOCALE_CONFIGURATION,
    KBQ_FILTER_BAR_LOCALE_CONFIGURATION,
    KbqDateTimeValue,
    KbqFilter,
    KbqFilterBar,
    kbqFilterBarLocaleConfigurationProvider,
    KbqFilterBarModule,
    kbqFilterBarToSerializableFilter,
    KbqPipe,
    KbqPipeTemplate,
    KbqPipeTypes,
    KbqSelectValue
} from '@koobiq/components/filter-bar';
import { KbqSearchExpandable, KbqSearchExpandableModule } from '@koobiq/components/search-expandable';
import { DateTime } from 'luxon';
import { BehaviorSubject } from 'rxjs';

const PIPE_TEMPLATE_ID = 'TestText';

const createPipe = (overrides: Partial<KbqPipe> = {}): KbqPipe => ({
    name: 'test',
    id: PIPE_TEMPLATE_ID,
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
            name: 'Text',
            id: PIPE_TEMPLATE_ID,
            type: KbqPipeTypes.Text,
            cleanable: false,
            removable: false,
            disabled: false
        }
    ];
}

/** Calls `command` from an effect of its own view, at most ten times. */
@Component({ template: '' })
class EffectHost {
    command: () => void = () => {};
    runs = 0;

    constructor() {
        effect(() => {
            if (this.runs >= 10) return;

            this.runs++;
            this.command();
        });
    }
}

describe('KbqFilterBar', () => {
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
            imports: [KbqFilterBarModule, TestComponent]
        }).compileComponents();
    });

    const getFilterBar = (): KbqFilterBar => {
        return filterBarDebugElement.componentInstance;
    };

    describe('host element', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
            fixture.detectChanges();
        });

        it('should have kbq-filter-bar class', () => {
            expect(filterBarDebugElement.nativeElement.classList).toContain('kbq-filter-bar');
        });
    });

    describe('filter (model)', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
            fixture.detectChanges();
        });

        it('should recompute a derived computed (isChanged) when the underlying flag changes', () => {
            const filterBar = getFilterBar();
            let computeCount = 0;
            // Probe a REAL derived computed so this guards the derived-state reactivity itself, not merely
            // that `filter` is signal-backed (reverting isChanged to a plain getter would fail this).
            const probe = computed(() => {
                computeCount++;

                return filterBar.isChanged();
            });

            filterBar.filter.set(createFilter([], { changed: false }));
            probe();
            const before = computeCount;

            filterBar.filter.set(createFilter([], { changed: true }));
            probe();

            expect(computeCount).toBe(before + 1);
            expect(filterBar.isChanged()).toBe(true);
        });

        it('should NOT recompute a derived computed (isChanged) when its value is unchanged', () => {
            const filterBar = getFilterBar();
            let computeCount = 0;
            const probe = computed(() => {
                computeCount++;

                return filterBar.isChanged();
            });

            filterBar.filter.set(createFilter([], { changed: true }));
            probe();
            const before = computeCount;

            // A new filter reference whose `changed` is still true — `isChanged()` yields the same value,
            // so the `computed()` chain dedupes and a consumer reading only `isChanged()` is not re-run.
            filterBar.filter.set(createFilter([], { changed: true }));
            probe();

            expect(computeCount).toBe(before);
        });

        it('should emit filterChange via internalFilterChanges subscription', () => {
            const filterBar = getFilterBar();
            const spy = vi.fn();

            filterBar.filter.subscribe(spy);
            spy.mockClear();

            const filter = createFilter([]);

            filterBar.internalFilterChanges.next(filter);

            expect(spy).toHaveBeenCalledWith(filter);
        });
    });

    describe('pipeTemplates (input effect)', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
            fixture.detectChanges();
        });

        it('should emit internalTemplatesChanges when pipeTemplates are set', () => {
            const filterBar = getFilterBar();
            const spy = vi.fn();

            filterBar.internalTemplatesChanges.subscribe(spy);
            spy.mockClear();

            const templates: KbqPipeTemplate[] = [
                {
                    name: 'NewTemplate',
                    id: 'new',
                    type: KbqPipeTypes.Text,
                    cleanable: false,
                    removable: false,
                    disabled: false
                }
            ];

            // `pipeTemplates` is a signal `input()` — drive it via the host binding. The push into
            // `internalTemplatesChanges` now flows from an effect(), so run change detection to trigger it.
            fixture.componentInstance.pipeTemplates = templates;
            fixture.detectChanges();

            expect(spy).toHaveBeenCalledWith(templates);
        });
    });

    describe('computed properties', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
            fixture.detectChanges();
        });

        it('should return isSaved true when filter.saved is true', () => {
            const filterBar = getFilterBar();

            filterBar.filter.set(createFilter([], { saved: true }));

            expect(filterBar.isSaved()).toBe(true);
        });

        it('should return isSaved false when filter.saved is false', () => {
            const filterBar = getFilterBar();

            filterBar.filter.set(createFilter([], { saved: false }));

            expect(filterBar.isSaved()).toBe(false);
        });

        it('should return isChanged true when filter.changed is true', () => {
            const filterBar = getFilterBar();

            filterBar.filter.set(createFilter([], { changed: true }));

            expect(filterBar.isChanged()).toBe(true);
        });

        it('should return isChanged false when filter.changed is false', () => {
            const filterBar = getFilterBar();

            filterBar.filter.set(createFilter([], { changed: false }));

            expect(filterBar.isChanged()).toBe(false);
        });

        it('should return isSavedAndChanged true only when both saved and changed', () => {
            const filterBar = getFilterBar();

            filterBar.filter.set(createFilter([], { saved: true, changed: true }));

            expect(filterBar.isSavedAndChanged()).toBe(true);
        });

        it('should return isSavedAndChanged false when only saved', () => {
            const filterBar = getFilterBar();

            filterBar.filter.set(createFilter([], { saved: true, changed: false }));

            expect(filterBar.isSavedAndChanged()).toBe(false);
        });

        it('should return isSavedAndChanged false when only changed', () => {
            const filterBar = getFilterBar();

            filterBar.filter.set(createFilter([], { saved: false, changed: true }));

            expect(filterBar.isSavedAndChanged()).toBe(false);
        });

        it('should return isReadOnly true when filter.readonly is true', () => {
            const filterBar = getFilterBar();

            filterBar.filter.set(createFilter([], { readonly: true }));

            expect(filterBar.isReadOnly()).toBe(true);
        });

        it('should return isDisabled true when filter.disabled is true', () => {
            const filterBar = getFilterBar();

            filterBar.filter.set(createFilter([], { disabled: true }));

            expect(filterBar.isDisabled()).toBe(true);
        });

        it('should return false for all when filter is null', () => {
            const filterBar = getFilterBar();

            filterBar.filter.set(null);

            expect(filterBar.isSaved()).toBe(false);
            expect(filterBar.isChanged()).toBe(false);
            expect(filterBar.isSavedAndChanged()).toBe(false);
            expect(filterBar.isReadOnly()).toBe(false);
            expect(filterBar.isDisabled()).toBe(false);
        });
    });

    describe('removePipe', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
            fixture.detectChanges();
        });

        it('should remove pipe from filter.pipes array', () => {
            const pipe1 = createPipe({ name: 'pipe1' });
            const pipe2 = createPipe({ name: 'pipe2' });
            const filterBar = getFilterBar();

            filterBar.filter.set(createFilter([pipe1, pipe2]));

            filterBar.removePipe(pipe1);

            expect(filterBar.filter()!.pipes).toEqual([pipe2]);
        });

        it('should leave filter.pipes untouched when the pipe is not part of the filter', () => {
            const pipe1 = createPipe({ name: 'pipe1' });
            const pipe2 = createPipe({ name: 'pipe2' });
            const absentPipe = createPipe({ name: 'absent' });
            const filterBar = getFilterBar();

            filterBar.filter.set(createFilter([pipe1, pipe2]));

            filterBar.removePipe(absentPipe);

            expect(filterBar.filter()!.pipes).toEqual([pipe1, pipe2]);
        });

        it('should not emit onRemovePipe when the pipe is not part of the filter', () => {
            const pipe = createPipe({ name: 'pipe1' });
            const absentPipe = createPipe({ name: 'absent' });
            const filterBar = getFilterBar();

            filterBar.filter.set(createFilter([pipe]));

            const spy = vi.fn();

            filterBar.onRemovePipe.subscribe(spy);
            spy.mockClear();

            filterBar.removePipe(absentPipe);

            expect(spy).not.toHaveBeenCalled();
        });

        it('should emit onRemovePipe event', () => {
            const pipe = createPipe({ name: 'removable' });
            const filterBar = getFilterBar();

            filterBar.filter.set(createFilter([pipe]));

            const spy = vi.fn();

            filterBar.onRemovePipe.subscribe(spy);
            spy.mockClear();

            filterBar.removePipe(pipe);

            expect(spy).toHaveBeenCalledWith(pipe);
        });

        it('should replace the filter with a new reference on remove', () => {
            const pipe = createPipe({ name: 'removable' });
            const filterBar = getFilterBar();

            filterBar.filter.set(createFilter([pipe]));

            const before = filterBar.filter();

            filterBar.removePipe(pipe);

            // Immutable update: a new `filter` reference (not an in-place splice) drives signal reactivity.
            expect(filterBar.filter()).not.toBe(before);
            expect(filterBar.filter()!.pipes).toEqual([]);
        });

        it('should emit filterChange exactly once, carrying changed=true, on remove', () => {
            const pipe = createPipe({ name: 'removable' });
            const filterBar = getFilterBar();

            // Saved, unmodified filter: a stale first emission (changed=false) would be observable here.
            filterBar.filter.set(createFilter([pipe], { saved: true, changed: false }));

            const spy = vi.fn();

            filterBar.filter.subscribe(spy);
            spy.mockClear();

            filterBar.removePipe(pipe);

            // A single `set` folds in `changed: true`; onRemovePipe no longer triggers a second emission.
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith(expect.objectContaining({ changed: true, pipes: [] }));
        });
    });

    describe('saveFilterState / restoreFilterState', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
            fixture.detectChanges();
        });

        it('should deep clone current filter on save', () => {
            const filterBar = getFilterBar();
            const filter = createFilter([createPipe({ name: 'test', value: 'hello' })]);

            filterBar.filter.set(filter);

            filterBar.saveFilterState();

            filter.pipes[0].value = 'modified';

            filterBar.restoreFilterState();

            expect(filterBar.filter()!.pipes[0].value).toBe('hello');
        });

        it('should restore to previously saved state', () => {
            const filterBar = getFilterBar();

            filterBar.filter.set(createFilter([createPipe({ name: 'original', value: 'v1' })]));

            filterBar.saveFilterState();

            filterBar.filter.set(createFilter([createPipe({ name: 'changed', value: 'v2' })]));

            filterBar.restoreFilterState();

            expect(filterBar.filter()!.pipes[0].name).toBe('original');
            expect(filterBar.filter()!.pipes[0].value).toBe('v1');
        });

        it('should save explicit filter arg', () => {
            const filterBar = getFilterBar();
            const explicitFilter = createFilter([createPipe({ name: 'explicit', value: 'x' })]);

            filterBar.saveFilterState(explicitFilter);

            filterBar.restoreFilterState();

            expect(filterBar.filter()!.pipes[0].name).toBe('explicit');
        });

        it('should restore explicit filter arg', () => {
            const filterBar = getFilterBar();

            filterBar.filter.set(createFilter([createPipe({ name: 'current' })]));

            const restoreFilter = createFilter([createPipe({ name: 'restored' })]);

            filterBar.restoreFilterState(restoreFilter);

            expect(filterBar.filter()!.pipes[0].name).toBe('restored');
        });

        it('should not wipe the current filter when there is nothing to restore', () => {
            const filterBar = getFilterBar();

            filterBar.filter.set(createFilter([createPipe({ name: 'current', value: 'v' })]));

            // Nothing saved and no explicit arg → must be a no-op, not a silent `structuredClone(null)` wipe.
            filterBar.restoreFilterState();

            expect(filterBar.filter()).not.toBeNull();
            expect(filterBar.filter()!.pipes[0].name).toBe('current');
        });
    });

    describe('resetFilterChangedState', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
            fixture.detectChanges();
        });

        it('should set filter.changed to false', () => {
            const filterBar = getFilterBar();

            filterBar.filter.set(createFilter([], { changed: true }));

            filterBar.resetFilterChangedState();

            expect(filterBar.filter()!.changed).toBe(false);
        });
    });

    describe('called from an effect', () => {
        // Renders no pipes, which need the providers of a full application.
        @Component({
            imports: [KbqFilterBarModule],
            template: '<kbq-filter-bar />'
        })
        class BareFilterBar {
            readonly filterBar = viewChild.required(KbqFilterBar);
        }

        let filterBar: KbqFilterBar;

        let effectHost: ComponentFixture<EffectHost>;

        const callFromEffect = (command: () => void): void => {
            effectHost = TestBed.createComponent(EffectHost);
            effectHost.componentInstance.command = command;
            effectHost.detectChanges();
        };

        beforeEach(() => {
            const bareFixture = TestBed.createComponent(BareFilterBar);

            bareFixture.detectChanges();
            filterBar = bareFixture.componentInstance.filterBar();
        });

        it('should not make an effect that removes a pipe run again when the filter changes', () => {
            const pipe = createPipe({ name: 'removable' });

            filterBar.filter.set(createFilter([pipe]));

            callFromEffect(() => filterBar.removePipe(pipe));
            filterBar.filter.set(createFilter([pipe]));
            effectHost.detectChanges();

            expect(filterBar.filter()!.pipes).toEqual([pipe]);
            expect(effectHost.componentInstance.runs).toBe(1);
        });

        it('should not make an effect that saves the state run again when the filter changes', () => {
            filterBar.filter.set(createFilter([], { name: 'original' }));
            callFromEffect(() => filterBar.saveFilterState());
            filterBar.filter.set(createFilter([], { name: 'changed' }));
            effectHost.detectChanges();
            filterBar.restoreFilterState();

            expect(filterBar.filter()!.name).toBe('original');
            expect(effectHost.componentInstance.runs).toBe(1);
        });

        it('should not make an effect that resets the changed state run again when the filter changes', () => {
            filterBar.filter.set(createFilter([], { changed: true }));
            callFromEffect(() => filterBar.resetFilterChangedState());
            filterBar.filter.set(createFilter([], { changed: true }));
            effectHost.detectChanges();

            expect(filterBar.isChanged()).toBe(true);
            expect(effectHost.componentInstance.runs).toBe(1);
        });
    });

    describe('constructor subscriptions', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
            fixture.detectChanges();
        });

        it('should mark filter as changed when onChangePipe emits', () => {
            const filterBar = getFilterBar();

            filterBar.filter.set(createFilter([], { changed: false }));

            filterBar.onChangePipe.emit(createPipe());

            expect(filterBar.filter()!.changed).toBe(true);
        });

        it('should mark filter as changed when onRemovePipe emits', () => {
            const filterBar = getFilterBar();
            const pipe = createPipe();

            filterBar.filter.set(createFilter([pipe], { changed: false }));

            filterBar.removePipe(pipe);

            expect(filterBar.filter()!.changed).toBe(true);
        });

        it('should emit filterChange when onChangePipe emits', () => {
            const filterBar = getFilterBar();

            filterBar.filter.set(createFilter([]));

            const spy = vi.fn();

            filterBar.filter.subscribe(spy);
            spy.mockClear();

            filterBar.onChangePipe.emit(createPipe());

            expect(spy).toHaveBeenCalled();
        });

        it('should use default configuration when no localeService', () => {
            const filterBar = getFilterBar();

            expect(filterBar.localeConfiguration()).toEqual(KBQ_FILTER_BAR_DEFAULT_LOCALE_CONFIGURATION);
        });
    });

    describe('selectedAllEqualsSelectedNothing', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
            fixture.detectChanges();
        });

        it('should reflect the bound value', () => {
            const filterBar = getFilterBar();

            expect(filterBar.selectedAllEqualsSelectedNothing()).toBe(true);
        });
    });

    describe('selectedAllEqualsSelectedNothing default', () => {
        @Component({
            selector: 'test-app-default-select-all',
            imports: [KbqFilterBarModule],
            template: `
                <kbq-filter-bar />
            `
        })
        class TestComponentDefaultSelectAll {}

        it('should default to true when the input is left unbound', () => {
            // Render <kbq-filter-bar> WITHOUT binding the input, so this exercises the declared `input(true)`
            // default rather than a round-tripped binding.
            TestBed.configureTestingModule({
                imports: [KbqFilterBarModule, TestComponentDefaultSelectAll]
            });

            const defaultFixture = TestBed.createComponent(TestComponentDefaultSelectAll);

            defaultFixture.detectChanges();

            const filterBar: KbqFilterBar = defaultFixture.debugElement.query(
                By.directive(KbqFilterBar)
            ).componentInstance;

            expect(filterBar.selectedAllEqualsSelectedNothing()).toBe(true);
        });
    });

    // Replacement for the projection coverage that used to live in filter-search.spec.ts
    // (removed in v20.0.0 when KbqFilterBarSearch was deleted in favor of kbq-search-expandable).
    describe('search-expandable projection slot', () => {
        @Component({
            selector: 'test-app-with-search',
            imports: [KbqFilterBarModule, KbqSearchExpandableModule, ReactiveFormsModule],
            template: `
                <kbq-filter-bar>
                    <kbq-search-expandable [formControl]="searchControl" />
                </kbq-filter-bar>
            `
        })
        class TestComponentWithSearch {
            readonly searchControl = new FormControl('');
        }

        it('should project <kbq-search-expandable> into the kbq-filter-bar__right slot', () => {
            TestBed.configureTestingModule({
                imports: [
                    KbqFilterBarModule,
                    KbqSearchExpandableModule,
                    ReactiveFormsModule,
                    TestComponentWithSearch
                ]
            });

            const localFixture = TestBed.createComponent(TestComponentWithSearch);

            localFixture.detectChanges();

            const filterBarHost = localFixture.debugElement.query(By.directive(KbqFilterBar))
                .nativeElement as HTMLElement;
            const rightSlot = filterBarHost.querySelector('.kbq-filter-bar__right');

            expect(rightSlot).not.toBeNull();
            // The projected component should be rendered inside the right slot.
            expect(rightSlot!.querySelector('kbq-search-expandable')).not.toBeNull();
            expect(localFixture.debugElement.query(By.directive(KbqSearchExpandable))).not.toBeNull();
        });
    });

    // Precedence implemented by `kbqInjectLocaleConfiguration`:
    //   configuration = overrides (kbqFilterBarLocaleConfigurationProvider) merged on top of
    //   localeService.getParams('filterBar'), falling back to KBQ_FILTER_BAR_LOCALE_CONFIGURATION when no locale
    //   service is provided. The configuration signal re-emits on every KBQ_LOCALE_SERVICE.changes emission.
    describe('locale-change / configuration-override precedence', () => {
        // Minimal stand-in for KbqLocaleService: a BehaviorSubject-backed `changes` stream plus
        // `getParams`, returning a distinct configuration per locale id so swaps are observable.
        class MockLocaleService {
            readonly changes = new BehaviorSubject<string>('locale-a');

            private readonly params: Record<string, KbqFilterBarLocaleConfiguration> = {
                'locale-a': {
                    ...KBQ_FILTER_BAR_DEFAULT_LOCALE_CONFIGURATION,
                    filters: { ...KBQ_FILTER_BAR_DEFAULT_LOCALE_CONFIGURATION.filters, defaultName: 'Locale A name' },
                    reset: { ...KBQ_FILTER_BAR_DEFAULT_LOCALE_CONFIGURATION.reset, buttonName: 'Locale A reset' }
                },
                'locale-b': {
                    ...KBQ_FILTER_BAR_DEFAULT_LOCALE_CONFIGURATION,
                    filters: { ...KBQ_FILTER_BAR_DEFAULT_LOCALE_CONFIGURATION.filters, defaultName: 'Locale B name' },
                    reset: { ...KBQ_FILTER_BAR_DEFAULT_LOCALE_CONFIGURATION.reset, buttonName: 'Locale B reset' }
                }
            };

            getParams(): KbqFilterBarLocaleConfiguration {
                return this.params[this.changes.value];
            }

            // Mirror of KbqLocaleService.setLocale: publish the new id through `changes`.
            setLocale(id: string): void {
                this.changes.next(id);
            }
        }

        const externalConfiguration: KbqFilterBarLocaleConfiguration = {
            ...KBQ_FILTER_BAR_DEFAULT_LOCALE_CONFIGURATION,
            filters: { ...KBQ_FILTER_BAR_DEFAULT_LOCALE_CONFIGURATION.filters, defaultName: 'External name' }
        };

        it('should update configuration when the locale service emits a change', () => {
            const localeService = new MockLocaleService();

            TestBed.configureTestingModule({
                imports: [KbqFilterBarModule, TestComponent],
                providers: [{ provide: KBQ_LOCALE_SERVICE, useValue: localeService }]
            });

            const localFixture = TestBed.createComponent(TestComponent);

            localFixture.detectChanges();

            const filterBar = localFixture.debugElement.query(By.directive(KbqFilterBar))
                .componentInstance as KbqFilterBar;

            // Initial locale ('locale-a') is applied via the BehaviorSubject's replayed value.
            expect(filterBar.localeConfiguration().filters.defaultName).toBe('Locale A name');

            // Switching the locale must re-emit the configuration signal.
            localeService.setLocale('locale-b');

            expect(filterBar.localeConfiguration().filters.defaultName).toBe('Locale B name');
        });

        it('should let a registered override win over the locale service', () => {
            const localeService = new MockLocaleService();

            TestBed.configureTestingModule({
                imports: [KbqFilterBarModule, TestComponent],
                providers: [
                    { provide: KBQ_LOCALE_SERVICE, useValue: localeService },
                    kbqFilterBarLocaleConfigurationProvider({ filters: { defaultName: 'External name' } })
                ]
            });

            const localFixture = TestBed.createComponent(TestComponent);

            localFixture.detectChanges();

            const filterBar = localFixture.debugElement.query(By.directive(KbqFilterBar))
                .componentInstance as KbqFilterBar;

            // The override is merged on top of the locale-provided params.
            expect(filterBar.localeConfiguration().filters.defaultName).toBe('External name');
            expect(filterBar.localeConfiguration().reset.buttonName).toBe('Locale A reset');

            // A locale change must NOT drop the override, and must still move everything it left alone.
            localeService.setLocale('locale-b');

            expect(filterBar.localeConfiguration().filters.defaultName).toBe('External name');
            expect(filterBar.localeConfiguration().reset.buttonName).toBe('Locale B reset');
        });

        it('should take the strings from KBQ_FILTER_BAR_LOCALE_CONFIGURATION when no locale service is provided', () => {
            TestBed.configureTestingModule({
                imports: [KbqFilterBarModule, TestComponent],
                providers: [{ provide: KBQ_FILTER_BAR_LOCALE_CONFIGURATION, useValue: externalConfiguration }]
            });

            const localFixture = TestBed.createComponent(TestComponent);

            localFixture.detectChanges();

            const filterBar = localFixture.debugElement.query(By.directive(KbqFilterBar))
                .componentInstance as KbqFilterBar;

            expect(filterBar.localeConfiguration().filters.defaultName).toBe('External name');
        });

        it('should re-render a projected sub-component when the locale service emits a change', async () => {
            const localeService = new MockLocaleService();

            TestBed.configureTestingModule({
                imports: [KbqFilterBarModule, TestComponent],
                providers: [{ provide: KBQ_LOCALE_SERVICE, useValue: localeService }]
            });

            const localFixture = TestBed.createComponent(TestComponent);

            // `autoDetectChanges` only — a manual `detectChanges()` after `setLocale` below would force a
            // check regardless of whether the `localeConfiguration` signal marks the projected OnPush view dirty,
            // which is the very thing under test.
            localFixture.autoDetectChanges();

            await localFixture.whenStable();

            const filterResetElement: HTMLElement = localFixture.nativeElement.querySelector('.kbq-filter-reset');

            expect(filterResetElement.textContent?.trim()).toBe('Locale A reset');

            localeService.setLocale('locale-b');

            await localFixture.whenStable();

            expect(filterResetElement.textContent?.trim()).toBe('Locale B reset');
        });
    });
});

const STATUS_PIPE_ID = 'Status';
const PERIOD_PIPE_ID = 'Period';

const createSelectTemplate = (
    optionName: Signal<string>,
    overrides: Partial<KbqPipeTemplate> = {}
): KbqPipeTemplate => ({
    name: 'Status',
    id: STATUS_PIPE_ID,
    type: KbqPipeTypes.Select,
    values: [{ id: 'active', name: optionName, value: 'active' }],
    cleanable: false,
    removable: false,
    disabled: false,
    ...overrides
});

const createDateTemplate = (presetName: Signal<string>): KbqPipeTemplate => ({
    name: 'Period',
    id: PERIOD_PIPE_ID,
    type: KbqPipeTypes.Date,
    values: [{ id: 'last7', name: presetName, start: { days: -7 }, end: null }],
    cleanable: false,
    removable: false,
    disabled: false
});

describe('kbqFilterBarToSerializableFilter', () => {
    it('should resolve every signal-backed name without modifying the filter', () => {
        const pipeName = signal('Статус');
        const optionName = signal('Активен');
        const presetName = signal('Последние 7 дней');
        const filter = createFilter(
            [
                createPipe({
                    id: STATUS_PIPE_ID,
                    name: pipeName,
                    type: KbqPipeTypes.Select,
                    value: { id: 'active', name: optionName, value: 'active' }
                }),
                createPipe({
                    id: PERIOD_PIPE_ID,
                    name: 'Period',
                    type: KbqPipeTypes.Date,
                    value: { id: 'last7', name: presetName, start: { days: -7 }, end: null }
                })
            ],
            { name: 'SavedFilter' }
        );

        const serializable = kbqFilterBarToSerializableFilter(filter);

        expect(serializable).not.toBe(filter);
        expect(serializable.name).toBe('SavedFilter');
        expect(serializable.pipes[0].name).toBe('Статус');
        expect((serializable.pipes[0].value as KbqSelectValue).name).toBe('Активен');
        expect((serializable.pipes[1].value as KbqDateTimeValue).name).toBe('Последние 7 дней');
        // The business payload around the label is kept.
        expect((serializable.pipes[1].value as KbqDateTimeValue).start).toEqual({ days: -7 });

        // The live filter is untouched, signal references included.
        expect(filter.pipes[0].name).toBe(pipeName);
        expect((filter.pipes[0].value as KbqSelectValue).name).toBe(optionName);
        expect((filter.pipes[1].value as KbqDateTimeValue).name).toBe(presetName);
    });

    it('should resolve only name signals and keep a business-payload signal by reference', () => {
        const optionName = signal('Активен');
        const businessSignal = signal(42);
        const filter = createFilter([
            createPipe({
                id: STATUS_PIPE_ID,
                name: optionName,
                type: KbqPipeTypes.Select,
                value: { id: 'active', name: optionName, value: businessSignal }
            }),
            createPipe({ id: 'Counter', name: 'Counter', type: 'custom', value: businessSignal })
        ]);

        const serializable = kbqFilterBarToSerializableFilter(filter);

        // Labels are resolved to their current strings...
        expect(serializable.pipes[0].name).toBe('Активен');
        expect((serializable.pipes[0].value as KbqSelectValue).name).toBe('Активен');

        // ...while a business payload keeps the signal itself instead of being turned into data.
        expect((serializable.pipes[0].value as { value: unknown }).value).toBe(businessSignal);
        expect(serializable.pipes[1].value).toBe(businessSignal);

        // The live filter is untouched as well.
        expect((filter.pipes[0].value as { value: unknown }).value).toBe(businessSignal);
        expect(filter.pipes[1].value).toBe(businessSignal);
    });

    it('should leave non-plain configuration such as compareWith and a date limit by reference', () => {
        const compareWith = (o1: KbqSelectValue | null, o2: KbqSelectValue | null): boolean =>
            !!o1 && !!o2 && o1.id === o2.id;
        const minDateTime = DateTime.fromISO('2025-01-01T00:00:00.000Z');
        const pipe: KbqPipe & { compareWith: typeof compareWith; minDateTime: DateTime } = {
            ...createPipe({
                id: PERIOD_PIPE_ID,
                name: 'Period',
                type: KbqPipeTypes.Date,
                value: { id: 'last7', name: 'Last 7 days', start: { days: -7 }, end: null }
            }),
            compareWith,
            minDateTime
        };

        const serializable = kbqFilterBarToSerializableFilter(createFilter([pipe]));

        // Configuration is not name data: a `compareWith` copied from a template and a date-adapter bound
        // must survive as the same value, not become a clone, a plain object or a `DataCloneError`.
        expect((serializable.pipes[0] as unknown as { compareWith: unknown }).compareWith).toBe(compareWith);
        expect((serializable.pipes[0] as unknown as { minDateTime: unknown }).minDateTime).toBe(minDateTime);
        expect(() => JSON.stringify(serializable)).not.toThrow();
        // Such a copy is not cloneable, exactly like the source: only JSON persistence is supported for a
        // filter carrying a function payload.
        expect(() => structuredClone(serializable)).toThrow();
    });

    it('should survive JSON.stringify and structuredClone', () => {
        const filter = createFilter([
            createPipe({
                id: STATUS_PIPE_ID,
                name: signal('Статус'),
                type: KbqPipeTypes.Select,
                value: { id: 'active', name: signal('Активен'), value: 'active' }
            })
        ]);

        const serializable = kbqFilterBarToSerializableFilter(filter);

        // A live signal-bearing filter cannot be cloned — that is what the helper exists for.
        expect(() => structuredClone(filter)).toThrow();
        expect(() => JSON.stringify(serializable)).not.toThrow();

        const cloned = structuredClone(serializable);

        expect(cloned.pipes[0].name).toBe('Статус');
        expect(cloned.pipes[0].value).toEqual({ id: 'active', name: 'Активен', value: 'active' });
    });

    it('should terminate on a cyclic business value and keep the cycle in the copy', () => {
        const businessValue: Record<string, unknown> = { id: 'node' };

        businessValue['parent'] = businessValue;

        const serializable = kbqFilterBarToSerializableFilter(
            createFilter([createPipe({ id: 'Custom', name: 'Custom', type: 'custom', value: businessValue })])
        );
        const copy = serializable.pipes[0].value as Record<string, unknown>;

        expect(copy).not.toBe(businessValue);
        expect(copy['id']).toBe('node');
        expect(copy['parent']).toBe(copy);

        // The copy is plain data around the cycle, so it clones in turn and keeps the shape.
        const roundTripped = structuredClone(serializable);

        expect((roundTripped.pipes[0].value as Record<string, unknown>)['parent']).toBe(roundTripped.pipes[0].value);
    });

    it('should copy a payload shared by two pipes once and keep it shared', () => {
        const shared = { id: 'shared' };
        const filter = createFilter([
            createPipe({ id: 'First', name: 'First', type: 'custom', value: shared }),
            createPipe({ id: 'Second', name: 'Second', type: 'custom', value: shared })
        ]);

        const serializable = kbqFilterBarToSerializableFilter(filter);
        const first = serializable.pipes[0].value as Record<string, unknown>;

        expect(first).not.toBe(shared);
        expect(first).toEqual({ id: 'shared' });
        expect(serializable.pipes[1].value).toBe(first);
    });
});

describe(`${KbqFilterBarModule.name} snapshots with signal-backed values`, () => {
    @Component({
        imports: [KbqFilterBarModule],
        template: `
            <kbq-filter-bar [pipeTemplates]="pipeTemplates" [(filter)]="activeFilter" />
        `
    })
    class SnapshotFilterBar {
        activeFilter: KbqFilter | null = null;
        pipeTemplates: KbqPipeTemplate[] = [];
    }

    let fixture: ComponentFixture<SnapshotFilterBar>;
    let filterBar: KbqFilterBar;

    const createSelectPipe = (value: unknown): KbqPipe =>
        createPipe({ id: STATUS_PIPE_ID, name: 'Status', type: KbqPipeTypes.Select, value });

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [KbqFilterBarModule, SnapshotFilterBar] });

        fixture = TestBed.createComponent(SnapshotFilterBar);
        fixture.detectChanges();

        filterBar = fixture.debugElement.query(By.directive(KbqFilterBar)).componentInstance;
    });

    it('should keep signal-backed names by reference across save and restore', () => {
        const pipeName = signal('Статус');
        const optionName = signal('Активен');

        filterBar.filter.set(
            createFilter([
                createPipe({
                    id: STATUS_PIPE_ID,
                    name: pipeName,
                    type: KbqPipeTypes.Select,
                    value: { id: 'active', name: optionName, value: 'active' }
                })
            ])
        );

        filterBar.saveFilterState();
        filterBar.filter.set(null);
        filterBar.restoreFilterState();

        expect(filterBar.filter()!.pipes[0].name).toBe(pipeName);
        expect((filterBar.filter()!.pipes[0].value as KbqSelectValue).name).toBe(optionName);
    });

    it('should keep a signal-backed date preset name by reference', () => {
        const presetName = signal('Последние 7 дней');

        filterBar.filter.set(
            createFilter([
                createPipe({
                    id: PERIOD_PIPE_ID,
                    name: 'Period',
                    type: KbqPipeTypes.Date,
                    value: { id: 'last7', name: presetName, start: { days: -7 }, end: null }
                })
            ])
        );

        filterBar.saveFilterState();
        filterBar.filter.set(null);
        filterBar.restoreFilterState();

        expect((filterBar.filter()!.pipes[0].value as KbqDateTimeValue).name).toBe(presetName);
    });

    it('should keep a business signal by reference across save and restore', () => {
        const businessSignal = signal(42);

        filterBar.filter.set(
            createFilter([
                createSelectPipe({ id: 'active', name: 'Active', value: businessSignal }),
                createPipe({ id: 'Counter', name: 'Counter', type: 'custom', value: businessSignal })
            ])
        );

        expect(() => filterBar.saveFilterState()).not.toThrow();

        filterBar.filter.set(null);

        expect(() => filterBar.restoreFilterState()).not.toThrow();

        const selectValue = filterBar.filter()!.pipes[0].value as KbqSelectValue;

        // A business signal is not a label: it is shared as the signal itself, so its value stays readable.
        expect(selectValue.value).toBe(businessSignal);
        expect((selectValue.value as () => number)()).toBe(42);
        expect(filterBar.filter()!.pipes[1].value).toBe(businessSignal);
    });

    it('should keep the snapshot restriction for a non-cloneable custom payload', () => {
        // Clone mode is deliberately unchanged for non-signal functions: a function payload still throws
        // `DataCloneError`, so a snapshot never silently turns a custom value into data.
        expect(() => filterBar.saveFilterState(createFilter([createPipe({ value: () => 'custom' })]))).toThrow();
    });

    it('should keep a non-plain payload shared by two pipes shared across save and restore', () => {
        const shared = new Date(2026, 10, 11);

        filterBar.filter.set(
            createFilter([
                createPipe({ id: 'First', name: 'First', type: 'custom', value: shared }),
                createPipe({ id: 'Second', name: 'Second', type: 'custom', value: shared })
            ])
        );

        filterBar.saveFilterState();
        filterBar.filter.set(null);
        filterBar.restoreFilterState();

        const [first, second] = filterBar.filter()!.pipes;

        // One `structuredClone` per source, as a whole-filter clone did before the walk was introduced.
        expect(first.value).not.toBe(shared);
        expect(first.value).toEqual(shared);
        expect(second.value).toBe(first.value);
    });

    it('should rehydrate a restored select value from the current template by id', () => {
        const optionName = signal('Активен');

        fixture.componentInstance.pipeTemplates = [createSelectTemplate(optionName)];
        fixture.detectChanges();

        filterBar.restoreFilterState(
            createFilter([createSelectPipe({ id: 'active', name: 'Active', value: 'active' })])
        );

        const value = filterBar.filter()!.pipes[0].value as KbqSelectValue;

        expect(value.name).toBe(optionName);
        expect(value.value).toBe('active');
        expect(filterBar.filter()!.changed).toBe(false);
    });

    it('should pass a custom date range through on restore', () => {
        const presetName = signal('Последние 7 дней');
        const range = { start: '2025-01-01T00:00:00.000Z', end: '2025-01-02T00:00:00.000Z' };

        fixture.componentInstance.pipeTemplates = [createDateTemplate(presetName)];
        fixture.detectChanges();

        filterBar.restoreFilterState(
            createFilter([createPipe({ id: PERIOD_PIPE_ID, name: 'Period', type: KbqPipeTypes.Date, value: range })])
        );

        expect(filterBar.filter()!.pipes[0].value).toEqual(range);
    });

    it('should not emit or mark the filter changed when a restored label changes', () => {
        const optionName = signal('Активен');

        fixture.componentInstance.pipeTemplates = [createSelectTemplate(optionName)];
        fixture.detectChanges();

        filterBar.restoreFilterState(
            createFilter([createSelectPipe({ id: 'active', name: 'Активен', value: 'active' })])
        );

        const filterChange = vi.fn();
        const pipeChange = vi.fn();

        filterBar.filter.subscribe(filterChange);
        filterBar.onChangePipe.subscribe(pipeChange);

        optionName.set('Active');
        fixture.detectChanges();

        expect(filterChange).not.toHaveBeenCalled();
        expect(pipeChange).not.toHaveBeenCalled();
        expect(filterBar.filter()!.changed).toBe(false);
        // The restored value is the current template option itself, so it follows the label.
        expect((filterBar.filter()!.pipes[0].value as KbqSelectValue).name).toBe(optionName);
    });
});

/** In-memory `KbqStateStore` used to make state-saving tests deterministic. */
class InMemoryStateStore implements KbqStateStore {
    readonly store = new Map<string, unknown>();

    keys(): string[] {
        return [...this.store.keys()];
    }

    getState(key: string): unknown {
        return this.store.has(key) ? JSON.parse(JSON.stringify(this.store.get(key))) : null;
    }

    setState(key: string, state: unknown): void {
        this.store.set(key, JSON.parse(JSON.stringify(state)));
    }

    removeState(key: string): void {
        this.store.delete(key);
    }
}

const ADDED_PIPE_ID = 'TestAdded';

@Component({
    imports: [KbqFilterBarModule],
    template: `
        <kbq-filter-bar
            [pipeTemplates]="pipeTemplates"
            [stateSavingKey]="stateSavingKey"
            [useStateSaving]="useStateSaving"
            [(filter)]="activeFilter"
        >
            <kbq-filters [filters]="filters" />
        </kbq-filter-bar>
    `
})
class StateSavingFilterBar {
    useStateSaving = true;
    /** An empty key leaves the bar on the key derived from its position in the document. */
    stateSavingKey = 'filter-bar-key';

    activeFilter: KbqFilter | null = null;
    filters: KbqFilter[] = [createFilter([createPipe()], { name: 'Saved', saved: true })];

    pipeTemplates: KbqPipeTemplate[] = [
        {
            name: 'Text',
            id: PIPE_TEMPLATE_ID,
            type: KbqPipeTypes.Text,
            cleanable: false,
            removable: false,
            disabled: false
        },
        {
            name: 'Added',
            id: ADDED_PIPE_ID,
            type: KbqPipeTypes.Text,
            cleanable: false,
            removable: true,
            disabled: false
        }
    ];
}

/** A bar that projects no `<kbq-filters>`: nothing can look a saved filter up by name. */
@Component({
    imports: [KbqFilterBarModule],
    template: `
        <kbq-filter-bar [pipeTemplates]="pipeTemplates" [stateSavingKey]="stateSavingKey" [(filter)]="activeFilter" />
    `
})
class FilterBarWithoutFilterList {
    stateSavingKey = 'filter-bar-key';

    activeFilter: KbqFilter | null = createFilter([createPipe()], { name: 'Owned' });

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

/** A persisting bar with a saved-filter list, whose templates and filters each test supplies. */
@Component({
    imports: [KbqFilterBarModule],
    template: `
        <kbq-filter-bar [pipeTemplates]="pipeTemplates" [stateSavingKey]="stateSavingKey" [(filter)]="activeFilter">
            <kbq-filters [filters]="filters" />
        </kbq-filter-bar>
    `
})
class SignalValueFilterBar {
    stateSavingKey = 'filter-bar-key';

    activeFilter: KbqFilter | null = null;
    filters: KbqFilter[] = [];
    pipeTemplates: KbqPipeTemplate[] = [];
}

describe(`${KbqFilterBarModule.name} state saving`, () => {
    const key = 'filter-bar-key';

    let store: InMemoryStateStore;

    /** Creates the bar against `store`. Seed the store first to model what the previous visit left. */
    const create = (): ComponentFixture<StateSavingFilterBar> => {
        TestBed.overrideProvider(KBQ_STATE_STORE, { useValue: store });

        const created = TestBed.createComponent(StateSavingFilterBar);

        created.detectChanges();

        return created;
    };

    const createWith = (setup: (component: SignalValueFilterBar) => void): ComponentFixture<SignalValueFilterBar> => {
        TestBed.overrideProvider(KBQ_STATE_STORE, { useValue: store });

        const created = TestBed.createComponent(SignalValueFilterBar);

        setup(created.componentInstance);
        created.detectChanges();

        return created;
    };

    const getBar = (created: ComponentFixture<unknown>): KbqFilterBar =>
        created.debugElement.query(By.directive(KbqFilterBar)).componentInstance;

    const createSelectPipe = (value: unknown, type: KbqPipeTypes = KbqPipeTypes.Select): KbqPipe =>
        createPipe({ id: STATUS_PIPE_ID, name: 'Status', type, value });

    const createDatePipe = (value: unknown): KbqPipe =>
        createPipe({ id: PERIOD_PIPE_ID, name: 'Period', type: KbqPipeTypes.Date, value });

    beforeEach(() => {
        store = new InMemoryStateStore();

        TestBed.configureTestingModule({
            imports: [KbqFilterBarModule, StateSavingFilterBar, FilterBarWithoutFilterList, SignalValueFilterBar]
        }).compileComponents();
    });

    it('restores the filter the previous visit left, by name', () => {
        store.setState(key, { name: 'Saved', changed: false, pipes: [{ id: PIPE_TEMPLATE_ID, value: 'kept' }] });

        const fixture = create();

        expect(getBar(fixture).filter()?.name).toBe('Saved');
    });

    it('restores the values the pipes were left with', () => {
        store.setState(key, { name: 'Saved', changed: false, pipes: [{ id: PIPE_TEMPLATE_ID, value: 'kept' }] });

        const fixture = create();

        expect(getBar(fixture).filter()?.pipes).toEqual([
            expect.objectContaining({ id: PIPE_TEMPLATE_ID, value: 'kept' })
        ]);
    });

    it('restores a pipe the user had added, rebuilt from the templates', () => {
        store.setState(key, {
            name: 'Saved',
            changed: true,
            pipes: [
                { id: PIPE_TEMPLATE_ID, value: null },
                { id: ADDED_PIPE_ID, value: 'added' }
            ]
        });

        const fixture = create();

        expect(getBar(fixture).filter()?.pipes).toEqual([
            expect.objectContaining({ id: PIPE_TEMPLATE_ID }),
            expect.objectContaining({ id: ADDED_PIPE_ID, name: 'Added', removable: true, value: 'added' })
        ]);
    });

    it('leaves out a pipe the user had removed', () => {
        store.setState(key, { name: 'Saved', changed: true, pipes: [] });

        const fixture = create();

        expect(getBar(fixture).filter()?.pipes).toEqual([]);
    });

    it('restores whether the filter carried unsaved changes', () => {
        store.setState(key, { name: 'Saved', changed: true, pipes: [{ id: PIPE_TEMPLATE_ID, value: null }] });

        const fixture = create();

        expect(getBar(fixture).isChanged()).toBe(true);
    });

    it('does not reach the filter the application owns', () => {
        store.setState(key, { name: 'Saved', changed: false, pipes: [{ id: PIPE_TEMPLATE_ID, value: 'kept' }] });

        const fixture = create();

        expect(fixture.componentInstance.filters[0].pipes[0].value).toBeNull();
    });

    it('restores nothing when the saved filter is gone from the list', () => {
        store.setState(key, { name: 'Deleted', changed: false, pipes: [{ id: PIPE_TEMPLATE_ID, value: 'kept' }] });

        const fixture = create();

        expect(getBar(fixture).filter()).toBeNull();
    });

    it('waits for a list of filters that arrives after initialization', () => {
        store.setState(key, { name: 'Late', changed: false, pipes: [{ id: PIPE_TEMPLATE_ID, value: 'kept' }] });

        TestBed.overrideProvider(KBQ_STATE_STORE, { useValue: store });

        const fixture = TestBed.createComponent(StateSavingFilterBar);

        fixture.componentInstance.filters = [];
        fixture.detectChanges();

        expect(getBar(fixture).filter()).toBeNull();

        fixture.componentInstance.filters = [createFilter([createPipe()], { name: 'Late', saved: true })];
        fixture.detectChanges();

        expect(getBar(fixture).filter()?.name).toBe('Late');
    });

    it('abandons that wait once something else changes the filter', () => {
        store.setState(key, { name: 'Late', changed: false, pipes: [{ id: PIPE_TEMPLATE_ID, value: 'kept' }] });

        TestBed.overrideProvider(KBQ_STATE_STORE, { useValue: store });

        const fixture = TestBed.createComponent(StateSavingFilterBar);

        fixture.componentInstance.filters = [];
        fixture.detectChanges();

        // The application drove the filter while the payload was still waiting for its list.
        fixture.componentInstance.activeFilter = createFilter([], { name: 'Application' });
        fixture.detectChanges();

        fixture.componentInstance.filters = [createFilter([createPipe()], { name: 'Late', saved: true })];
        fixture.detectChanges();

        expect(getBar(fixture).filter()?.name).toBe('Application');
    });

    it('restores a named filter when no list of filters is projected', () => {
        // Without a `<kbq-filters>` there is no list the name could ever appear in, so waiting for one
        // would never end and the bar would write on every change while reading nothing back.
        store.setState(key, { name: 'Owned', changed: true, pipes: [{ id: PIPE_TEMPLATE_ID, value: 'kept' }] });

        TestBed.overrideProvider(KBQ_STATE_STORE, { useValue: store });

        const fixture = TestBed.createComponent(FilterBarWithoutFilterList);

        fixture.detectChanges();

        const filter = getBar(fixture).filter();

        expect(filter?.name).toBe('Owned');
        expect(filter?.changed).toBe(true);
        expect(filter?.pipes.map(({ value }) => value)).toEqual(['kept']);
    });

    it('restores nothing when no list is projected and the application holds another filter', () => {
        store.setState(key, { name: 'Another', changed: true, pipes: [{ id: PIPE_TEMPLATE_ID, value: 'kept' }] });

        TestBed.overrideProvider(KBQ_STATE_STORE, { useValue: store });

        const fixture = TestBed.createComponent(FilterBarWithoutFilterList);

        fixture.detectChanges();

        const filter = getBar(fixture).filter();

        expect(filter?.name).toBe('Owned');
        expect(filter?.pipes.map(({ value }) => value)).toEqual([null]);
    });

    it('persists a pipe value change', () => {
        const fixture = create();
        const filterBar = getBar(fixture);
        const pipe = createPipe({ value: 'typed' });

        filterBar.filter.set(createFilter([pipe], { name: 'Saved' }));
        filterBar.onChangePipe.emit(pipe);
        fixture.detectChanges();

        expect(store.getState(key)).toEqual({
            name: 'Saved',
            changed: true,
            pipes: [{ id: PIPE_TEMPLATE_ID, value: 'typed' }]
        });
    });

    it('persists a pipe removal', () => {
        const fixture = create();
        const filterBar = getBar(fixture);
        const pipe = createPipe();

        filterBar.filter.set(createFilter([pipe], { name: 'Saved' }));
        filterBar.removePipe(pipe);
        fixture.detectChanges();

        expect(store.getState(key)).toEqual({ name: 'Saved', changed: true, pipes: [] });
    });

    it('persists the filter the user selects', () => {
        const fixture = create();

        getBar(fixture).filters()!.selectFilter(fixture.componentInstance.filters[0]);
        fixture.detectChanges();

        expect(store.getState(key)).toEqual({
            name: 'Saved',
            changed: false,
            pipes: [{ id: PIPE_TEMPLATE_ID, value: null }]
        });
    });

    it('lets a later change from the application win, and persists that', () => {
        store.setState(key, { name: 'Saved', changed: false, pipes: [{ id: PIPE_TEMPLATE_ID, value: 'kept' }] });

        const fixture = create();

        expect(getBar(fixture).filter()?.name).toBe('Saved');

        fixture.componentInstance.activeFilter = createFilter([], { name: 'Application' });
        fixture.detectChanges();

        expect(getBar(fixture).filter()?.name).toBe('Application');
        expect(store.getState(key)).toEqual({ name: 'Application', changed: false, pipes: [] });
    });

    it('persists nothing while useStateSaving is unset', () => {
        store.setState(key, { name: 'Saved', changed: false, pipes: [{ id: PIPE_TEMPLATE_ID, value: 'kept' }] });

        TestBed.overrideProvider(KBQ_STATE_STORE, { useValue: store });

        const fixture = TestBed.createComponent(StateSavingFilterBar);

        fixture.componentInstance.useStateSaving = false;
        fixture.detectChanges();

        const filterBar = getBar(fixture);

        expect(filterBar.filter()).toBeNull();

        filterBar.filter.set(createFilter([], { name: 'Untracked' }));
        fixture.detectChanges();

        expect(store.getState(key)).toEqual({
            name: 'Saved',
            changed: false,
            pipes: [{ id: PIPE_TEMPLATE_ID, value: 'kept' }]
        });
    });

    it.each([
        ['nonsense'],
        [42],
        [[]],
        [{ name: 'Saved' }],
        [{ name: 'Saved', changed: false, pipes: [{ value: 1 }] }]
    ])('ignores an unusable payload: %p', (payload) => {
        store.setState(key, payload);

        const fixture = create();

        expect(getBar(fixture).filter()).toBeNull();
    });

    it('clears the persisted state on request and keeps persisting afterwards', () => {
        const fixture = create();
        const filterBar = getBar(fixture);

        filterBar.filter.set(createFilter([], { name: 'First' }));
        fixture.detectChanges();

        expect(filterBar.hasSavedState).toBe(true);

        filterBar.clearSavedState();

        expect(store.getState(key)).toBeNull();
        expect(filterBar.hasSavedState).toBe(false);

        filterBar.filter.set(createFilter([], { name: 'Second' }));
        fixture.detectChanges();

        expect(store.getState(key)).toEqual({ name: 'Second', changed: false, pipes: [] });
    });

    it('removes the entry when nothing is selected any more', () => {
        const fixture = create();
        const filterBar = getBar(fixture);

        filterBar.filter.set(createFilter([], { name: 'Selected' }));
        fixture.detectChanges();

        expect(store.getState(key)).not.toBeNull();

        filterBar.filter.set(null);
        fixture.detectChanges();

        expect(store.getState(key)).toBeNull();
    });

    it('persists built-in signal-backed values as current strings', () => {
        const optionName = signal('Активен');
        const filter = createFilter([createSelectPipe({ id: 'active', name: optionName, value: 'active' })], {
            name: 'Saved',
            saved: true
        });

        const fixture = createWith((component) => {
            component.pipeTemplates = [createSelectTemplate(optionName)];
            component.filters = [filter];
        });

        getBar(fixture).filters()!.selectFilter(filter);
        fixture.detectChanges();

        expect(store.getState(key)).toEqual({
            name: 'Saved',
            changed: false,
            pipes: [{ id: STATUS_PIPE_ID, value: { id: 'active', name: 'Активен', value: 'active' } }]
        });

        optionName.set('Active');
        fixture.detectChanges();

        // A translation is not a filter change, so nothing new is written.
        expect(store.getState(key)).toEqual({
            name: 'Saved',
            changed: false,
            pipes: [{ id: STATUS_PIPE_ID, value: { id: 'active', name: 'Активен', value: 'active' } }]
        });
    });

    it('rehydrates a restored select value from the current template by id', () => {
        const optionName = signal('Активен');

        store.setState(key, {
            name: 'Saved',
            changed: false,
            pipes: [{ id: STATUS_PIPE_ID, value: { id: 'active', name: 'Активен', value: 'active' } }]
        });

        optionName.set('Active');

        const fixture = createWith((component) => {
            component.pipeTemplates = [createSelectTemplate(optionName)];
            component.filters = [createFilter([createSelectPipe(null)], { name: 'Saved', saved: true })];
        });

        const value = getBar(fixture).filter()!.pipes[0].value as KbqSelectValue;

        expect(value.name).toBe(optionName);
        expect(value.value).toBe('active');
        expect(getBar(fixture).isChanged()).toBe(false);
    });

    it('rehydrates a multiselect value entry by entry and keeps unmatched entries', () => {
        const optionName = signal('Active');

        store.setState(key, {
            name: 'Saved',
            changed: false,
            pipes: [
                {
                    id: STATUS_PIPE_ID,
                    value: [
                        { id: 'active', name: 'Активен', value: 'active' },
                        { id: 'archived', name: 'Archived', value: 'archived' }
                    ]
                }
            ]
        });

        const fixture = createWith((component) => {
            component.pipeTemplates = [createSelectTemplate(optionName, { type: KbqPipeTypes.MultiSelect })];
            component.filters = [
                createFilter([createSelectPipe(null, KbqPipeTypes.MultiSelect)], { name: 'Saved', saved: true })
            ];
        });

        const value = getBar(fixture).filter()!.pipes[0].value as KbqSelectValue[];

        expect(value[0].name).toBe(optionName);
        expect(value[1]).toEqual({ id: 'archived', name: 'Archived', value: 'archived' });
    });

    it('rehydrates a restored date preset from the current template by id', () => {
        const presetName = signal('Последние 7 дней');

        store.setState(key, {
            name: 'Saved',
            changed: false,
            pipes: [{ id: PERIOD_PIPE_ID, value: { id: 'last7', name: 'Last 7 days', start: { days: -7 }, end: null } }]
        });

        const fixture = createWith((component) => {
            component.pipeTemplates = [createDateTemplate(presetName)];
            component.filters = [createFilter([createDatePipe(null)], { name: 'Saved', saved: true })];
        });

        expect((getBar(fixture).filter()!.pipes[0].value as KbqDateTimeValue).name).toBe(presetName);
    });

    it('keeps a restored custom date range', () => {
        const presetName = signal('Последние 7 дней');
        const range = { start: '2025-01-01T00:00:00.000Z', end: '2025-01-02T00:00:00.000Z' };

        store.setState(key, { name: 'Saved', changed: false, pipes: [{ id: PERIOD_PIPE_ID, value: range }] });

        const fixture = createWith((component) => {
            component.pipeTemplates = [createDateTemplate(presetName)];
            component.filters = [createFilter([createDatePipe(null)], { name: 'Saved', saved: true })];
        });

        expect(getBar(fixture).filter()!.pipes[0].value).toEqual(range);
    });

    it('keeps a persisted business value the templates have no option for', () => {
        store.setState(key, {
            name: 'Saved',
            changed: false,
            pipes: [{ id: STATUS_PIPE_ID, value: { id: 'archived', name: 'Archived', value: 'archived' } }]
        });

        const fixture = createWith((component) => {
            component.pipeTemplates = [createSelectTemplate(signal('Active'))];
            component.filters = [createFilter([createSelectPipe(null)], { name: 'Saved', saved: true })];
        });

        expect(getBar(fixture).filter()!.pipes[0].value).toEqual({
            id: 'archived',
            name: 'Archived',
            value: 'archived'
        });
    });

    it('rehydrates a pipe rebuilt when its templates arrive after initialization', () => {
        const optionName = signal('Active');

        store.setState(key, {
            name: 'Saved',
            changed: false,
            pipes: [{ id: STATUS_PIPE_ID, value: { id: 'active', name: 'Активен', value: 'active' } }]
        });

        const fixture = createWith((component) => {
            component.filters = [createFilter([], { name: 'Saved', saved: true })];
        });

        // Nothing can be rebuilt while the templates are missing: the payload stays pending.
        expect(getBar(fixture).filter()).toBeNull();

        fixture.componentInstance.pipeTemplates = [createSelectTemplate(optionName)];
        fixture.detectChanges();

        const filter = getBar(fixture).filter()!;

        expect(filter.pipes).toEqual([expect.objectContaining({ id: STATUS_PIPE_ID, type: KbqPipeTypes.Select })]);
        expect((filter.pipes[0].value as KbqSelectValue).name).toBe(optionName);
    });

    it('does not emit or mark the filter changed when a persisted label is re-resolved', () => {
        const optionName = signal('Active');

        store.setState(key, {
            name: 'Saved',
            changed: false,
            pipes: [{ id: STATUS_PIPE_ID, value: { id: 'active', name: 'Активен', value: 'active' } }]
        });

        const fixture = createWith((component) => {
            component.pipeTemplates = [createSelectTemplate(optionName)];
            component.filters = [createFilter([createSelectPipe(null)], { name: 'Saved', saved: true })];
        });

        const filterBar = getBar(fixture);
        const filterChange = vi.fn();
        const pipeChange = vi.fn();

        filterBar.filter.subscribe(filterChange);
        filterBar.onChangePipe.subscribe(pipeChange);

        optionName.set('Activo');
        fixture.detectChanges();

        expect(filterChange).not.toHaveBeenCalled();
        expect(pipeChange).not.toHaveBeenCalled();
        expect(filterBar.filter()!.changed).toBe(false);

        // The restored value is the current template option, so its label follows the translation while the
        // filter itself stays unchanged.
        expect((filterBar.filter()!.pipes[0].value as KbqSelectValue).name).toBe(optionName);
    });

    it('persists a select value with a non-cloneable business payload without throwing', () => {
        const payload = () => 'business';
        const filter = createFilter([createSelectPipe({ id: 'active', name: 'Active', value: payload })], {
            name: 'Saved'
        });

        const fixture = createWith((component) => {
            component.filters = [filter];
        });

        getBar(fixture).filter.set(filter);
        fixture.detectChanges();

        // JSON cannot store a function and drops it, exactly as it did before Task 5; the bar must not throw
        // from its persisting effect just because the business payload is not cloneable.
        expect(store.getState(key)).toEqual({
            name: 'Saved',
            changed: false,
            pipes: [{ id: STATUS_PIPE_ID, value: { id: 'active', name: 'Active' } }]
        });
    });
});

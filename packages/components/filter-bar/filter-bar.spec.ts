import { ChangeDetectorRef, Component, computed, DebugElement, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    KBQ_LOCALE_SERVICE,
    KBQ_STATE_STORE,
    KbqFilterBarLocaleConfiguration,
    KbqStateStore
} from '@koobiq/components/core';
import {
    KBQ_FILTER_BAR_DEFAULT_LOCALE_CONFIGURATION,
    KBQ_FILTER_BAR_LOCALE_CONFIGURATION,
    KbqFilter,
    KbqFilterBar,
    kbqFilterBarLocaleConfigurationProvider,
    KbqFilterBarModule,
    KbqPipe,
    KbqPipeTemplate,
    KbqPipeTypes
} from '@koobiq/components/filter-bar';
import { KbqSearchExpandable, KbqSearchExpandableModule } from '@koobiq/components/search-expandable';
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
            imports: [NoopAnimationsModule, KbqFilterBarModule, TestComponent]
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
            const spy = jest.fn();

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
            const spy = jest.fn();

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

            const spy = jest.fn();

            filterBar.onRemovePipe.subscribe(spy);
            spy.mockClear();

            filterBar.removePipe(absentPipe);

            expect(spy).not.toHaveBeenCalled();
        });

        it('should emit onRemovePipe event', () => {
            const pipe = createPipe({ name: 'removable' });
            const filterBar = getFilterBar();

            filterBar.filter.set(createFilter([pipe]));

            const spy = jest.fn();

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

            const spy = jest.fn();

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

            const spy = jest.fn();

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
                imports: [NoopAnimationsModule, KbqFilterBarModule, TestComponentDefaultSelectAll]
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
                    NoopAnimationsModule,
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
                imports: [NoopAnimationsModule, KbqFilterBarModule, TestComponent],
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
                imports: [NoopAnimationsModule, KbqFilterBarModule, TestComponent],
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
                imports: [NoopAnimationsModule, KbqFilterBarModule, TestComponent],
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
                imports: [NoopAnimationsModule, KbqFilterBarModule, TestComponent],
                providers: [{ provide: KBQ_LOCALE_SERVICE, useValue: localeService }]
            });

            const localFixture = TestBed.createComponent(TestComponent);

            // `autoDetectChanges` only — a manual `detectChanges()` after `setLocale` below would force a
            // check regardless of whether `configuration`'s signal marks the projected OnPush view dirty,
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

    const getBar = (created: ComponentFixture<unknown>): KbqFilterBar =>
        created.debugElement.query(By.directive(KbqFilterBar)).componentInstance;

    beforeEach(() => {
        store = new InMemoryStateStore();

        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, KbqFilterBarModule, StateSavingFilterBar, FilterBarWithoutFilterList]
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
});

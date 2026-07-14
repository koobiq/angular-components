import { ChangeDetectorRef, Component, computed, DebugElement, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KBQ_LOCALE_SERVICE } from '@koobiq/components/core';
import {
    KBQ_FILTER_BAR_CONFIGURATION,
    KBQ_FILTER_BAR_DEFAULT_CONFIGURATION,
    KbqFilter,
    KbqFilterBar,
    KbqFilterBarConfiguration,
    KbqFilterBarModule,
    KbqPipe,
    KbqPipeTemplate,
    KbqPipeTypes
} from '@koobiq/components/filter-bar';
import { KbqSearchExpandableModule } from '@koobiq/components/search-expandable';
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

            expect(filterBar.configuration).toEqual(KBQ_FILTER_BAR_DEFAULT_CONFIGURATION);
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
    // Placement is CSS-driven off `searchPlacement`: the search stays projected into the single
    // `.kbq-filter-bar__search` slot in both modes; only the host modifier class changes.
    describe('search-expandable placement', () => {
        @Component({
            selector: 'test-app-with-search',
            imports: [KbqFilterBarModule, KbqSearchExpandableModule, ReactiveFormsModule],
            template: `
                <kbq-filter-bar [searchPlacement]="placement">
                    <kbq-search-expandable [formControl]="searchControl" />
                </kbq-filter-bar>
            `
        })
        class TestComponentWithSearch {
            placement: 'start' | 'end' = 'end';
            readonly searchControl = new FormControl('');
        }

        const render = (placement?: 'start' | 'end') => {
            TestBed.configureTestingModule({
                imports: [
                    NoopAnimationsModule,
                    KbqFilterBarModule,
                    KbqSearchExpandableModule,
                    ReactiveFormsModule,
                    TestComponentWithSearch
                ]
            });

            const fixture = TestBed.createComponent(TestComponentWithSearch);

            if (placement) {
                fixture.componentInstance.placement = placement;
            }

            fixture.detectChanges();

            return fixture.debugElement.query(By.directive(KbqFilterBar));
        };

        it('should project <kbq-search-expandable> once into the dedicated __search slot', () => {
            const host = render().nativeElement as HTMLElement;

            expect(host.querySelectorAll('kbq-search-expandable')).toHaveLength(1);
            expect(host.querySelector('.kbq-filter-bar__search kbq-search-expandable')).not.toBeNull();
        });

        it('should apply the "end" modifier class by default', () => {
            const host = render().nativeElement as HTMLElement;

            expect(host.classList.contains('kbq-filter-bar_search-end')).toBe(true);
            expect(host.classList.contains('kbq-filter-bar_search-start')).toBe(false);
        });

        it('should apply the "start" modifier class when searchPlacement="start"', () => {
            const host = render('start').nativeElement as HTMLElement;

            expect(host.classList.contains('kbq-filter-bar_search-start')).toBe(true);
            expect(host.classList.contains('kbq-filter-bar_search-end')).toBe(false);
            // The search is still projected into the same slot — only the host class differs.
            expect(host.querySelector('.kbq-filter-bar__search kbq-search-expandable')).not.toBeNull();
        });
    });

    describe('searchPlacement default', () => {
        @Component({
            selector: 'test-app-default-search-placement',
            imports: [KbqFilterBarModule],
            template: `
                <kbq-filter-bar />
            `
        })
        class TestComponentDefaultSearchPlacement {}

        it('should default to "end" when the input is left unbound', () => {
            // Render <kbq-filter-bar> WITHOUT binding the input, so this exercises the declared
            // `input<'start' | 'end'>('end')` default rather than a round-tripped binding.
            TestBed.configureTestingModule({
                imports: [NoopAnimationsModule, KbqFilterBarModule, TestComponentDefaultSearchPlacement]
            });

            const defaultFixture = TestBed.createComponent(TestComponentDefaultSearchPlacement);

            defaultFixture.detectChanges();

            const filterBar: KbqFilterBar = defaultFixture.debugElement.query(
                By.directive(KbqFilterBar)
            ).componentInstance;

            expect(filterBar.searchPlacement()).toBe('end');
        });
    });

    // Precedence implemented by KbqFilterBar.updateLocaleParams:
    //   configuration = externalConfiguration (KBQ_FILTER_BAR_CONFIGURATION) || localeService.getParams('filterBar')
    // The subscription to KBQ_LOCALE_SERVICE.changes re-runs updateLocaleParams on every locale emission.
    describe('locale-change / externalConfiguration precedence', () => {
        // Minimal stand-in for KbqLocaleService: a BehaviorSubject-backed `changes` stream plus
        // `getParams`, returning a distinct configuration per locale id so swaps are observable.
        class MockLocaleService {
            readonly changes = new BehaviorSubject<string>('locale-a');

            private readonly params: Record<string, KbqFilterBarConfiguration> = {
                'locale-a': {
                    ...KBQ_FILTER_BAR_DEFAULT_CONFIGURATION,
                    filters: { ...KBQ_FILTER_BAR_DEFAULT_CONFIGURATION.filters, defaultName: 'Locale A name' }
                },
                'locale-b': {
                    ...KBQ_FILTER_BAR_DEFAULT_CONFIGURATION,
                    filters: { ...KBQ_FILTER_BAR_DEFAULT_CONFIGURATION.filters, defaultName: 'Locale B name' }
                }
            };

            getParams(): KbqFilterBarConfiguration {
                return this.params[this.changes.value];
            }

            // Mirror of KbqLocaleService.setLocale: publish the new id through `changes`.
            setLocale(id: string): void {
                this.changes.next(id);
            }
        }

        const externalConfiguration: KbqFilterBarConfiguration = {
            ...KBQ_FILTER_BAR_DEFAULT_CONFIGURATION,
            filters: { ...KBQ_FILTER_BAR_DEFAULT_CONFIGURATION.filters, defaultName: 'External name' }
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
            expect(filterBar.configuration.filters.defaultName).toBe('Locale A name');

            // Switching the locale must re-run updateLocaleParams and swap the configuration.
            localeService.setLocale('locale-b');

            expect(filterBar.configuration.filters.defaultName).toBe('Locale B name');
        });

        it('should let externalConfiguration win over the locale service', () => {
            const localeService = new MockLocaleService();

            TestBed.configureTestingModule({
                imports: [NoopAnimationsModule, KbqFilterBarModule, TestComponent],
                providers: [
                    { provide: KBQ_LOCALE_SERVICE, useValue: localeService },
                    { provide: KBQ_FILTER_BAR_CONFIGURATION, useValue: externalConfiguration }
                ]
            });

            const localFixture = TestBed.createComponent(TestComponent);

            localFixture.detectChanges();

            const filterBar = localFixture.debugElement.query(By.directive(KbqFilterBar))
                .componentInstance as KbqFilterBar;

            // externalConfiguration takes precedence over the locale-provided params.
            expect(filterBar.configuration.filters.defaultName).toBe('External name');

            // A locale change must NOT override the external configuration.
            localeService.setLocale('locale-b');

            expect(filterBar.configuration.filters.defaultName).toBe('External name');
        });
    });
});

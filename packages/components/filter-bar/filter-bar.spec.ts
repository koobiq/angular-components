import { ChangeDetectorRef, Component, DebugElement, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    KBQ_FILTER_BAR_DEFAULT_CONFIGURATION,
    KbqFilter,
    KbqFilterBar,
    KbqFilterBarModule,
    KbqPipe,
    KbqPipeTemplate,
    KbqPipeTypes
} from '@koobiq/components/filter-bar';

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

    window.structuredClone = (value) => JSON.parse(JSON.stringify(value));

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, KbqFilterBarModule, TestComponent]
        }).compileComponents();
    });

    const getFilterBar = (): KbqFilterBar => {
        return filterBarDebugElement.componentInstance;
    };

    describe('filter getter/setter', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestComponent);
            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
            fixture.detectChanges();
        });

        it('should emit changes when filter is set', () => {
            const filterBar = getFilterBar();
            const spy = jest.fn();

            filterBar.changes.subscribe(spy);
            spy.mockClear();

            filterBar.filter = createFilter([]);
            expect(spy).toHaveBeenCalled();
        });

        it('should not emit changes when same filter reference is set', () => {
            const filterBar = getFilterBar();
            const filter = createFilter([]);

            filterBar.filter = filter;
            fixture.detectChanges();

            const spy = jest.fn();

            filterBar.changes.subscribe(spy);
            spy.mockClear();

            filterBar.filter = filter;
            expect(spy).not.toHaveBeenCalled();
        });

        it('should emit filterChange via internalFilterChanges subscription', () => {
            const filterBar = getFilterBar();
            const spy = jest.fn();

            filterBar.filterChange.subscribe(spy);
            spy.mockClear();

            const filter = createFilter([]);

            filterBar.internalFilterChanges.next(filter);

            expect(spy).toHaveBeenCalledWith(filter);
        });
    });

    describe('pipeTemplates getter/setter', () => {
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

            filterBar.pipeTemplates = templates;

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

            filterBar.filter = createFilter([], { saved: true });

            expect(filterBar.isSaved).toBe(true);
        });

        it('should return isSaved false when filter.saved is false', () => {
            const filterBar = getFilterBar();

            filterBar.filter = createFilter([], { saved: false });

            expect(filterBar.isSaved).toBe(false);
        });

        it('should return isChanged true when filter.changed is true', () => {
            const filterBar = getFilterBar();

            filterBar.filter = createFilter([], { changed: true });

            expect(filterBar.isChanged).toBe(true);
        });

        it('should return isChanged false when filter.changed is false', () => {
            const filterBar = getFilterBar();

            filterBar.filter = createFilter([], { changed: false });

            expect(filterBar.isChanged).toBe(false);
        });

        it('should return isSavedAndChanged true only when both saved and changed', () => {
            const filterBar = getFilterBar();

            filterBar.filter = createFilter([], { saved: true, changed: true });

            expect(filterBar.isSavedAndChanged).toBe(true);
        });

        it('should return isSavedAndChanged false when only saved', () => {
            const filterBar = getFilterBar();

            filterBar.filter = createFilter([], { saved: true, changed: false });

            expect(filterBar.isSavedAndChanged).toBe(false);
        });

        it('should return isSavedAndChanged false when only changed', () => {
            const filterBar = getFilterBar();

            filterBar.filter = createFilter([], { saved: false, changed: true });

            expect(filterBar.isSavedAndChanged).toBe(false);
        });

        it('should return isReadOnly true when filter.readonly is true', () => {
            const filterBar = getFilterBar();

            filterBar.filter = createFilter([], { readonly: true });

            expect(filterBar.isReadOnly).toBe(true);
        });

        it('should return isDisabled true when filter.disabled is true', () => {
            const filterBar = getFilterBar();

            filterBar.filter = createFilter([], { disabled: true });

            expect(filterBar.isDisabled).toBe(true);
        });

        it('should return false for all when filter is null', () => {
            const filterBar = getFilterBar();

            filterBar.filter = null;

            expect(filterBar.isSaved).toBe(false);
            expect(filterBar.isChanged).toBe(false);
            expect(filterBar.isSavedAndChanged).toBe(false);
            expect(filterBar.isReadOnly).toBe(false);
            expect(filterBar.isDisabled).toBe(false);
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

            filterBar.filter = createFilter([pipe1, pipe2]);

            filterBar.removePipe(pipe1);

            expect(filterBar.filter!.pipes).toEqual([pipe2]);
        });

        it('should emit onRemovePipe event', () => {
            const pipe = createPipe({ name: 'removable' });
            const filterBar = getFilterBar();

            filterBar.filter = createFilter([pipe]);

            const spy = jest.fn();

            filterBar.onRemovePipe.subscribe(spy);
            spy.mockClear();

            filterBar.removePipe(pipe);

            expect(spy).toHaveBeenCalledWith(pipe);
        });

        it('should emit changes', () => {
            const pipe = createPipe({ name: 'removable' });
            const filterBar = getFilterBar();

            filterBar.filter = createFilter([pipe]);

            const spy = jest.fn();

            filterBar.changes.subscribe(spy);
            spy.mockClear();

            filterBar.removePipe(pipe);

            expect(spy).toHaveBeenCalled();
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

            filterBar.filter = filter;

            filterBar.saveFilterState();

            filter.pipes[0].value = 'modified';

            filterBar.restoreFilterState();

            expect(filterBar.filter!.pipes[0].value).toBe('hello');
        });

        it('should restore to previously saved state', () => {
            const filterBar = getFilterBar();

            filterBar.filter = createFilter([createPipe({ name: 'original', value: 'v1' })]);

            filterBar.saveFilterState();

            filterBar.filter = createFilter([createPipe({ name: 'changed', value: 'v2' })]);

            filterBar.restoreFilterState();

            expect(filterBar.filter!.pipes[0].name).toBe('original');
            expect(filterBar.filter!.pipes[0].value).toBe('v1');
        });

        it('should save explicit filter arg', () => {
            const filterBar = getFilterBar();
            const explicitFilter = createFilter([createPipe({ name: 'explicit', value: 'x' })]);

            filterBar.saveFilterState(explicitFilter);

            filterBar.restoreFilterState();

            expect(filterBar.filter!.pipes[0].name).toBe('explicit');
        });

        it('should restore explicit filter arg', () => {
            const filterBar = getFilterBar();

            filterBar.filter = createFilter([createPipe({ name: 'current' })]);

            const restoreFilter = createFilter([createPipe({ name: 'restored' })]);

            filterBar.restoreFilterState(restoreFilter);

            expect(filterBar.filter!.pipes[0].name).toBe('restored');
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

            filterBar.filter = createFilter([], { changed: true });

            filterBar.resetFilterChangedState();

            expect(filterBar.filter!.changed).toBe(false);
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

            filterBar.filter = createFilter([], { changed: false });

            filterBar.onChangePipe.emit(createPipe());

            expect(filterBar.filter!.changed).toBe(true);
        });

        it('should mark filter as changed when onRemovePipe emits', () => {
            const filterBar = getFilterBar();
            const pipe = createPipe();

            filterBar.filter = createFilter([pipe], { changed: false });

            filterBar.removePipe(pipe);

            expect(filterBar.filter!.changed).toBe(true);
        });

        it('should emit filterChange when onChangePipe emits', () => {
            const filterBar = getFilterBar();

            filterBar.filter = createFilter([]);

            const spy = jest.fn();

            filterBar.filterChange.subscribe(spy);
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

        it('should default to true', () => {
            const filterBar = getFilterBar();

            expect(filterBar.selectedAllEqualsSelectedNothing).toBe(true);
        });
    });
});

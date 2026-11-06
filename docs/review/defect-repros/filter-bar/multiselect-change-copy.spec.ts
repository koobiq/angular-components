import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
    KbqBasePipe,
    KbqFilter,
    KbqFilterBar,
    KbqFilterBarModule,
    KbqPipe,
    KbqPipeMultiSelectComponent,
    KbqPipeTemplate,
    KbqPipeTypes
} from '@koobiq/components/filter-bar';

const SELECT_VALUES = [
    { id: 1, name: 'Option 1', value: 'value1' },
    { id: 2, name: 'Option 2', value: 'value2' },
    { id: 3, name: 'Option 3', value: 'value3' }
];

const PIPE_ID = 'TestMultiSelect';

const createPipe = (overrides: Partial<KbqPipe> = {}): KbqPipe => ({
    name: 'test',
    id: PIPE_ID,
    type: KbqPipeTypes.MultiSelect,
    value: [],
    search: false,
    selectAll: true,
    cleanable: false,
    removable: false,
    disabled: false,
    ...overrides
});

@Component({
    selector: 'test-app',
    imports: [KbqFilterBarModule],
    template: `
        <kbq-filter-bar [pipeTemplates]="pipeTemplates" [(filter)]="activeFilter" (onChangePipe)="changes.push($event)">
            @for (pipe of activeFilter?.pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }
        </kbq-filter-bar>
    `
})
class TestApp {
    activeFilter: KbqFilter | null = {
        name: 'TestFilter',
        readonly: false,
        disabled: false,
        changed: false,
        saved: false,
        pipes: [createPipe()]
    };

    changes: KbqPipe[] = [];

    pipeTemplates: KbqPipeTemplate[] = [
        {
            name: 'MultiSelect',
            id: PIPE_ID,
            type: KbqPipeTypes.MultiSelect,
            values: SELECT_VALUES,
            cleanable: false,
            removable: false,
            disabled: false
        }
    ];
}

describe('filter-bar triage: multi-select change event under "all selected = nothing selected"', () => {
    let fixture: ComponentFixture<TestApp>;
    let filterBarDebugElement: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [TestApp] })
            .overrideComponent(KbqPipeMultiSelectComponent, {
                set: { providers: [{ provide: KbqBasePipe, useExisting: KbqPipeMultiSelectComponent }] }
            })
            .compileComponents();

        vi.useFakeTimers();

        fixture = TestBed.createComponent(TestApp);
        filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
    });

    afterEach(() => vi.useRealTimers());

    const getPipe = (): KbqPipeMultiSelectComponent =>
        fixture.debugElement.query(By.css('kbq-pipe-multi-select')).componentInstance;

    const settle = async () => {
        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();
        fixture.detectChanges();
    };

    const openAndToggleAll = async () => {
        await settle();
        getPipe().select().open();
        await settle();
        getPipe().toggleSelectionAll();
        await settle();
    };

    it('control: a partial selection emits the pipe object held in the filter', async () => {
        await openAndToggleAll();
        // Second toggle deselects everything: not "all selected", so the pipe's own data is emitted.
        getPipe().toggleSelectionAll();
        await settle();

        const filterBar: KbqFilterBar = filterBarDebugElement.componentInstance;
        const emitted = fixture.componentInstance.changes.at(-1)!;

        expect(emitted).toBe(filterBar.filter()!.pipes[0]);
    });

    it('DEFECT: selecting every option emits a copy of the pipe that removePipe cannot find', async () => {
        await openAndToggleAll();

        const filterBar: KbqFilterBar = filterBarDebugElement.componentInstance;
        const pipeInFilter = filterBar.filter()!.pipes[0];
        const emitted = fixture.componentInstance.changes.at(-1)!;

        expect(getPipe().allOptionsSelected).toBe(true);
        expect(pipeInFilter).toBe(getPipe().data);
        expect(emitted.value).toEqual([]);

        expect(emitted).not.toBe(pipeInFilter);
        expect(filterBar.filter()!.pipes.includes(emitted)).toBe(false);

        filterBar.removePipe(emitted);
        fixture.detectChanges();

        expect(filterBar.filter()!.pipes.length).toBe(1);
    });
});
